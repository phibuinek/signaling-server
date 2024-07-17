const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let chatHistory = {}; // Lưu trữ lịch sử chat

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("startLivestream", (userId) => {
    socket.join(userId); // Join room based on user's ID
    if (chatHistory[userId]) {
      socket.emit("loadMessages", chatHistory[userId]); // Gửi lại lịch sử chat cho người dùng
    }
  });

  socket.on("sendMessage", (message) => {
    const { instructorId } = message;
    if (!chatHistory[instructorId]) {
      chatHistory[instructorId] = [];
    }
    chatHistory[instructorId].push(message);
    io.to(instructorId).emit("receiveMessage", message); // Gửi tin nhắn tới room cụ thể
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
