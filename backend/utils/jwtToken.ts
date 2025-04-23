import { CookieOptions, Response } from "express";
import { IUser } from "../models/User";

const sendToken = async (user: IUser, statusCode: number, res: Response): Promise<void> => {
    const token = user.getJWTToken();

    user.authToken = token;
    await user.save();

    const options: CookieOptions = {
        expires: new Date(
            Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    });
};

export { sendToken };
