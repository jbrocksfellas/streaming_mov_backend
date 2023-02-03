const { connections, rooms } = require("../store");

exports.createRoom = () => {
  try {
    const { id } = req.body;

    if (rooms[id]) {
      rooms[id].push({ name, socketId });
    } else {
    }

    console.log(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: { code: 500, status: "Internal Server Error", message: err.message } });
  }
};
