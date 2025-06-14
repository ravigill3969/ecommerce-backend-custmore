import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { catchAsync } from "./asyncHandler";
import { AppError } from "./AppError";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user: string; // User id as string
    }
  }
}

const verifyToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Ensure cookie-parser middleware is used in your app to have req.cookies populated
    const token = req.cookies?.etoken;

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Find user by id in DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists!", 401));
    }

    req.user = user._id.toString();

    next();
  }
);

export default verifyToken;
