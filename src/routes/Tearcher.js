const express = require('express');
const router  = express.Router();
const controllersTeacher = require('../controllers/Teacher');

router.get('/', controllersTeacher.getAllTeacher);
router.post('/', controllersTeacher.createTeacher);


module.exports = router;