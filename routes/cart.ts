import express from "express";
import verifyToken from "../utils/verifyToken";
import { addToCart, getCart } from "../controllers/cart";

const cartRouter = express.Router();

cartRouter.post("/create-cart", verifyToken, addToCart);
cartRouter.get("/get-cart", verifyToken, getCart);

export default cartRouter;
