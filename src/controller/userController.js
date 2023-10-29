const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { sendOk, badRequest, internalError, sendOk204, permissionDenied } = require("../helpers/http");
const prisma = new PrismaClient();
require('dotenv').config();

// User login
const userLogin = async (req, res) => {
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
      return badRequest(res, "User with this rut does not exist", rut);
    }

    const hashedPassword = user.password;
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return badRequest(res, "Incorrect password", password);
    }

    const secretKey = process.env.SECRET_TOKEN;
    const token = jwt.sign(
      { user_id: user.id, user_rut: user.rut, user_role: user.role }, secretKey, { expiresIn: '3h' }
    );

    return sendOk(res, "User logged in successfully", { token, user });
  } catch (error) {
    return internalError(res, "Unexpected error", error);
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

// Get data of the logged-in user
const getUserToken = async (req, res) => {
  try {
    return sendOk(res, "User validated successfully");
  } catch (error) {
    return internalError(res, "Unexpected error", error);
  }
};

// Retrieve a specific user
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
      }
    });

    if (!user) {
      return badRequest(res, "User not found");
    } else {
      return sendOk(res, "User found successfully", user);
    }
  } catch (error) {
    return internalError(res, "Unexpected error", error);
  }
};

// Retrieve all registered users, including professionals and patients
const getAll = async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany({
      include: {
        profesional: true,
        patients: true,
      },
    });

    return sendOk(res, "Users found", allUsers);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// Get all patients associated with a professional
const getPatient = async (req, res) => {
  try {
    const allUsers = await prisma.patients.findMany({
      include: {
        profesional: true,
        user: true,
      },
    });

    return sendOk(res, "Users found", allUsers);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// Get all professionals
const getProfessional = async (req, res) => {
  try {
    const allUsers = await prisma.profesional.findMany({
      include: {
        user: true,
      },
    });

    return sendOk(res, "Users found", allUsers);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// Register a user
const userRegister = async (req, res) => {
  const { email, city, total_score, option } = req.body;
  const { especiality, name, last_name, min_score, max_score } = req.body;
  const { rut, password, role } = req.body;

  if (!name || !last_name || !rut || !role) return badRequest(res, `You must fill in all required fields`);
  if (role === 'ADMIN') {
    if (!especiality || !min_score || !max_score) return badRequest(res, `You must fill in all required fields`);
  } else {
    if (!email || !city) return badRequest(res, `You must fill in all required fields`);
  }

  await prisma.$transaction(async (prisma) => {
    const userExists = await prisma.user.findMany({
      where: {
        rut,
      },
    });

    const especialityExists = await prisma.profesional.findMany({
      where: {
        especiality,
      },
    });

    if (userExists.length > 0) {
      return badRequest(res, "The user is already registered");
    } else if (especialityExists.length > 0 && role === 'ADMIN') {
      return badRequest(res, "The specialty is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        rut,
        role,
        password: hashedPassword,
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
      return badRequest(res, "The user was not added", { newUser });
    }

    return sendOk(res, "User added successfully", {
      _id: newUser.id,
      rut: newUser.rut,
      role: newUser.role,
    });
  }).catch((error) => {
    return internalError(res, "Unexpected error", error);
  });
};

// Update a user (not updating, check)
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, city, assigned_professional, total_score } = req.body;
    const { especiality, name, last_name, min_score, max_score } = req.body;
    const { rut, role, user_id } = req.body;

    if (!name || !last_name || !rut || !role) return badRequest(res, `You must fill in all required fields`);
    if (role === 'ADMIN') {
      if (!especiality || !min_score || !max_score) return badRequest(res, `You must fill in all required fields`);
    } else {
      if (!email || !city) return badRequest(res, `You must fill in all required fields`);
    }

    let updateInfo;

    await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        rut,
      },
    });

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
      });
    } else {
      updateInfo = await prisma.patients.update({
        where: {
          user_id: parseInt(id),
        },
        data: {
          email, city, assigned_professional, total_score, name, last_name,
        },
      });
    }

    return sendOk(res, "Record Updated Successfully", req.body);
  } catch (error) {
    return internalError(res, "Unexpected error", error);
  }
};

// Delete a user
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
      return res.status(404).json({ message: 'User not found.' });
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
        }
      });
    }

    const deleteUser = prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });

    const transaction = await prisma.$transaction([deleteInfo, deleteUser]);
    sendOk204(res, "User Deleted Successfully");
  } catch (error) {
    return internalError(res, "Unexpected error", error);
  }
};
const optionForPatient = async (req, res) => {
  try {
    const { id } = req.body;
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

    return sendOk(res, "Patients and options found", optionsForPatient);
  } catch (error) {
    return internalError(res, "Unexpected error", error);
  }
};

module.exports = {
  getUserToken,
  getUser,
  getAll,
  getPatient,
  getProfessional,
  userRegister,
  deleteUser,
  userLogin,
  userLogout,
  updateUser,
  optionForPatient
};
