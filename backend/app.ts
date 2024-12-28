import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { errorMiddleware } from "./middleware/error";
import userRouter from "./routers/userRouter";
import dotenv from 'dotenv';
// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'backend/config/config.env' });
}
import session from "express-session"
import "./config/passport";
import passport from "passport";


const app = express();

app.use(session({
    secret: "abe lode sun",
    resave: false,
    saveUninitialized: false
}))

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));



// initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/v1/user", userRouter)

app.use(errorMiddleware)

export default app;