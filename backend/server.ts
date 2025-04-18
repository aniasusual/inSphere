import app from "./app";
import connectDatabase from "./config/database";
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    config({ path: 'config/config.env' });
}

import { v2 as cloudinary } from "cloudinary";
import { authenticateToken } from "./utils/socketAuthenticator";

// Error handling
process.on("uncaughtException", (err: Error) => {
    console.error(`Error: ${err.message}`);
    console.error(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export const userSocketIDs = new Map<string, string>();

// Get port from environment or use default
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Create HTTP server with production settings
const httpServer = createServer(app);

// Configure Socket.IO with production settings
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e8, // 100MB
    connectTimeout: 45000,
    allowUpgrades: true,
    perMessageDeflate: true
});

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Start server
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        });

        // Handle server errors
        httpServer.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Set Socket.IO instance on app
app.set("io", io);

// Socket.IO authentication middleware
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

    userSocketIDs.set(userId.toString(), socket.id);

    console.log("userSocketIDs", userSocketIDs);
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

    // Add these voice call related socket events in your io.on('connection') block

    socket.on('voiceOffer', ({ offer, targetUserId }) => {
        console.log("targetUserId", targetUserId);
        const targetSocketId = userSocketIDs.get(targetUserId);
        console.log("userSocketIDs", userSocketIDs);
        if (targetSocketId) {
            console.log(`Forwarding voice offer from ${socket.id} to ${targetSocketId}`);
            io.to(targetSocketId).emit('voiceOffer', {
                offer,
                fromUserId: userId
            });
        } else {
            console.log(`Target user ${targetUserId} not found for voice offer`);
            // Inform caller that target is not available
            socket.emit('userUnavailable', { targetUserId });
        }
    });

    socket.on('voiceAnswer', ({ answer, targetUserId }) => {
        const targetSocketId = userSocketIDs.get(targetUserId);
        if (targetSocketId) {
            console.log(`Forwarding voice answer from ${socket.id} to ${targetSocketId}`);
            io.to(targetSocketId).emit('voiceAnswer', {
                answer,
                fromUserId: userId
            });
        } else {
            console.log(`Target user ${targetUserId} not found for voice answer`);
        }
    });

    socket.on('voiceCandidate', ({ candidate, targetUserId }) => {

        const targetSocketId = userSocketIDs.get(targetUserId);
        if (targetSocketId) {
            console.log(`Forwarding ICE candidate from ${socket.id} to ${targetSocketId}`);
            io.to(targetSocketId).emit('voiceCandidate', {
                candidate,
                fromUserId: userId
            });
        } else {
            console.log(`Target user ${targetUserId} not found for ICE candidate`);
        }
    });

    // Add this to handle disconnects more gracefully
    socket.on('endCall', ({ targetUserId }) => {
        const targetSocketId = userSocketIDs.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('callEnded', { fromUserId: userId });
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

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
    console.error(`Error: ${err.message}`);
    console.error(`Shutting down the server due to Unhandled Promise Rejection`);

    httpServer.close(() => {
        process.exit(1);
    });
});

// Start the server
startServer();

