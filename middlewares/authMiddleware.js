const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    // Verificar si el encabezado Authorization existe y comienza con 'Bearer'
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Acceso no autorizado, no se proporcionó un token');
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    try {
        // Verificar el token y decodificarlo
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET no está configurado en el servidor');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar al usuario y excluir la contraseña
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401);
            throw new Error('Usuario no encontrado, token inválido');
        }

        // Asignar el usuario a req.user y pasar al siguiente middleware
        req.user = user;
        next();
    } catch (error) {
        // Manejar errores específicos de JWT
        if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Token expirado, por favor inicia sesión nuevamente');
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Token inválido');
        }
        res.status(401);
        throw error; // Relanzar otros errores para que asyncHandler los maneje
    }
});

module.exports = { protect };