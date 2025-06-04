import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/asyncHandler";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({}, { strict: false })
);

export const getAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await Product.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: products.length,
      message: "products reterived",
      products,
    });
  }
);

export const getProductWithId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError("Product nolonger available", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);
