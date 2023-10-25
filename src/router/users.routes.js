const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { sendOk, badRequest, internalError, sendOk204, permissonDegate } = require("../helpers/http");
const prisma = new PrismaClient()
require('dotenv').config();

// obtener datos del usuario logeado
const getUserToken = async (req, res) => {
    try {
        return sendOk(res, "Usuario validado correctamente")
    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};

// trae a un usuario en especifico
const getUser = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                profesional: true,
                patients: true,
            },
        });

        if (!user) {
            return badRequest(res, "no se encontro nigun usuario");
        } else {
            return sendOk(res, "Usuario agregado correctamente", user);
        }
    } catch (error) {
        return internalError(res, "Error inesperado", error);
    }
};


const getAll = async (req, res) => {
    try {
      const allUsers = await prisma.user.findMany({
        include: {
            profesional: true,
            patients: true,
        }
      });
  
      return sendOk(res, "Usuario Encontrados", allUsers);
  
    } catch (error) {
      res.json({ message: error.message });
    }
  };

module.exports = {
    getUserToken,
    getUser,
    getAll
};