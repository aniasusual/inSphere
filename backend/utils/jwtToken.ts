import { Response } from "express";

interface User {
    getJWTToken: () => string;
}

const sendToken = (user: User, statusCode: number, res: Response): void => {
    const token = user.getJWTToken();

    const options = {
        expires: new Date(
            Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        // sameSite: "None",
        secure: true,
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
    });
};

export { sendToken };
