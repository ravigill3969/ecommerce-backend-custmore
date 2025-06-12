import express from "express";
import verifyToken from "../utils/verifyToken";
import {
  createPaymentIntent,
  handle_payment_success,
} from "../controllers/stripe";

const stripeRouter = express.Router();

stripeRouter.post("/create-payment-intent", verifyToken, createPaymentIntent);
stripeRouter.post("/success-payment", verifyToken, handle_payment_success);

export default stripeRouter;
