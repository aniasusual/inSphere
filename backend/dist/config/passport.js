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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = __importDefault(require("passport-google-oauth20"));
const User_1 = require("../models/User");
const GoogleStrategy = passport_google_oauth20_1.default.Strategy;
passport_1.default.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        // Check if the email already exists
        let user = yield User_1.userModel.findOne({ email });
        if (user) {
            // If the email exists, check if it's linked with Google
            if (!user.googleId) {
                // Link Google account with the existing user
                user.googleId = profile.id;
                // user.save();
            }
            const token = user.getJWTToken();
            user.authToken = token;
            yield user.save();
            return done(null, user); // Log the user in
        }
        else {
            // Create a new user if the email doesn't exist
            function generateRandomUsername() {
                const adjectives = ["fast", "cool", "smart", "brave", "funny", "sneaky", "happy"];
                const animals = ["tiger", "panda", "eagle", "lion", "shark", "wolf", "koala"];
                const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
                const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
                const randomNum = Math.floor(Math.random() * 10000);
                return `${randomAdj}${randomAnimal}${randomNum}`;
            }
            const username = generateRandomUsername();
            // let count = 1;
            // // Keep trying until you find an available username
            // while (await userModel.findOne({ username })) {
            //     username = `${baseUsername}${count++}`;
            // }
            user = yield User_1.userModel.create({
                email,
                username,
                googleId: profile.id,
                firstName: ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.givenName) || "",
                lastName: ((_c = profile.name) === null || _c === void 0 ? void 0 : _c.familyName) || "",
                isVerified: true, // Optionally set verified since Google email is verified
            });
            const token = user.getJWTToken();
            user.authToken = token;
            yield user.save();
            return done(null, user);
        }
    }
    catch (error) {
        return done(error, false);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.userModel.findById(id);
    done(null, user);
}));
