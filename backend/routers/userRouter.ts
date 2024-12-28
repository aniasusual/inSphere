import { getUserDetails, loginUser, registerUser } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import dotenv from 'dotenv';
import { sendToken } from "../utils/jwtToken";
// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'backend/config/config.env' });
}

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

userRouter.get(
    "/google/redirect",
    passport.authenticate("google", {
        scope: ["email", "profile"],
        successRedirect: process.env.FRONTEND_URL as string,
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        failureMessage: true,

    }),
);


userRouter.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });
    res.redirect("/");
});

export default userRouter;
