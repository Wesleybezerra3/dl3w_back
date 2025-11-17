const express = require('express');
const router = express.Router();
const controllersRooms = require('../controllers/Rooms');

router.get('/', controllersRooms.getAllRooms);
router.post('/', controllersRooms.createRoom);
router.get('/search', controllersRooms.searchRooms)

module.exports = router;