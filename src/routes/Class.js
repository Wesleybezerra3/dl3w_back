const express = require('express');
const router  = express.Router();
const controllersClass = require('../controllers/Class');

router.get('/', controllersClass.getClassesAll);

module.exports = router;