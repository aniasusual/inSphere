"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../utils/errorHandler");
const User_1 = require("../models/User");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.cookies;
        const googleToken = req.cookies["connect.sid"];
        const sessionUser = req.user; // Passport stores user in req.user
        console.log("sessionUser: ", sessionUser);
        if (token) {
            try {
                const decodedData = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                // Check if token is expired
                if (decodedData.exp && decodedData.exp < Date.now() / 1000) {
                    res.clearCookie('token');
                    res.clearCookie('connect.sid');
                    return next(new errorHandler_1.ErrorHandler("Session expired. Please login again.", 401));
                }
                req.user = yield User_1.userModel.findById(decodedData.id);
            }
            catch (error) {
                // If token verification fails, clear cookies and redirect
                res.clearCookie('token');
                res.clearCookie('connect.sid');
                return next(new errorHandler_1.ErrorHandler("Invalid token. Please login again.", 401));
            }
        }
        else if (sessionUser) {
            req.user = yield User_1.userModel.findById(sessionUser._id);
        }
        if (!token && !googleToken) {
            return next(new errorHandler_1.ErrorHandler("You are not logged in", 401));
        }
        next();
    }
    catch (error) {
        console.error("Error in middleware/auth:", error);
        next(error);
    }
});
exports.isAuthenticated = isAuthenticated;
