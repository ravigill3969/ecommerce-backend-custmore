import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { catchAsync } from "./asyncHandler";
import { AppError } from "./AppError";
import redis from "./redis/i";
import { sendResWithCookies } from "../controllers/user";

declare global {
  namespace Express {
    interface Request {
      user: string;
    }
  }
}

const accessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists!", 401));
    }

    req.user = user._id.toString();

    next();
  }
);

export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      id: string;
    };

    const redisStoredToken = await redis.get(`refresh:${decoded.id}`);

    if (redisStoredToken != token) {
      return next(new AppError("Please login", 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists!", 401));
    }

    sendResWithCookies(decoded.id, res);
  }
);

export default accessToken;
