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


const app = express();

app.use(session({
    secret: "abe lode sun",
    resave: false,
    saveUninitialized: false
}))

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        resave: true,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
    origin: "http://localhost:5173",
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