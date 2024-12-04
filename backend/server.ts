import app from "./app";
import connectDatabase from "./config/database";
import dotenv from 'dotenv';
import cloudinary from "cloudinary";

process.on("uncaughtException", (err: Error) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

// Config
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'backend/config/config.env' });
}

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});

connectDatabase();


