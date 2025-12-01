const express = require('express');
const router  = express.Router();
const controllersDiscipline = require('../controllers/Discipline');

router.get('/',controllersDiscipline.getAllDiscipline);


module.exports = router;