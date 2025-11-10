const express = require('express');
const router  = express.Router();
const controllersStudents = require('../controllers/Students');
const { authMiddleware } = require('../middleware/Students');

router.post('/', controllersStudents.createStudent);
router.get('/', controllersStudents.getStudentsAll);
router.post('/login', controllersStudents.login);
router.get('/me', authMiddleware ,controllersStudents.me);



module.exports = router;