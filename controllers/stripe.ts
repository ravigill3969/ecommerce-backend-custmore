import Stripe from "stripe";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Product } from "../controllers/product";
import KafkaProducer from "../utils/kafka/kafka-producer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartItem = {
  productId: string;
  quantity: number;
};

type CreatePaymentIntentBodyT = {
  data: CartItem[];
  cartId: string;
};

export const createPaymentIntent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { data, cartId }: CreatePaymentIntentBodyT = req.body;

    const productIds = data.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (!products.length) {
      return next(new AppError("No products found for given IDs", 400));
    }

    const line_items = [];

    for (const cartItem of data) {
      const product = products.find(
        (p) => p._id!.toString() === cartItem.productId
      );
      if (!product) continue;

      if (!product.stripeProductId) {
        const stripeProduct = await stripe.products.create({
          name: product.productName,
          description: product.description,
          images: product.photoURLs || [],
        });

        product.stripeProductId = stripeProduct.id;
        await product.save();
      }

      const price = await stripe.prices.create({
        product: product.stripeProductId,
        unit_amount: Math.round(product.price * 100),
        currency: "usd",
      });

      line_items.push({
        price: price.id,
        quantity: cartItem.quantity,
      });
    }

    if (line_items.length === 0) {
      return next(new AppError("No valid products found in cart", 400));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: { cartId },
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  }
);

export const handle_payment_success = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || !session.payment_intent) {
      return next(new AppError("Session not found or incomplete", 404));
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    if (paymentIntent.status !== "succeeded") {
      return next(new AppError("Payment not completed", 402));
    }

    const cartID = session.metadata?.cartId;

    if (!cartID) {
      return res.status(400).json({ error: "Missing cart_id in metadata" });
    }

    try {
      await KafkaProducer(cartID);
    } catch (err) {
      return next(new AppError("Internal error: Kafka dispatch failed", 500));
    }

    return res.status(200).json({
      paid: true,
      amount: paymentIntent.amount,
      email: session.customer_details?.email,
      metadata: session.metadata,
    });
  }
);
