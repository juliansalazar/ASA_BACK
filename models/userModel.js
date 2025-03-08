const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        resetToken: {
            type: String,  // Token de recuperación de contraseña
            required: false,  // No es necesario en la creación del usuario
        },
        resetTokenExpiration: {
            type: Date,  // Fecha de expiración del token
            required: false,  // No es necesario en la creación del usuario
        },
    },
    {
        timestamps: true,  // Añade createdAt y updatedAt automáticamente
    }
);

module.exports = mongoose.model('User', userSchema);
