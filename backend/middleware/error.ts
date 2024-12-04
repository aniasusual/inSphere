import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";

// Error handling middleware
export const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong Mongodb Id error
    if (err.name === "CastError" && (err as any).path) {
        const message = `Resource not found. Invalid: ${(err as any).path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if ((err as any).code === 11000 && (err as any).keyValue) {
        const message = `Duplicate ${Object.keys((err as any).keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        err = new ErrorHandler(message, 400);
    }

    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again `;
        err = new ErrorHandler(message, 400);
    }

    // Send response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

// Try-catch wrapper for asynchronous functions
export const TryCatch = (passedFunc: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await passedFunc(req, res, next);
        } catch (error) {
            console.log("TryCatch Error:", error);
            next(error); // Pass the error to the error middleware
        }
    };
};