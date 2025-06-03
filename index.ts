import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { AppError } from "./utils/AppError";
import { errorHandler } from "./utils/errorHandler";
import userRouter from "./routes/user";

dotenv.config();

mongoose
  .connect(process.env.MONGO_DB_URI!)
  .then((e) => {
    console.log("connected to db: " + e.version);
  })
  .catch((e) => {
    console.log("coonection failed to DB");
  });

const app = express();

app.use(express.json(   ))

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("server is running:", PORT);
});

app.use("/auth/v1", userRouter);
app.use(errorHandler);

app.all("{*splat}", (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
