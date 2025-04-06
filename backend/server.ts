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

const JamUsers = new Map(); // Map<socketId, { jamId, userId, position, rotation, name }>


io.on('connection', (socket) => {

    const userId = socket.data.user?._id;

    userSocketIDs.set(userId, socket.id);
    console.log(`User ${userId} connected`);

    if (!userId) {
        socket.emit('error', { message: 'Unauthorized access.' });
        socket.disconnect();
        return;
    }

    // Handle user joining a jam
    socket.on('joinJam', ({ jamId, userId, userName, position, rotation }) => {
        socket.join(jamId); // Join the jam room
        JamUsers.set(socket.id, {
            jamId,
            userId,
            position,
            rotation,
            name: userName,
            lastUpdate: Date.now(),
        });

        // Broadcast to others in the jam that a new user joined
        socket.to(jamId).emit('userJoined', {
            userId,
            position,
            rotation,
            name: userName,
        });

        // Send current users in the jam to the new user
        const jamUsers = Array.from(JamUsers.values()).filter(
            (user) => user.jamId === jamId && user.userId !== userId
        );
        socket.emit('currentUsers', jamUsers);
    });

    // Handle movement updates
    socket.on('updateMovement', ({ userId, position, rotation }) => {
        const user = JamUsers.get(socket.id);
        if (user) {
            user.position = position;
            user.rotation = rotation;
            user.lastUpdate = Date.now();

            // Broadcast movement to others in the same jam
            socket.to(user.jamId).emit('userMoved', {
                userId,
                position,
                rotation,
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = JamUsers.get(socket.id);
        if (user) {
            io.to(user.jamId).emit('userLeft', { userId: user.userId });
            JamUsers.delete(socket.id);
        }
        console.log('User disconnected:', socket.id);
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

