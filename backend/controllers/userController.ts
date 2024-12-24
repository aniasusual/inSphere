import { NextFunction, Request, Response } from "express"
import { userModel } from "../models/User";
import { ErrorHandler } from "../utils/errorHandler";
import { sendEmail } from "../utils/apifeatures";
import crypto from "crypto";
import { sendToken } from "../utils/jwtToken";

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const { firstName, lastName, email, password, username } = req.body;
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            username,
            password,
            verificationToken,
            isVerified: false
        });

        if (!user) {
            return next(new ErrorHandler("User creation failed", 500));
        }

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the link: \n\n ${verificationUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            user
        });


    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not created due to an unknown error",
                error: "Unknown error"
            });
        }
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return next(new ErrorHandler("Please enter username and password", 400));

        }
        const user = await userModel.findOne({ username }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));

        }

        if (!user.isVerified) {
            const verificationToken = crypto.randomBytes(32).toString('hex');

            const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
            const message = `Please verify your email by clicking on the link: \n\n ${verificationUrl}`;

            await sendEmail({
                email: user.email,
                subject: 'Email Verification',
                message,
            });
            // return next(new ErrorHandler("Please verify your email to login", 401));
            res.status(500).json({
                status: "verification",
                message: "You are not verified. Email Sent for Verification. Please verify 🙄"
            })

        }
        else
            sendToken(user, 200, res);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
}

export const getUserDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await userModel.findById(req.user?._id);

        res.status(200).json({
            status: "success",
            message: "User Loaded",
            user
        })

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
}