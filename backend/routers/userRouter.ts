import { getUserDetails, loginUser, registerUser } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
import { Router } from "express";
import passport from "passport";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/load-user").get(isAuthenticated, getUserDetails);


// GOOGLE
userRouter.get(
    "/google",
    passport.authenticate("google", {
        scope: ["email", "profile"],
    })
);

userRouter.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    res.send("This is the callback route");
});

export default userRouter;
