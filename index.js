const express = require("express");
const { Server } = require("socket.io");

// Create an Express application
const app = express();
const PORT = 8000;

// Middleware to parse JSON requests
app.use(express.json());

// Initialize Socket.IO with the Express server
const httpServer = require("http").createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this for production
    methods: ["GET", "POST"],
  },
});

// Maps to manage socket connections
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

// Example HTTP route
app.get("/api/status", (req, res) => {
  res.json({ status: "Server is running" });
});

// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
