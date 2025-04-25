import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/errorHandler';
import { userModel } from '../models/User';

interface DecodedData {
    id: string;
    exp?: number;
}

// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.cookies;
        const googleToken = req.cookies["connect.sid"];
        const sessionUser = req.user; // Passport stores user in req.user

        console.log("sessionUser: ", sessionUser);

        if (token) {
            try {
                const decodedData = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedData;

                // Check if token is expired
                if (decodedData.exp && decodedData.exp < Date.now() / 1000) {
                    res.clearCookie('token');
                    res.clearCookie('connect.sid');
                    return next(new ErrorHandler("Session expired. Please login again.", 401));
                }

                req.user = await userModel.findById(decodedData.id);
            } catch (error) {
                // If token verification fails, clear cookies and redirect
                res.clearCookie('token');
                res.clearCookie('connect.sid');
                return next(new ErrorHandler("Invalid token. Please login again.", 401));
            }
        }
        else if (sessionUser) {
            req.user = await userModel.findById(sessionUser._id);
        }

        if (!token && !googleToken) {
            return next(new ErrorHandler("You are not logged in", 401));
        }

        next();
    } catch (error) {
        console.error("Error in middleware/auth:", error);
        next(error);
    }
};