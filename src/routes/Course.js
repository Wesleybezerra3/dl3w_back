const express = require('express');
const router  = express.Router();
const controllersCourse = require('../controllers/Course');

router.get('/alunos_por_curso', controllersCourse.getStudentsByCourse);

module.exports = router;