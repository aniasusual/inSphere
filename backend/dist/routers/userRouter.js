"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config({ path: 'config/config.env' });
}
const userRouter = (0, express_1.Router)();
userRouter.route("/register").post(userController_1.registerUser);
userRouter.route("/login").post(userController_1.loginUser);
userRouter.route("/logout").get(auth_1.isAuthenticated, userController_1.logout);
userRouter.route("/load-user").get(auth_1.isAuthenticated, userController_1.getUserDetails);
userRouter.route("/find-user-around").post(userController_1.findUsersAround);
userRouter.route("/update-user-location").post(auth_1.isAuthenticated, userController_1.updateUserLocation);
userRouter.route("/fetchUserById/:id").get(userController_1.fetchUserById);
userRouter.route("/follow/:id").get(auth_1.isAuthenticated, userController_1.followUser);
userRouter.route("/getSearchData").get(userController_1.getSearchData);
// GOOGLE
userRouter.get("/google", passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
}));
userRouter.get("/google/redirect", passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
}));
userRouter.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });
    res.redirect("/");
});
exports.default = userRouter;
