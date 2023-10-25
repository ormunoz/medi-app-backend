const express = require('express');
const router = express.Router();
// const { validarToken } = require('../auth/validaToken');
// const { validarUser } = require('../middleware/validUser');
const { controllerUser } = require("../controller/indexController");

// User
router.get('/allUser',  controllerUser.getAll);
router.post('/one', controllerUser.getUser);
router.post('/register', controllerUser.useRegister);
router.delete('/delete/:id', controllerUser.deleteUser);

module.exports = router;