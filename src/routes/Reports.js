const express = require("express");
const router = express.Router();
const controllersStudents = require('../controllers/Students');


router.get("/relatorios/active", controllersStudents.getStudentsActive);
router.get("/relatorios/inactive", controllersStudents.getStudentsInactive);
router.get("/relatorios/byTurma", controllersStudents.getAllTurmasWithStudents);

module.exports = router;