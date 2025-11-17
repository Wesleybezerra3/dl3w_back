const express = require('express');
const router  = express.Router();
const controllersRooms = require('../controllers/Rooms');

router.get('/', controllersRooms.getAllRooms);

module.exports = router;