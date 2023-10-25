const express = require('express');
const router = express.Router();
// const { validarToken } = require('../auth/validaToken');
// const { validarUser } = require('../middleware/validUser');
const { controllerUser } = require("../controller/indexController");

// User
router.get('/all',  controllerUser.getAll);
router.post('/one', controllerUser.getUser);

module.exports = router;