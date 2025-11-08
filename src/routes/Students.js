const express = require('express');
const router  = express.Router();
const controllersStudents = require('../controllers/Students');

router.post('/', controllersStudents.createStudent);
router.get('/', controllersStudents.getStudentsAll);



module.exports = router;