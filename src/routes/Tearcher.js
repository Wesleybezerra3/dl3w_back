const express = require('express');
const router = express.Router();
const controllersTeacher = require('../controllers/Teacher');
const { authMiddleware } = require('../middleware/Teacher');
const validateIdentity = require('../middleware/Validate')

// console.log("CONTROLLER FUNÇÕES:", controllersTeacher);

router.get('/', controllersTeacher.getAllTeacher);
router.get('/getByMatricula', controllersTeacher.getByMatricula);
router.post('/', validateIdentity, controllersTeacher.createTeacher);
router.post('/login', controllersTeacher.login);
router.get('/me', authMiddleware, controllersTeacher.me);
router.get('/search', controllersTeacher.searchTeacher);
router.post("/add-discipline", controllersTeacher.addDisciplineToTeacher);
router.put("/", controllersTeacher.updateTeacher);


router.put("/change-status", controllersTeacher.changeStatus);
router.put("/reset-password", controllersTeacher.resetPassword);
module.exports = router;