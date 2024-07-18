const mongoose = require('mongoose')

const placaSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    placa: {
        type: String,
        required: [true, "Por favor ingresa tu placa vehicular"]
    },
    brand: {
        type: String,
        required: [true, "Por favor ingresa la marca de tu vehiculo"]
    },
    model: {
        type: String,
        required: [true, "Por favor ingresa el modelo de tu vehiculo"]
    },
    owner: {
        type: String,
        required: [true, "Por favor ingresa el nombre del propietario"]
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Placa', placaSchema)