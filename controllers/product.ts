import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/asyncHandler";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

// Base product structure (no Mongoose methods)
export interface IProduct {
  productName: string;
  sellerID: mongoose.Types.ObjectId;
  price: number;
  stockQuantity: number;
  category: string;
  brand: string;
  description: string;
  photoURLs: string[];
  isActive: boolean;
  stripeProductId?: string;
}

export interface IProductDocument extends IProduct, mongoose.Document {}

const productSchema = new mongoose.Schema<IProductDocument>(
  {
    productName: { type: String, required: true },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    photoURLs: [{ type: String }],
    isActive: { type: Boolean, default: true },
    stripeProductId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProductDocument>(
  "Product",
  productSchema
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
