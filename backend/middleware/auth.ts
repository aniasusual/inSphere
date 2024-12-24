import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/errorHandler';
import userModel from '../models/User';

interface DecodedData {
    id: string;
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new ErrorHandler("Please Login to access this resource", 401));
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedData;

        req.user = await userModel.findById(decodedData.id);

        console.log("req.user:", req.user);

        next();
    } catch (error) {
        console.error("Error in middleware/auth:", error);
        next(error);
    }
};