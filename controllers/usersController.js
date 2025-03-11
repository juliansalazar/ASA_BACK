const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Asegúrate de instalarlo: npm install nodemailer

// Configura el transporter para enviar correos
const transporter = nodemailer.createTransport({
  service: 'gmail', // O tu servicio de correo
  auth: {
    user: process.env.EMAIL_USER, // Configura en variables de entorno
    pass: process.env.EMAIL_PASS, // Configura en variables de entorno
  },
});

// Función de registro
const register = asyncHandler(async (req, res) => {
  const { name, email, password, identificacion } = req.body;
  if (!name || !email || !password || !identificacion) {
    res.status(400);
    throw new Error('Please provide name, email, password and identification');
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
    identificacion,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      identificacion: user.identificacion,
      token: generarToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// LOGIN

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcryptjs.compare(password, user.password))) {
      const token = generarToken(user._id);
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });    
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        identificacion: user.identificacion,
        token,
        isAdmin: user.isAdmin,
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

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No se encontró un usuario con ese correo');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 3600000; // 1 hora
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Autocarest" <${process.env.EMAIL_USER}>`,
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
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Enlace de recuperación enviado a tu correo' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
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

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error('Token inválido o expirado');
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(newPassword, salt);

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

module.exports = {
  login,
  register,
  resetPassword,
  updatePassword,
  data,
};