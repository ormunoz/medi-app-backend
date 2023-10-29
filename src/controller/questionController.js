const { PrismaClient } = require('@prisma/client');
const { sendOk, badRequest, internalError, sendOk204, permissionDeny } = require("../helpers/http");
const prisma = new PrismaClient();
require('dotenv').config();

// Fetching a question and its answers
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
            return badRequest(res, "No question found");
        } else {
            return sendOk(res, "Question found successfully", user);
        }
    } catch (error) {
        return internalError(res, "Unexpected error", error);
    }
};

// Fetch all questions and their associated options
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

        return sendOk(res, "Questions found", allQuestions);

    } catch (error) {
        res.json({ message: error.message });
    }
};

// Create an option one by one associated with a question
const createOption = async (req, res) => {
    try {
        const { text, score, question_id, indice } = req.body;

        if (!text || !score || !question_id || !indice) return badRequest(res, "You must enter all the necessary data to create an option.");

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
            return badRequest(res, "This option already exists for the question");
        }

        return sendOk(res, "Option created successfully");

    } catch (error) {
        return internalError(res, "Unexpected error while creating the option", error);
    }
};

// Create a question
const createQuestion = async (req, res) => {
    try {
        const { question, indice } = req.body;

        if (!question || !indice) return badRequest(res, "You must enter a question and at least one option.");

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
            return badRequest(res, "This question already exists");
        }

        return sendOk(res, "Question created successfully");

    } catch (error) {
        return internalError(res, "Unexpected error while creating the question", error);
    }
};

// Update a question
const updateQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const { question, indice } = req.body;

        if (!question || !indice) return badRequest(res, `You must enter all the data`);

        const questionFind = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!questionFind) {
            return res.status(404).json({ message: 'Question not found.' });
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
            return badRequest(res, "This question already exists");
        }

        return sendOk(res, "Question Updated Successfully", req.body);

    } catch (error) {
        return internalError(res, "Unexpected error", error);
    }
};

// Update an option by ID
const updateOption = async (req, res) => {
    try {
        const id = req.params.id;
        const { text, score, indice } = req.body;

        if (!text || !score || !indice) return badRequest(res, `You must enter all the data`);

        const option = await prisma.option.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!option) {
            return res.status(404).json({ message: 'Option not found.' });
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
            return badRequest(res, "This option already exists");
        }

        return sendOk(res, "Option Updated Successfully", req.body);

    } catch (error) {
        return internalError(res, "Unexpected error", error);
    }
};

// Delete a question and its associated options
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await prisma.questions.findUnique({
            where: {
                id: parseInt(id),
            }
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
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

        sendOk204(res, "Question and answers deleted successfully");

    } catch (error) {
        return internalError(res, "Unexpected error", error);
    }
};

// Delete an option by ID
const deleteOption = async (req, res) => {
    try {
        const { id } = req.params;
        const option = await prisma.option.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!option) {
            return res.status(404).json({ message: 'Option not found.' });
        }

        const deletePatientsOptions = prisma.patients_options.deleteMany({
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

        sendOk204(res, "Option deleted successfully");

    } catch (error) {
        return internalError(res, "Unexpected error", error);
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
