const express = require('express');
const router  = express.Router();
const controllersAdm = require('../controllers/Adm');


router.post('/login', controllersAdm.login);

module.exports = router;