import app from "./app";
import connectDatabase from "./config/database";
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: 'backend/config/config.env' });
}
import cloudinary from "cloudinary";
import { authenticateToken } from "./utils/socketAuthenticator";

process.on("uncaughtException", (err: Error) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export const userSocketIDs = new Map();


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true // Add this if you're using credentials

    },
});

connectDatabase();
httpServer.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

app.set("io", io);


// const server = app.listen(process.env.PORT, () => {
//     console.log(`Server is working on http://localhost:${process.env.PORT}`);
// });

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (typeof token === 'string') {
            const user = await authenticateToken(token);
            socket.data.user = user;
            next();
        } else {
            next(new Error('Invalid token'));
        }
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});


io.on('connection', (socket) => {

    const userId = socket.data.user?._id;

    userSocketIDs.set(userId, socket.id);


    console.log(`User ${userId} connected`);

    if (!userId) {
        socket.emit('error', { message: 'Unauthorized access.' });
        socket.disconnect();
        return;
    }

    // // Join user's personal room
    // socket.join(`user:${userId}`);
    // socket.on('disconnect', () => {
    //     socket.rooms.forEach((room) => {
    //         socket.leave(room);
    //     });
    // });


    socket.on('joinJam', (jamId: string) => {
        socket.join(jamId);
        io.to(jamId).emit('message', `${socket.id} joined the jam!`);
    });

    socket.on('chatMessage', (jamId: string, msg: string) => {
        io.to(jamId).emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

});


process.on("unhandledRejection", (err: Error) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    httpServer.close(() => {
        process.exit(1);
    });

});

