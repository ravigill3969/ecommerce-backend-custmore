import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import sendResponse from "../utils/sendResponse";

function accessToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
}

export function sendResWithCookies(id: string, res: Response) {
  const token = accessToken(id);

  res.cookie("etoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: true,
    message: "Success",
  });
}

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (!user) {
      return next(new AppError("Unable to register", 500));
    }

    sendResWithCookies(user._id.toString(), res);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      next(new AppError("All fields are required", 400));
      return;
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      next(new AppError("Invalid credentials!", 409));
      return;
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      next(new AppError("Invalid credentials!", 409));
      return;
    }

    sendResWithCookies(existingUser._id.toString(), res);
  }
);
