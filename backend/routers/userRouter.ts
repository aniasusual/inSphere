import { fetchUserById, findUsersAround, followUser, getSearchData, getUserDetails, loginUser, logout, registerUser, updateUserAvatar, updateUserLocation } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import dotenv from 'dotenv';
import { sendToken } from "../utils/jwtToken";
// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'config/config.env' });
}

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(isAuthenticated, logout);
userRouter.route("/load-user").get(isAuthenticated, getUserDetails);
userRouter.route("/find-user-around").post(findUsersAround);
userRouter.route("/update-user-location").post(isAuthenticated, updateUserLocation);
userRouter.route("/fetchUserById/:id").get(fetchUserById);
userRouter.route("/follow/:id").get(isAuthenticated, followUser);
userRouter.route("/getSearchData").get(getSearchData);
userRouter.route("/update-avatar").post(isAuthenticated, updateUserAvatar);


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

    })
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
