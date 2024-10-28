const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configure CORS
app.use(
  cors({
    origin: "https://metrixcolorchange.netlify.app", // Replace with the frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    const { type, data } = parsedMessage;

    // Broadcast to all connected clients except the sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  });

  ws.send(JSON.stringify({ message: "Connected to WebRTC signaling server!" }));
});

server.listen(5000, () => {
  console.log("WebSocket signaling server running on port 5000");
});
