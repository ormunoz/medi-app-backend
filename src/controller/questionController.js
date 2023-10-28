const { PrismaClient } = require('@prisma/client');
const { sendOk, badRequest, internalError, sendOk204, permissonDegate } = require("../helpers/http");
const prisma = new PrismaClient()
require('dotenv').config();

// obteniendo una pregunta y sus respuestas
const getQuestion = async (req, res) => {
    try {
        const { id } = req.body;
        const getQuestion = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                option: {
                    orderBy: {
                        indice: 'asc',
                    }
                },
            },
            orderBy: {
                indice: 'asc',
            },
        });
        if (!getQuestion) {
            return badRequest(res, "No se encontró ninguna pregunta");
        } else {
            return sendOk(res, "Pregunta encontrada correctamente", user);
        }
    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};


// trae a todas preguntas y sus opciones asociadas
const getAll = async (req, res) => {
    try {
        const allQuestions = await prisma.questions.findMany({
            include: {
                option: {
                    orderBy: {
                        indice: 'asc',
                    }
                },
            },
            orderBy: {
                indice: 'asc',
            },
        });

        return sendOk(res, "preguntas Encontradas", allQuestions);

    } catch (error) {
        res.json({ message: error.message });
    }
};

// Crear una opción una por una asociada a una pregunta
const createOption = async (req, res) => {
    try {
        const { text, score, question_id, indice } = req.body;

        if (!text || !score || !question_id || !indice) return badRequest(res, "Debes ingresar todos los datos necesarios para crear una opción.");

        const optionExist = await prisma.option.findMany({
            where: {
                text,
                question_id
            },
        });
        if (optionExist.length == 0) {
            await prisma.option.create({
                data: {
                    text,
                    score,
                    question_id,
                    indice
                },
            });
        } else {
            return badRequest(res, "esta alternativa ya existe para la pregunta");
        }


        return sendOk(res, "Opción creada correctamente");

    } catch (error) {
        return internalError(res, "Error inesperado al crear la opción", error);
    }
};

// Crear una pregunta
const createQuestion = async (req, res) => {
    try {
        const { question, indice } = req.body;

        if (!question || !indice) return badRequest(res, "Debes ingresar una pregunta y al menos una opción.");

        const questionExist = await prisma.questions.findMany({
            where: {
                question,
            },
        });
        if (questionExist.length == 0 || questionExist.length == 1) {
            await prisma.questions.create({
                data: {
                    indice,
                    question
                },
            });
        } else {
            return badRequest(res, "Ya existe esta pregunta");
        }

        return sendOk(res, "Pregunta creada correctamente");

    } catch (error) {
        return internalError(res, "Error inesperado al crear la pregunta", error);
    }
};

// actualizaremos una pregunta
const updateQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const { question, indice } = req.body;

        if (!question || !indice) return badRequest(res, `debes ingresar todos los datos`);

        const questionFind = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!questionFind) {
            return res.status(404).json({ message: 'pregunta no encontrada.' });
        }
        const questionExist = await prisma.questions.findMany({
            where: {
                question,
            },
        });

        if (questionExist.length == 0 || questionExist.length == 1) {
            await prisma.$transaction([
                prisma.questions.update({
                    where: { id: parseInt(id) },
                    data: {
                        question,
                        indice
                    },
                }),
            ]);
        } else {
            return badRequest(res, "Ya existe esta pregunta");
        }



        return sendOk(res, "pregunta Actualizada Correctamente", req.body);

    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};

// actualizacion de alternativa segun id
const updateOption = async (req, res) => {
    try {
        const id = req.params.id;
        const { text, score, indice } = req.body;

        if (!text || !score || !indice) return badRequest(res, `debes ingresar todos los datos`);

        const option = await prisma.option.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!option) {
            return res.status(404).json({ message: 'respuestas no encontrada.' });
        }

        const optionExist = await prisma.option.findMany({
            where: {
                text,
                question_id: option.question_id
            },
        });

        if (optionExist.length == 0 || optionExist.length == 1) {
            await prisma.$transaction([
                prisma.option.update({
                    where: { id: parseInt(id) },
                    data: {
                        text, score, indice
                    },
                }),
            ]);
        } else {
            return badRequest(res, "Ya existe esta alternativa");
        }


        return sendOk(res, "opcion Actualizada Correctamente", req.body);

    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};

// eliminamos una pregunta y sus opciones asociadas
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            }
        });

        if (!question) {
            return res.status(404).json({ message: 'Pregunta no encontrado.' });
        }

        const deleteOption = prisma.option.deleteMany({
            where: {
                question_id: parseInt(id),
            },
        });


        const deleteQuestion = prisma.questions.delete({
            where: {
                id: parseInt(id),
            },
        });

        const transaction = await prisma.$transaction([deleteOption, deleteQuestion]);

        sendOk204(res, "Pregunta y respuestas Eliminadas Correctamente");

    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};

const deleteOption = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await prisma.option.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!question) {
            return res.status(404).json({ message: 'Alternativa no encontrada.' });
        }

        deletePatientsOptions = prisma.patients_options.deleteMany({
            where: {
                option_id: parseInt(id),
            },
        });

        const deleteOption = prisma.option.delete({
            where: {
                id: parseInt(id),
            },
        });

        const transaction = await prisma.$transaction([deleteOption, deletePatientsOptions]);

        sendOk204(res, "Alternativa Eliminada Correctamente");

    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};

module.exports = {
    getAll,
    getQuestion,
    createOption,
    createQuestion,
    updateQuestion,
    updateOption,
    deleteQuestion,
    deleteOption
};