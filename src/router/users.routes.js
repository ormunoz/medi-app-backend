const express = require('express');
const router = express.Router();
const { validarToken } = require('../auth/validaToken');
const { validarUser } = require('../middleware/validUser');
const { controllerUser } = require("../controller/indexController");

// User
router.post('/login', controllerUser.userlogin);
router.get('/me', [validarToken, validarUser], controllerUser.getUserToken);
router.post('/logout', [validarToken, validarUser], controllerUser.userLogout);
router.post('/register', controllerUser.useRegister);
router.get('/all_users', [validarToken, validarUser], controllerUser.getAll);
router.get('/all_patients', [validarToken, validarUser], controllerUser.getPatient);
router.get('/all_profesional', [validarToken, validarUser], controllerUser.getProfesional);
router.post('/one_option_patient', [validarToken, validarUser], controllerUser.optionPatient);
router.post('/one', [validarToken, validarUser], controllerUser.getUser);
router.put('/update/:id', [validarToken, validarUser], controllerUser.UpdateUser);
router.delete('/delete/:id', [validarToken, validarUser], controllerUser.deleteUser);

module.exports = router;