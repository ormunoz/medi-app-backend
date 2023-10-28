const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { sendOk, badRequest, internalError, sendOk204, permissonDegate } = require("../helpers/http");
const prisma = new PrismaClient()
require('dotenv').config();


// logeo de usuario 
const userlogin = async (req, res) => {
  try {
    const { rut, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        rut,
      },
      include: {
        profesional: true,
        patients: true,
      },
    });

    if (!user) {
      return badRequest(res, "No existe el usuario con este rut", rut);
    }

    const bdPas = user.password;
    const match = await bcrypt.compare(password, bdPas);

    if (!match) {
      return badRequest(res, "Contraseña incorrecta", password);
    }

    const secretKey = process.env.SECRET_TOKEN;
    const token = jwt.sign(
      { user_id: user.id, user_rut: user.rut, user_role: user.role }, secretKey, { expiresIn: '3h' }
    );

    return sendOk(res, "Usuario logeado correctamente", { token, user });

  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};

const userLogout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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
        patients: {
          include: {
            profesional: true,
          },
        },
      },
    });


    if (!user) {
      return badRequest(res, "no se encontro nigun usuario");
    } else {
      return sendOk(res, "Usuario encontrado correctamente", user);
    }
  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};

// trae a todos los usuarios registrados incluyendo los profesionales y los pacientes
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

// obtiene todos los pacientes asociados a un profesional
const getPatient = async (req, res) => {
  try {
    const allUsers = await prisma.patients.findMany({
      include: {
        profesional: true,
        user: true,
      }
    });

    return sendOk(res, "Usuario Encontrados", allUsers);

  } catch (error) {
    res.json({ message: error.message });
  }
};

// obtiene todos los profesional
const getProfesional = async (req, res) => {
  try {
    const allUsers = await prisma.profesional.findMany({
      include: {
        user: true,
      }
    });

    return sendOk(res, "Usuario Encontrados", allUsers);

  } catch (error) {
    res.json({ message: error.message });
  }
};
// registra a un usuario 
const useRegister = async (req, res) => {
  const { email, city, total_score, option } = req.body;
  const { especiality, name, last_name, min_score, max_score } = req.body;
  const { rut, password, role } = req.body;

  if (!name || !last_name || !rut || !role) return badRequest(res, `debes ingresar todos los campos requeridos`);
  if (role === 'ADMIN') {
    if (!especiality || !min_score || !max_score) return badRequest(res, `debes ingresar todos los campos requeridos`);
  } else {
    if (!email || !city) return badRequest(res, `debes ingresar todos los campos requeridos`);
  }


  await prisma.$transaction(async (prisma) => {
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
    } else if (especialityExist.length > 0 && role == 'ADMIN') {
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
      await prisma.profesional.create({
        data: {
          especiality,
          name,
          last_name,
          min_score,
          max_score,
          user_id: newUser.id,
        },
      });
    } else if (role === 'PATIENT') {
      const assignedProfessional = await prisma.profesional.findFirst({
        where: {
          min_score: {
            lte: total_score,
          },
          max_score: {
            gte: total_score,
          },
        },
      });

      const patient = await prisma.patients.create({
        data: {
          email,
          city,
          assigned_professional: assignedProfessional ? assignedProfessional.id : null,
          name,
          last_name,
          total_score,
          user_id: newUser.id,
        },
      });

      for (const optionId of option) {
        await prisma.patients_options.create({
          data: {
            patients_id: patient.id,
            option_id: optionId,
          },
        });
      }

    }

    if (!newUser) {
      return badRequest(res, "El usuario no fue agregado", { newUser });
    }

    return sendOk(res, "Usuario agregado correctamente", {
      _id: newUser.id,
      rut: newUser.rut,
      role: newUser.role,
    });
  }).catch((error) => {
    return internalError(res, "Error inesperado", error);
  });
};

// editar usuario no actualiza(revisar)
const UpdateUser = async (req, res) => {
  try {

    const id = req.params.id;

    const { email, city, assigned_professional, total_score } = req.body;
    const { especiality, name, last_name, min_score, max_score } = req.body;
    const { rut, role, user_id } = req.body;

    if (!name || !last_name || !rut || !role) return badRequest(res, `debes ingresar todos los campos requeridos`);
    if (role === 'ADMIN') {
      if (!especiality || !min_score || !max_score) return badRequest(res, `debes ingresar todos los campos requeridos`);
    } else {
      if (!email || !city) return badRequest(res, `debes ingresar todos los campos requeridos`);
    }

    let updateInfo;

    await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        rut
      },
    })

    if (role === 'ADMIN') {
      updateInfo = await prisma.profesional.update({
        where: {
          id: parseInt(id),
        },
        data: {
          name,
          last_name,
          especiality,
          min_score,
          max_score,
        },
      })
    } else {
      updateInfo = await prisma.patients.update({
        where: {
          user_id: parseInt(id),
        },
        data: {
          email, city, assigned_professional, total_score, name, last_name
        },
      });

    }

    return sendOk(res, "Registro Actualizado Correctamente", req.body);

  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};

// elimina a uyn usuario 
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

    const userRole = user.role;
    let deleteInfo;

    if (userRole === 'ADMIN') {
      deleteInfo = prisma.profesional.deleteMany({
        where: {
          user_id: parseInt(id),
        },
      });
    } else {
      deleteInfo = prisma.patients.deleteMany({
        where: {
          user_id: parseInt(id),
        },
      });

    }

    const deleteUser = prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });

    const transaction = await prisma.$transaction([deleteInfo, deleteUser]);
    sendOk204(res, "Usuario Eliminado Correctamente");

  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};

const optionPatient = async (req, res) => {
  try {
    const { id } = req.body
    const optionsForPatient = await prisma.patients_options.findMany({
      where: {
        patients_id: parseInt(id),
      },
      include: {
        patients: true,
        option: {
          include: {
            questions: true,
          },
        },
      },
    });

    return sendOk(res, "pacientes y opciones Encontrado", optionsForPatient);

  } catch (error) {
    return internalError(res, "Error inesperado", error);
  }
};

module.exports = {
  getUserToken,
  getUser,
  getAll,
  getPatient,
  getProfesional,
  useRegister,
  deleteUser,
  userlogin,
  userLogout,
  UpdateUser,
  optionPatient
};