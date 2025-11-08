const express = require('express');
const router  = express.Router();
const controllersAdm = require('../controllers/Adm');
const {authentication}= require('../middleware/Adm');




router.post('/login', controllersAdm.login);
router.get('/me', authentication ,controllersAdm.me);


module.exports = router;