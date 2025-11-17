const express = require('express');
const router  = express.Router();
const controllersRooms = require('../controllers/Rooms');

router.get('/', controllersRooms.getAllRooms);
router.post('/', controllersRooms.createRoom);

module.exports = router;