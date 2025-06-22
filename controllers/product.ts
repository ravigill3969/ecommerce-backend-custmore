import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/asyncHandler";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import User from "../models/user";
import { json } from "stream/consumers";

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

export const addProductToUserWishList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;

    if (!productId) {
      return next(new AppError("Product is required", 403));
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      {
        $addToSet: { wishList: productId },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "added to wishlist",
    });
  }
);

export const removeProductFromUserWishList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;

    if (!productId) {
      return next(new AppError("Product is required", 403));
    }

    await User.findByIdAndUpdate(req.user, {
      $pull: { wishList: productId },
    });

    res.status(200).json({
      success: true,
      message: "removed from wishlist",
    });
  }
);

export const getRecentlyAddedProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10; // optional limit from query string

    const products = await Product.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  }
);

export const getWishlistProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const ids = user.wishList;

    const products = await Product.find({
      _id: { $in: ids },
    }).lean();

    res.status(200).json({
      message: "wishlist products retrieved",
      status: "success",
      products,
    });
  }
);

export const searchProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const filter: any = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }
    filter.isActive = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    const products = await Product.find(filter)
      .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: products.length,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      data: { products },
    });
  }
);
