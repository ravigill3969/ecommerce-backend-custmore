// src/controllers/cartController.ts
import { Request, Response, NextFunction } from "express";
import { Cart } from "../models/cart";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Product } from "./product";
import User from "../models/user";

export const addToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user as string;

    const { productId, price } = req.body;

    const existingCart = await Cart.findOne({ userId, status: "Initialized" });

    if (!existingCart) {
      const cart = await Cart.create({
        userId,
        items: [{ productId, quantity: 1, price }],
      });

      console.log(cart._id);
      return res.status(201).json({
        success: true,
        message: "Cart created successfully",
      });
    }

    const existingItem = existingCart.items.find((item) => {
      return item.productId.toString() === productId.toString();
    });

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.price += price;
    } else {
      existingCart.items.push({ productId, quantity: 1, price });
    }

    await existingCart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  }
);

export const getCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await Cart.findOne({
      userId: req.user,
      status: "Initialized",
    });

    if (!cart) {
      return next(new AppError("Cart is empty!", 200));
    }

    const products = await Promise.all(
      cart.items.map((item) => Product.findById(item.productId))
    );

    res.status(200).json({
      success: true,
      message: "Cart retrieved",
      cart,
      products,
    });
  }
);

export const incrementProductQuantity = async (
  productId: string,
  userId: string
): Promise<boolean> => {
  const cart = await Cart.findOne({ userId, status: "Initialized" });

  if (!cart) return false;

  const item = cart.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (item) {
    item.quantity += 1;
    await cart.save();
    return true;
  }
  return false;
};

export const decrementProductQuantity = async (
  productId: string,
  userId: string
): Promise<boolean> => {
  const cart = await Cart.findOne({ userId, status: "Initialized" });

  if (!cart) return false;

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (itemIndex === -1) return false;

  const item = cart.items[itemIndex];

  if (item.quantity === 1) {
    cart.items.splice(itemIndex, 1);
  } else {
    item.quantity -= 1;
  }

  await cart.save();
  return true;
};

export const getAlreadyPaidOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user);

    if (!user) {
      return next(new AppError("User no longer exists!", 401));
    }

    const cartIDs = user.prevOrders;

    console.log(cartIDs);

    const carts = await Cart.find({
      _id: { $in: cartIDs },
    }).lean();

    res.status(200).json({
      status: "success",
      message: "all prev orders reterieved",
      carts,
    });
  }
);
