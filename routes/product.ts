import express from "express";
import {
  addProductToUserWishList,
  getAllProducts,
  getProductWithId,
  getRecentlyAddedProducts,
  removeProductFromUserWishList,
  searchProducts,
} from "../controllers/product";

const productRouter = express.Router();

productRouter.get("/get-all-products", getAllProducts);
productRouter.get("/get-product-id/:id", getProductWithId);
productRouter.get("/add-to-wishlist", addProductToUserWishList);
productRouter.get("/remove-from-wishlist", removeProductFromUserWishList);
productRouter.get("/recent-add-products", getRecentlyAddedProducts);
productRouter.get("search", searchProducts);

export default productRouter;
