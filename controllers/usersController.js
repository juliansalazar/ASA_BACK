const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const crypto = require('crypto');

// Función de registro
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email and password');
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generarToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// Función de login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcryptjs.compare(password, user.password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generarToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Función para recuperar la contraseña
const resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Por favor proporciona un correo electrónico');
    }

    // Verificar si el correo existe
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('No se encontró un usuario con ese correo');
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Actualizar usuario con token y expiración
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hora
    await user.save();

    // URL de recuperación (ajusta según tu frontend)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;

    // Opciones del correo
    const mailOptions = {
        from: '"Autocarest" <juliansalazarvelez94@gmail.com>',
        to: email,
        subject: 'Recuperación de contraseña',
        html: `
            <h2>Restablecimiento de contraseña</h2>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Este enlace expirará en 1 hora.</p>
        `,
    };

    try {
        console.log('Intentando enviar correo a:', email);
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente');
        res.status(200).json({ message: 'Enlace de recuperación enviado a tu correo' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        // Revertir cambios si falla el envío
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.status(500);
        throw new Error('Error al enviar el correo de recuperación');
    }
});

// Función para actualizar la contraseña
const updatePassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        res.status(400);
        throw new Error('Por favor proporciona el token y la nueva contraseña');
    }

    // Verificar si el token es válido
    const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiration: { $gt: Date.now() } 
    });
    if (!user) {
        res.status(400);
        throw new Error('Token inválido o expirado');
    }

    // Hash de la nueva contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Actualizar la contraseña del usuario
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida con éxito' });
});

// Función de datos de usuario
const data = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// Función para generar un token JWT
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Exportar todas las funciones
module.exports = {
    login,
    register,
    resetPassword,
    updatePassword,
    data,
};