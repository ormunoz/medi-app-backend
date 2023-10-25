const http = require("../helpers/http");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const validarToken = (req, res, next) => {
  const statusCodeErr = 401;

  if (req.headers.hasOwnProperty('authorization') && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.slice(7);
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decodedToken) => {
      if (err) {
        return http.badRequest(res, "TOKEN INVALIDO", [], statusCodeErr);
      } else {
        req.user = decodedToken;
        return next();
      }
    });
  } else {
    return http.badRequest(res, "Token de acceso no encontrado", [], statusCodeErr);
  }
};

module.exports = {
  validarToken,
};
