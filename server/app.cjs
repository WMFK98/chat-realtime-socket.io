const express = require("express");
const path = require("path");
const app = express();
const socketio = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

// Serve static files from the React app
app.use(cors());
app.get("/", (req, res) => {
  res.render("index");
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = socketio(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust to match your frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New user connected");
  socket.username = "Anonymous";
  socket.on("change_username", (data) => {
    socket.username = data.username;
  });

  socket.on("change_username", (data) => {
    console.log("change user");
    socket.username = data.username;
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", { username: socket.username });
  });

  socket.on("new_message", (data) => {
    console.log("new messsage");
    io.sockets.emit("receive_message", {
      message: data.message,
      username: socket.username,
    });
  });
});
