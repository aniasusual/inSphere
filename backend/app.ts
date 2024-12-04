import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { errorMiddleware } from "./middleware/error";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    // origin: "https://anywhere-co.vercel.app",
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(errorMiddleware)

export default app;