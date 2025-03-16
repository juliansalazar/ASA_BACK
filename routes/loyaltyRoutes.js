  const express = require('express');
const router = express.Router();
const { getFacturas, procesarFacturas, getPuntosCliente } = require('../controllers/loyaltyController');

// Endpoint para obtener todas las facturas (opcional, para depuración o admin)
router.get('/facturas', async (req, res) => {
  try {
    const facturas = await getFacturas();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para procesar facturas y asignar puntos (puede ser llamado manualmente o por cron)
router.post('/procesar', async (req, res) => {
  try {
    const result = await procesarFacturas();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para que el frontend consulte los puntos de un cliente
router.get('/puntos/:contificoId', async (req, res) => {
  console.log('Solicitud recibida para cliente:', req.params.contificoId);
  try {
    const puntos = await getPuntosCliente(req.params.contificoId);
    res.json(puntos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;