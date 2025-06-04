// src/controllers/cartController.ts
import { Request, Response, NextFunction } from "express";
import { Cart } from "../models/cart";
import { catchAsync } from "../utils/asyncHandler";

export const addToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user as string;

    const { productId, price } = req.body;

    const existingCart = await Cart.findOne({ userId });

    if (!existingCart) {
      await Cart.create({
        userId,
        items: [{ productId, quantity: 1, price }],
      });

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
      message: "Cart already exists or updated",
    });
  }
);


