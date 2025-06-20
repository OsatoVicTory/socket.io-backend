const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const server = require("http").createServer(app);
const socket = require("socket.io");

app.use(express.json())
app.use(cors({ origin: true, methods: "GET,HEAD,POST,PUT,PATCH,DELETE", credentials: true }));

app.use("/", () => {
    console.log("checked");
});

const port = process.env.PORT || 3030;

const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    // for survey app, data is { _id: string, answers: number[] }
    socket.on("response", (data) => {
        io.emit("response", data);
    });

    // for chit-chat app
    socket.on("userOnline", (data) => {
        io.emit("userOnline", data);
    });

    socket.on("userOffline", (data) => {
        io.emit("userOffline", data);
    });

    socket.on("sendMessage", (message) => {
        io.to(message.receiver).emit("sendMessage", message);
    });

    socket.on("deleteMessage", (message) => {
        // message should have userSocketId, which is the socketId of deleter
        io.to(message.receiver).emit("deleteMessage", message);
    });

    socket.on("readMessage", (message) => {
        io.to(message.receiver).emit("readMessage", { userSocketId: message.reader });
    });

    socket.on("typingMessage", (message) => {
        io.to(message.receiver).emit("typingMessage", { userSocketId: message.typer, isTyping: message.isTyping });
    });

    socket.on("stream-data", (data) => {
        io.to(data.to).emit("stream-data", data);
    });

    socket.on("call-user", (data) => {
        io.to(data.to).emit("call-user", data);
    });

    socket.on("call-accepted", (data) => {
        io.to(data.to).emit("call-accepted", data);
    });

    socket.on("end-call", (data) => {
        io.to(data.to).emit("ended-call", data);
    });

    socket.on("user-in-call", (data) => {
        io.to(data.to).emit("user-in-call", data);
    });

    // socket.on("disconnect", (id) => {
    //     io.emit("userOffline", id);
    // });
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});