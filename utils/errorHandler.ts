import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import dotenv from "dotenv";

dotenv.config({});

interface ErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string>;
  stack?: string;
  error?: any;
}

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
}

interface MongoValidationError extends Error {
  errors: {
    [path: string]: {
      message: string;
    };
  };
}

interface MongoCastError extends Error {
  path?: string;
  value?: string;
}

const sendDevError = (err: AppError, res: Response): void => {
  const response: ErrorResponse = {
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
    error: err,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(err.statusCode || 500).json(response);
};

const sendProdError = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    const response: ErrorResponse = {
      status: err.status,
      message: err.message,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  console.error("ERROR 💥", err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

const handleMongoDBDuplicateKeyError = (err: MongoError): AppError => {
  if (!err.keyValue) {
    return new AppError("Duplicate field value", 409);
  }

  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = ${value}. Please use another value!`;
  return new AppError(message, 409);
};

const handleMongoDBValidationError = (err: MongoValidationError): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 422);
};

const handleMongoDBCastError = (err: MongoCastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // Handle specific errors
  if (error.code === 11000)
    error = handleMongoDBDuplicateKeyError(error as MongoError);
  if (error.name === "ValidationError")
    error = handleMongoDBValidationError(error);
  if (error.name === "CastError")
    error = handleMongoDBCastError(error as MongoCastError);


  if (error.name === "JsonWebTokenError")
    error = new AppError("Invalid token. Please log in again!", 401);
  if (error.name === "TokenExpiredError")
    error = new AppError("Your token has expired. Please log in again!", 401);

  if (process.env.NODE_ENV === "development") {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};
