const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3001", "https://metrixcolorchange.netlify.app"], // Allow requests from this origin
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (if needed)
  },
});

// Connect to DB
connectDB();

// Enable CORS for Express
app.use(
  cors({
    origin: ["http://localhost:3001", "https://metrixcolorchange.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/users", userRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
