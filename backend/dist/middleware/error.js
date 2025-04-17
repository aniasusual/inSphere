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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatch = exports.errorMiddleware = void 0;
const errorHandler_1 = require("../utils/errorHandler");
// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    // Wrong Mongodb Id error
    if (err.name === "CastError" && err.path) {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new errorHandler_1.ErrorHandler(message, 400);
    }
    // Mongoose duplicate key error
    if (err.code === 11000 && err.keyValue) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new errorHandler_1.ErrorHandler(message, 400);
    }
    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        err = new errorHandler_1.ErrorHandler(message, 400);
    }
    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again `;
        err = new errorHandler_1.ErrorHandler(message, 400);
    }
    // Send response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.errorMiddleware = errorMiddleware;
// Try-catch wrapper for asynchronous functions
const TryCatch = (passedFunc) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield passedFunc(req, res, next);
        }
        catch (error) {
            console.log("TryCatch Error:", error);
            next(error); // Pass the error to the error middleware
        }
    });
};
exports.TryCatch = TryCatch;
