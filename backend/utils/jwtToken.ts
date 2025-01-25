import { Response } from "express";
import { IUser } from "../models/User";

const sendToken = async (user: IUser, statusCode: number, res: Response): Promise<void> => {
    const token = user.getJWTToken();

    user.authToken = token;
    await user.save();

    const options = {
        expires: new Date(
            Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
        ),
        // httpOnly: true,
        // sameSite: "None",
        secure: true,
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    });
};

export { sendToken };
