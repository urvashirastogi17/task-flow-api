import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(",")
                : ["http://localhost:5173"],

            credentials: true,
        },
    });

    // SOCKET AUTH MIDDLEWARE
    io.use((socket, next) => {

        try {

            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );

            socket.user = decoded;

            next();

        } catch (error) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {

        const userId = socket.user?._id;

        if (userId) {

            socket.join(userId);

            console.log(`User ${userId} joined room`);
        }

        console.log("User connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};

const getIO = () => {

    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};

export {
    initSocket,
    getIO
};