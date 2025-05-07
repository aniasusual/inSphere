"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const error_1 = require("./middleware/error");
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config({ path: 'config/config.env' });
}
const express_session_1 = __importDefault(require("express-session"));
require("./config/passport");
const passport_1 = __importDefault(require("passport"));
const channelRouter_1 = __importDefault(require("./routers/channelRouter"));
const postRouter_1 = __importDefault(require("./routers/postRouter"));
const commentRouter_1 = __importDefault(require("./routers/commentRouter"));
const jamsRouter_1 = __importDefault(require("./routers/jamsRouter"));
const messageRouter_1 = __importDefault(require("./routers/messageRouter"));
const chatRouter_1 = __importDefault(require("./routers/chatRouter"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const app = (0, express_1.default)();

app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
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
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api/v1/user", userRouter_1.default);
app.use("/api/v1/channel", channelRouter_1.default);
app.use("/api/v1/post", postRouter_1.default);
app.use("/api/v1/comment", commentRouter_1.default);
app.use("/api/v1/jam", jamsRouter_1.default);
app.use('/api/v1/message', messageRouter_1.default);
app.use('/api/v1/chat', chatRouter_1.default);
app.use(error_1.errorMiddleware);
exports.default = app;
