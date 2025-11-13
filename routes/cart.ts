import express from "express";
import accessToken from "../utils/verifyToken";
import {
  addToCart,
  getAlreadyPaidOrder,
  getCart,
  removeItemFromCart,
} from "../controllers/cart";

const cartRouter = express.Router();

cartRouter.post("/create-cart", accessToken, addToCart);
cartRouter.get("/get-cart", accessToken, getCart);
cartRouter.get("/get-paid-orders", accessToken, getAlreadyPaidOrder);
cartRouter.put("/remove-item-cart", accessToken, removeItemFromCart);

export default cartRouter;
