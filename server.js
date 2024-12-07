const cors = require("cors");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const chatHistory = {};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (jobId) => {
    socket.join(jobId);

    socket.emit("chatHistory", chatHistory[jobId] || []);
  });

  socket.on("sendMessage", ({ jobId, message }) => {
    if (!chatHistory[jobId]) chatHistory[jobId] = [];

    chatHistory[jobId].push(message);

    io.to(jobId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
