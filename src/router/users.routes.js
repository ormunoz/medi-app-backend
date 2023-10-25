const express = require('express');
const router = express.Router();
// const { validarToken } = require('../auth/validaToken');
// const { validarUser } = require('../middleware/validUser');
const { controllerUser } = require("../controller/indexController");

// User
router.post('/login', controllerUser.userlogin);
router.post('/register', controllerUser.useRegister);
router.get('/allUser',  controllerUser.getAll);
router.post('/one', controllerUser.getUser);
// no actualiza correctamente
router.put('/update/:id',  controllerUser.UpdateUser);
router.delete('/delete/:id', controllerUser.deleteUser);

module.exports = router;