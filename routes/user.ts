import express from "express";
import {
  getCurrentUser,
  login,
  register,
  updateCurrentUser,
  updateUserPassword,
  verifyUser,
} from "../controllers/user";
import verifyToken, { refreshToken } from "../utils/verifyToken";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/verify-user", verifyToken, verifyUser);
userRouter.get("/get-current-user", verifyToken, getCurrentUser);
userRouter.get("/refresh-token", refreshToken);
userRouter.put("/update-current-user", verifyToken, updateCurrentUser);
userRouter.put(
  "/update-current-user-password",
  verifyToken,
  updateUserPassword
);

export default userRouter;
