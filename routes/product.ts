import express from "express";
import {
  addProductToUserWishList,
  getAllProducts,
  getProductWithId,
  getRecentlyAddedProducts,
  getWishlistProducts,
  removeProductFromUserWishList,
  searchProducts,
} from "../controllers/product";
import accessToken from "../utils/verifyToken";

const productRouter = express.Router();

productRouter.get("/get-all-products", getAllProducts);
productRouter.get("/get-product-id/:id", getProductWithId);
productRouter.get("/search", searchProducts);
productRouter.get("/recent-add-products", getRecentlyAddedProducts);
productRouter.get("/get-wishlist-products", accessToken, getWishlistProducts);
productRouter.post("/add-to-wishlist", accessToken, addProductToUserWishList);
productRouter.post(
  "/remove-from-wishlist",
  accessToken,
  removeProductFromUserWishList
);

export default productRouter;
