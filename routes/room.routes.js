const { Router } = require("express");
const roomController = require("../controllers/room.controller");

const router = Router();

router.post("/", roomController.createRoom);

module.exports = router;
