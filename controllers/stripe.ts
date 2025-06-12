import Stripe from "stripe";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Product } from "../controllers/product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartItem = {
  productId: string;
  quantity: number;
}[];

export const createPaymentIntent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cartItems: CartItem = req.body;
    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (!products.length) {
      return next(new AppError("No products found for given IDs", 400));
    }

    const line_items = [];

    for (const cartItem of cartItems) {
      const product = products.find(
        (p) => p._id!.toString() === cartItem.productId
      );
      if (!product) continue;

      console.log(products);

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
      success_url: `${process.env.FRONTEND_URL}/`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  }
);
