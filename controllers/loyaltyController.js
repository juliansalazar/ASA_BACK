const LoyaltyPoints = require('../models/loyaltyPoints');
const User = require('../models/user');
const axios = require('axios');

const apiKey = process.env.CONTIFICO_API_KEY || 'PJF858JmAbTrOBu8quv0IPaRPAQX5nbns9fsJxni4TI';

const calculatePoints = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const tipoIdentificacion = user.identificacion.length === 13 ? 'ruc' : 'cedula';
    const clientResponse = await axios.get(
      `https://api.contifico.com/sistema/api/v1/persona/?${tipoIdentificacion}=${user.identificacion}`,
      { headers: { Authorization: apiKey } }
    );

    const clientId = clientResponse.data[0]?.id;
    if (!clientId) {
      return res.status(404).json({ message: 'Cliente no encontrado en Contifico' });
    }

    const invoicesResponse = await axios.get(
      `https://api.contifico.com/sistema/api/v1/documento/?persona_id=${clientId}&tipo_documento=FAC`,
      { headers: { Authorization: apiKey } }
    );

    const invoices = invoicesResponse.data;

    // Procesar cada factura y guardar puntos
    for (const invoice of invoices) {
      const existingPoints = await LoyaltyPoints.findOne({ invoiceId: invoice.id });
      if (!existingPoints && invoice.estado === 'C') { // Solo facturas canceladas (pagadas)
        const points = parseFloat(invoice.total); // 1 punto por cada dólar (ajustable)
        await LoyaltyPoints.create({
          userId: user._id,
          invoiceId: invoice.id,
          invoiceTotal: invoice.total,
          points,
        });
      }
    }

    // Calcular el total de puntos acumulados
    const totalPoints = await LoyaltyPoints.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    res.status(200).json({
      message: 'Puntos calculados exitosamente',
      totalPoints: totalPoints[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al calcular puntos', error: error.message });
  }
};

module.exports = { calculatePoints };