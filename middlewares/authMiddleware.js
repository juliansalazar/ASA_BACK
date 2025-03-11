const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Intentar obtener el token del encabezado Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Si no hay token en el encabezado, intentar obtenerlo de la cookie
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Verificar si se encontró un token
  if (!token) {
    res.status(401);
    throw new Error('Acceso no autorizado, no se proporcionó un token');
  }

  try {
    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado en el servidor');
    }

    // Verificar y decodificar el token
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

// Función para generar y enviar el token en una cookie
const generateTokenAndSendCookie = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '3d', // Puedes ajustar la expiración
  });

  // Configuración de la cookie con seguridad
  res.cookie('jwt', token, {
    httpOnly: true, // Impide el acceso al token desde JavaScript del lado del cliente
    secure: process.env.NODE_ENV === 'production', // Solo en producción si usas HTTPS
    sameSite: 'Strict', // Restringe el envío de cookies entre dominios
  });
};

module.exports = { protect, generateTokenAndSendCookie, };
