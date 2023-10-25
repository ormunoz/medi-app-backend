const http = require('../helpers/http');

const validarUser = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return http.badRequest(res, 'Token de acceso no encontrado', [], 401);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return http.badRequest(res, 'Token de acceso no encontrado', [], 401);
        }

        const { user_role } = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (user_role !== "ADMIN") {
            return http.badRequest(res, 'Acceso denegado', [], 403);
        }

        next();
    } catch (error) {
        return http.internalError(res, "Error interno", error.message);
    }
}

module.exports = { validarUser };
