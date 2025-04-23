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
exports.sendToken = void 0;
const sendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = user.getJWTToken();
    user.authToken = token;
    yield user.save();
    const options = {
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    });
});
exports.sendToken = sendToken;
