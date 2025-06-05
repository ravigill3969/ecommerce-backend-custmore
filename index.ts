import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { AppError } from "./utils/AppError";
import { errorHandler } from "./utils/errorHandler";
import userRouter from "./routes/user";
import productRouter from "./routes/product";
import cartRouter from "./routes/cart";
import {
  decrementProductQuantity,
  incrementProductQuantity,
} from "./controllers/cart";

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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log("server is running:", PORT);
});

io.on("connection", (socket) => {
  socket.on("cart-increment", ({ productId, userId }) => {
    console.log("Message received:", productId, userId);
    incrementProductQuantity(productId, userId);
  });
  socket.on("cart-decrement", ({ productId, userId }) => {
    console.log("Message received decrement:", productId, userId);
    decrementProductQuantity(productId, userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/auth/v1", userRouter);
app.use("/product/v1", productRouter);
app.use("/cart/v1", cartRouter);
app.use(errorHandler);

app.all("{*splat}", (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
