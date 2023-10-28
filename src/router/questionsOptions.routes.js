const express = require('express');
const router = express.Router();
const { validarToken } = require('../auth/validaToken');
const { validarUser } = require('../middleware/validUser');
const { controllerQuestion } = require("../controller/indexController");


// User
router.get('/all', [validarToken, validarUser], controllerQuestion.getAll);
router.post('/one', [validarToken, validarUser], controllerQuestion.getQuestion);
router.post('/register_option', [validarToken, validarUser], controllerQuestion.createOption);
router.post('/register_question', [validarToken, validarUser], controllerQuestion.createQuestion);
router.put('/update_question/:id', [validarToken, validarUser], controllerQuestion.updateQuestion);
router.put('/update_option/:id', [validarToken, validarUser], controllerQuestion.updateOption);
router.delete('/delete_question/:id', [validarToken, validarUser], controllerQuestion.deleteQuestion);
router.delete('/delete_option/:id', [validarToken, validarUser], controllerQuestion.deleteOption);
module.exports = router;