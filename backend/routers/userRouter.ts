import { getUserDetails, loginUser, registerUser } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
import { Router } from "express";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/load-user").post(isAuthenticated, getUserDetails);

export default userRouter;
