const express = require("express");
const { Server } = require("socket.io");
const wrtc = require("wrtc");
const { connections, rooms, isPresent, findHost } = require("./store");
const cors = require("cors");
require("dotenv").config();

const HOST = process.env.HOST;
const PORT = process.env.PORT;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
const ALLOWED_METHODS = process.env.ALLOWED_METHODS;

console.log(HOST, PORT, ALLOWED_ORIGINS, ALLOWED_METHODS);

const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, HOST, () => {
  console.log("started listening on port " + PORT);
});

const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS } });

io.on("connection", (socket) => {
  console.log("Connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected ", socket.id);
  });

  socket.on("join_room", ({ id, username }) => {
    try {
      console.log(`New Join Request by ${username} for roomId: ${id}`);
      if (id && username) {
        if (rooms[id]) {
          if (!isPresent({ roomId: id, socketId: socket.id })) {
            // request the owner for joining room
            const host = findHost({ roomId: id });
            console.log("Host: ", host.socketId);
            io.to(host.socketId).emit("join_request", { id, username, socketId: socket.id });
          }
        } else {
          rooms[id] = [{ username, socketId: socket.id, host: true }];
          socket.emit("joined_room", { id, users: rooms[id].map((user) => ({ usename: user.username, host: user.host })) });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("join_accept", ({ id, username, socketId }) => {
    try {
      console.log(`Join Accepted for Room: ${id} for user ${username} of socketId: ${socketId}`);
      rooms[id].push({ username, socketId: socketId, host: false });
      io.to(socketId).emit("joined_room", { id, users: rooms[id].map((user) => ({ usename: user.username, host: user.host })) });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("join_reject", ({ id, username, socketId }) => {
    try {
      console.log(`Join Rejected for Room: ${id} for user ${username} of socketId: ${socketId}`);

      io.to(socketId).emit("join_rejected", { status: "rejected" });
    } catch (err) {
      console.log(err);
    }
  });

  // messaging
  socket.on("message", ({ id, username, message, createdAt }) => {
    console.log(`${username} send message ${message} to ${id} at ${createdAt}`);

    const sockets = rooms[id].filter((user) => user.socketId !== socket.id).map((user) => user.socketId);
    console.log(
      rooms[id].map((r) => r.socketId),
      sockets
    );
    if (sockets.length) {
      io.to(sockets).emit("message", { id, message, username, createdAt });
    }
  });
});
