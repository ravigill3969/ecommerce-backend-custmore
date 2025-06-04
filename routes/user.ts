import express from "express";
import { login, register, verifyUser } from "../controllers/user";
import verifyToken from "../utils/verifyToken";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/verify-user", verifyToken, verifyUser);

export default userRouter;
