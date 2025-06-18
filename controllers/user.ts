import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

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
      isCustmore: true,
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

export const verifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;
    res.status(200).json({
      message: "verified",
      userId,
    });
  }
);

export const getCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("No user found", 404));
    }

    res.status(200).json({
      message: "verified",
      user,
    });
  }
);

export const updateCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;

    const { name, email } = req.body;
    console.log(req.body);

    if (!name && !email) {
      return next(new AppError("Please provide name or email to update", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: updatedUser,
    });
  }
);

export const updateUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return next(new AppError("Please fill in all password fields", 400));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new AppError("New passwords do not match", 400));
    }

    const user = await User.findById(req.user).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) {
      return next(new AppError("Your current password is incorrect", 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    sendResWithCookies(user._id, res);
  }
);
