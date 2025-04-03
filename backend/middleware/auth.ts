import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/errorHandler';
import { userModel } from '../models/User';

interface DecodedData {
    id: string;
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

        if (token) {
            const decodedData = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedData;
            req.user = await userModel.findById(decodedData.id);
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