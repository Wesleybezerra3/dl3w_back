const express = require('express');
const router = express.Router();
const controllersStudents = require('../controllers/Students');
const { authMiddleware, definePasswordMiddleware } = require('../middleware/Students');

router.post('/', controllersStudents.createStudent);
router.get('/', controllersStudents.getStudentsAll);
router.get('/getByMatricula', controllersStudents.getStudentByMatricula)
router.post('/login', controllersStudents.login);
router.post('/definir-senha', definePasswordMiddleware, controllersStudents.definePassword);
router.get('/me', authMiddleware, controllersStudents.me);
router.put('/', controllersStudents.updateStudent);

//Ações

router.put("/change-class", controllersStudents.changeClass);



module.exports = router;