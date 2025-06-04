import express from "express";
import verifyToken from "../utils/verifyToken";
import { addToCart } from "../controllers/cart";

const cartRouter = express.Router();

cartRouter.post("/create-cart", verifyToken, addToCart);

export default cartRouter;
