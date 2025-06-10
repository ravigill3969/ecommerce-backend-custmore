import express from "express";
import verifyToken from "../utils/verifyToken";
import { createPaymentIntent } from "../controllers/stripe";

const stripeRouter = express.Router();

stripeRouter.post("/create-payment-intent", verifyToken, createPaymentIntent);

export default stripeRouter;
