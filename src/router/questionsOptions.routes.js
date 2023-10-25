const express = require('express');
const router = express.Router();
// const { validarToken } = require('../auth/validaToken');
// const { validarUser } = require('../middleware/validUser');
const { controllerQuestion } = require("../controller/indexController");


// User
router.get('/all', controllerQuestion.getAll);
router.post('/one', controllerQuestion.getQuestion);
router.post('/register_option', controllerQuestion.createOption);
router.post('/register_question', controllerQuestion.createQuestion);
router.put('/update_question/:id', controllerQuestion.updateQuestion);
router.put('/update_option/:id', controllerQuestion.updateOption);
router.delete('/delete/:id', controllerQuestion.deleteQuestion);

module.exports = router;