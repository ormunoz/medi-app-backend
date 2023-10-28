
const sendOk = (res, message, data, code = 200) => {
    return res.status(code).json({
        status: true,
        message,
        data,
    });
}

const sendOk204 = (res, message, result, code = 204) => {
    return res.status(code).json({
        status: true,
        message,
    });
}

const badRequest = (res, message, result, code = 400) => {
    return res.status(code).json({
        status: false,
        message,
        data: result
    });
}


const denegateeAccess = (res, message, result, code = 401) => {
    return res.status(code).json({
        status: false,
        message,
        data: result
    });
}

const permissonDegate = (res, message, code = 403) => {
    return res.status(code).json({
        status: false,
        message
    });
}

const internalError = (res, message, result, code = 500) => {
    return res.status(code).json({
        status: false,
        message,
        data: result
    });
}

module.exports = {
    sendOk,
    badRequest,
    internalError,
    denegateeAccess,
    sendOk204,
    permissonDegate
}
