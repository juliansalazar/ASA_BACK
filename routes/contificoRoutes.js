const express = require('express');
const router = express.Router();

router.get('/client-id', async (req, res) => {
  const { identificacion, tipo } = req.query;
  const apiKey = process.env.CONTIFICO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Clave API no definida' });
  }

  if (!identificacion || !tipo) {
    return res.status(400).json({ error: 'Faltan parámetros: identificacion y tipo' });
  }

  try {
    const response = await fetch(
      `https://api.contifico.com/sistema/api/v1/persona/?${tipo}=${identificacion}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const userData = await response.json();
    if (userData.length > 0) {
      res.status(200).json({ id: userData[0].id });
    } else {
      res.status(404).json({ error: 'No se encontró el ID del cliente' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ID del cliente: ' + error.message });
  }
});

router.get('/invoices', async (req, res) => {
  const { persona_id, startDate, endDate } = req.query;
  const apiKey = process.env.CONTIFICO_API_KEY;
  console.log('apiKey: ' + apiKey);
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Clave API no definida' });
  }

  if (!persona_id) {
    return res.status(400).json({ error: 'Faltan parámetros: persona_id' });
  }

  try {
    let url = `https://api.contifico.com/sistema/api/v1/documento/?persona_id=${persona_id}&tipo_documento=FAC`;
    if (startDate) url += `&fecha_inicial=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&fecha_final=${encodeURIComponent(endDate)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const filtered = Array.isArray(data) ? data.filter((invoice) => invoice.tipo_documento === 'FAC') : [];
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar las facturas: ' + error.message });
  }
});

module.exports = router;