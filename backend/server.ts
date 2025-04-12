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
    socket.on('joinJam', ({ jamId, userId, userName, position, rotation, avatarUrl }) => {
        socket.join(jamId); // Join the jam room

        console.log("User joined jam:", jamId, userId);
        JamUsers.set(socket.id, {
            jamId,
            userId,
            position,
            rotation,
            name: userName,
            avatarUrl,
            lastUpdate: Date.now(),
        });


        // Broadcast to others in the jam that a new user joined
        socket.to(jamId).emit('userJoined', {
            userId,
            position,
            rotation,
            name: userName,
            avatarUrl,
        });


        // Send system message to all users in the jam
        io.to(jamId).emit('systemMessage', {
            type: 'userJoined',
            userName,
            timestamp: Date.now()
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
                avatarUrl: user.avatarUrl,
            });
        }
    });

    // Handle user leaving jam
    socket.on('leaveJam', ({ jamId }) => {
        const user = JamUsers.get(socket.id);
        if (user) {
            // Notify other users in the jam that this user has left
            socket.to(jamId).emit('userLeftJam', {
                userId: user.userId
            });

            // Send system message to all users in the jam
            io.to(jamId).emit('systemMessage', {
                type: 'userLeft',
                userName: user.name,
                timestamp: Date.now()
            });

            // Remove user from JamUsers
            JamUsers.delete(socket.id);

            // Leave the jam room
            socket.leave(jamId);
        }
    });


    socket.on('chatMessage', ({ jamId, userId, userName, message, timestamp, nearbyUsers, isGlobal }) => {
        const user = JamUsers.get(socket.id);
        if (!user) return;

        // Get all users in the jam
        const jamUsers = Array.from(JamUsers.values()).filter(u => u.jamId === jamId);

        if (isGlobal) {
            // Send message to all users in the jam
            io.to(jamId).emit('message', {
                userId,
                userName,
                message,
                timestamp,
                type: 'global'
            });
        } else {

            if (nearbyUsers) {
                nearbyUsers.forEach((nearbyUser: any) => {
                    const nearbySocket = Array.from(JamUsers.entries())
                        .find(([_, u]) => u.userId === nearbyUser.id)?.[0];

                    if (nearbySocket) {
                        io.to(nearbySocket).emit('message', {
                            userId,
                            userName,
                            message,
                            timestamp,
                            type: 'nearby'
                        });
                    }
                });
            }
            // Send message to nearby users

            // Also send to the sender
            socket.emit('message', {
                userId,
                userName,
                message,
                timestamp,
                type: 'self'
            });
        }
    });

    socket.on('disconnect', () => {
        const user = JamUsers.get(socket.id);
        if (user) {
            // Send system message to all users in the jam
            io.to(user.jamId).emit('systemMessage', {
                type: 'userLeft',
                userName: user.name,
                timestamp: Date.now()
            });

            io.to(user.jamId).emit('userLeft', {
                userId: user.userId,
                avatarUrl: user.avatarUrl
            });
            JamUsers.delete(socket.id);
        }
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

