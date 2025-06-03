import { Response } from "express";

export default function sendResponse(
  message: String | [],
  statusCode: number,
  success: Boolean,
  res: Response
) {
  res.status(statusCode).json({
    success,
    message,
  });

  return;
}
