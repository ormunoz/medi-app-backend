const { PrismaClient } = require('@prisma/client');
const { sendOk, badRequest, internalError, sendOk204, permissonDegate } = require("../helpers/http");
const prisma = new PrismaClient()
require('dotenv').config();

// obteniendo una pregunta y sus respuestas
const getQuestion = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                option: true,
            },
        });

        if (!user) {
            return badRequest(res, "no se encontro niguna pregunta");
        } else {
            return sendOk(res, "preguntas encontrado correctamente", user);
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
                option: true,
            }
        });

        return sendOk(res, "preguntas Encontradas", allQuestions);

    } catch (error) {
        res.json({ message: error.message });
    }
};

// Crear una opción una por una asociada a una pregunta
const createOption = async (req, res) => {
    try {
        const { text, score, question_id } = req.body;

        if (!text || !score || !question_id) {
            return badRequest(res, "Debes ingresar todos los datos necesarios para crear una opción.");
        }
        const option = await prisma.option.create({
            data: {
                text,
                score,
                question_id,
            },
        });

        return sendOk(res, "Opción creada correctamente", option);
    } catch (error) {
        return internalError(res, "Error inesperado al crear la opción", error);
    }
};

// Crear una pregunta
const createQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return badRequest(res, "Debes ingresar una pregunta y al menos una opción.");
        }

        const createdQuestion = await prisma.questions.create({
            data: {
                question,
            },
        });

        return sendOk(res, "Pregunta creada correctamente", createdQuestion);
    } catch (error) {
        return internalError(res, "Error inesperado al crear la pregunta", error);
    }
};

// actualizaremos una pregunta
const updateQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const { question } = req.body;

        if (!question) return badRequest(res, `debes ingresar todos los datos`);

        const questionFind = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!questionFind) {
            return res.status(404).json({ message: 'pregunta no encontrada.' });
        }

        await prisma.$transaction([
            prisma.questions.update({
                where: { id: parseInt(id) },
                data: {
                    question,
                },
            }),
        ]);

        return sendOk(res, "pregunta Actualizada Correctamente", req.body);

    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};

// actualizacion de alternativa segun id
const updateOption = async (req, res) => {
    try {
        const id = req.params.id;
        const { text, score } = req.body;

        if (!text || !score) return badRequest(res, `debes ingresar todos los datos`);

        const option = await prisma.option.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!option) {
            return res.status(404).json({ message: 'respuestas no encontrada.' });
        }

        await prisma.$transaction([
            prisma.option.update({
                where: { id: parseInt(id) },
                data: {
                    text, score
                },
            }),
        ]);

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
            },
            include: {
                option: true,
            },
        });

        if (!question) {
            return res.status(404).json({ message: 'Pregunta no encontrado.' });
        }

        deleteOption = prisma.option.deleteMany({
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

module.exports = {
    getAll,
    getQuestion,
    createOption,
    createQuestion,
    updateQuestion,
    updateOption,
    deleteQuestion
};