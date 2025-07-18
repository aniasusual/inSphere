import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../utils/secrets";
import { userModel } from "../models/User";
import { sendToken } from "../utils/jwtToken";
const GoogleStrategy = passportGoogle.Strategy;


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;

                // Check if the email already exists
                let user = await userModel.findOne({ email });

                if (user) {
                    // If the email exists, check if it's linked with Google
                    if (!user.googleId) {
                        // Link Google account with the existing user
                        user.googleId = profile.id;
                        // user.save();
                    }

                    const token = user.getJWTToken();

                    user.authToken = token;
                    await user.save();


                    return done(null, user); // Log the user in
                } else {
                    // Create a new user if the email doesn't exist
                    function generateRandomUsername(): string {
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

                    user = await userModel.create({
                        email,
                        username,
                        googleId: profile.id,
                        firstName: profile.name?.givenName || "",
                        lastName: profile.name?.familyName || "",
                        isVerified: true, // Optionally set verified since Google email is verified
                    });

                    const token = user.getJWTToken();
                    user.authToken = token;
                    await user.save();
                    return done(null, user);
                }
            } catch (error) {
                return done(error, false);
            }
        }
    )
);


passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
});


