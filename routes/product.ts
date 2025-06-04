import express from "express";
import { getAllProducts, getProductWithId } from "../controllers/product";

const productRouter = express.Router();

productRouter.get("/get-all-products", getAllProducts);
productRouter.get("/get-product-id/:id", getProductWithId);

export default productRouter;
