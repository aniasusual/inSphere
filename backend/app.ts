import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { errorMiddleware } from "./middleware/error";
import userRouter from "./routers/userRouter";
import dotenv from 'dotenv';
// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'config/config.env' });
}
import session from "express-session"
import "./config/passport";
import passport from "passport";
import channelRouter from "./routers/channelRouter";
import postRouter from "./routers/postRouter";
import commentRouter from "./routers/commentRouter";
import jamRouter from "./routers/jamsRouter";
import messageRouter from "./routers/messageRouter";
import chatRouter from "./routers/chatRouter";
import MongoStore from 'connect-mongo';


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 * 5 // 1 day
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 5,
    },
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/channel", channelRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/jam", jamRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/chat', chatRouter);

app.use(errorMiddleware)

export default app;