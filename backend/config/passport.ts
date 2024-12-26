import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../utils/secrets";
import { userModel } from "../models/User";
const GoogleStrategy = passportGoogle.Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: "801439258700-rf68e1fook3351ufdkuhf3thtkqevda6.apps.googleusercontent.com",
            clientSecret: "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",
            callbackURL: "/auth/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await userModel.findById({ googleId: profile.id });

            if (!user) {
                const newUser = await userModel.create({
                    googleId: profile.id,
                    firstName: profile.displayName,
                    email: profile.emails?.[0].value,
                })

                if (newUser) {
                    done(null, newUser);
                }
            }
            else {
                done(null, user);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await userModel.findOne({ googleId: id });
    done(null, user);
});


