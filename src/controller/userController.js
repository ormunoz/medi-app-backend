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
    const user = await prisma.user.findUnique({
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


const useRegister = async (req, res) => {
  try {
    const { email, city, assigned_professional, total_score } = req.body;
    const { especiality, name, last_name, min_score, max_score } = req.body;
    const { rut, password, role } = req.body;
    const userExist = await prisma.user.findMany({
      where: {
        rut,
      },
    });

    const especialityExist = await prisma.profesional.findMany({
      where: {
        especiality,
      },
    });

    if (userExist.length > 0) {
      return badRequest(res, "El usuario ya está registrado");
    } else if (especialityExist.length > 0) {
      return badRequest(res, "La especialidad se encuentra registrada");
    }

    const contrasenaHasheada = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        rut,
        role,
        password: contrasenaHasheada,
      },
    });

    if (role === 'ADMIN') {
      // hay un problema con agregar el min y el max
      const adminInfo = await prisma.profesional.create({
        data: {
          especiality,
          name,
          last_name,
          min_score,
          max_score,
          user_id: newUser.id,
        },
      });
    } else if (role === 'PATIENTS') {
      // se debe crear logica con el score porque segun el score es el assigned_professional
      const infoExtra = await prisma.patients.create({
        data: {
          email,
          city,
          assigned_professional,
          last_name,
          total_score,
          user_id: newUser.id,
        },
      });
    }

    if (!newUser) {
      return badRequest(res, "El usuario no fue agregado", { newUser });
    }

    return sendOk(res, "Usuario agregado correctamente", {
      _id: newUser.id,
      rut: newUser.rut,
      role: newUser.role,
    });
  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        profesional: true,
        patients: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userRole = user.role; // Obtener el rol del usuario

    await prisma.$transaction([
      prisma.user.delete({
        where: {
          id: parseInt(id),
        },
      }),
      // Verificar el rol del usuario y eliminar la entidad correspondiente
      userRole === "ADMIN"
        ? prisma.profesional.delete({
          where: {
            user_id: parseInt(user.id),
          },
        })
        : prisma.patients.delete({
          where: {
            user_id: parseInt(user.id),
          },
        }),
    ]);
    
    sendOk204(res, "Usuario Eliminado Correctamente");

  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};


module.exports = {
  getUserToken,
  getUser,
  getAll,
  useRegister,
  deleteUser
};