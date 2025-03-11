const mongoose = require('mongoose');

const loyaltyPointsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceId: {
      type: String, // ID de la factura en Contifico
      required: true,
    },
    invoiceTotal: {
      type: Number, // Total de la factura para calcular puntos
      required: true,
    },
    points: {
      type: Number, // Puntos acumulados (ejemplo: 1 punto por cada dólar)
      required: true,
    },
    dateEarned: {
      type: Date, // Fecha en que se ganaron los puntos
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoyaltyPoints', loyaltyPointsSchema);