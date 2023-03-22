const connections = {};
const rooms = {};

// [{name: "gaurav", host: true}] example

function findHost({ roomId }) {
  const host = rooms[roomId].find((user) => user.host);
  return host;
}

function isPresent({ roomId, socketId }) {
  return rooms[roomId].some((user) => user.socketId === socketId);
}

module.exports = { connections, rooms, findHost, isPresent };
