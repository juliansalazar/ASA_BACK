const axios = require('axios');
const Cliente = require('../models/loyaltyModel'); // Modelo de Cliente
const Transaccion = require('../models/loyaltyModel'); // Modelo de Transacción

// URL base de la API de Contifico (ajústala según la documentación oficial)
const CONTIFICO_API_URL = 'https://api.contifico.com/sistema/api/v1/registro/documento/';

// Función para obtener facturas de Contifico
const getFacturas = async () => {
  try {
    const response = await axios.get(CONTIFICO_API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.CONTIFICO_API_TOKEN}`, // Token desde .env
      },
    });
    return response.data; // Devuelve las facturas
  } catch (error) {
    console.error('Error al obtener facturas de Contifico:', error.message);
    throw new Error('No se pudieron obtener las facturas');
  }
};

// Función para procesar facturas y asignar puntos
const procesarFacturas = async () => {
  try {
    const facturas = await getFacturas();

    for (const factura of facturas) {
      // Buscar o crear cliente en la base de datos
      let cliente = await Cliente.findOne({ contificoId: factura.cliente_id });
      if (!cliente) {
        cliente = await Cliente.create({
          contificoId: factura.cliente_id,
          nombre: factura.cliente_nombre || 'Cliente sin nombre', // Ajusta según respuesta de API
        });
      }

      // Calcular puntos (ejemplo: 1 punto por cada $10)
      const puntos = Math.floor(factura.total / 10);

      // Actualizar puntos del cliente
      await Cliente.updateOne(
        { contificoId: factura.cliente_id },
        { $inc: { puntos } } // Incrementa los puntos
      );

      // Registrar la transacción
      await Transaccion.create({
        clienteId: cliente._id,
        facturaId: factura.id,
        monto: factura.total,
        puntosOtorgados: puntos,
      });
    }
    return { message: 'Facturas procesadas y puntos asignados correctamente' };
  } catch (error) {
    console.error('Error al procesar facturas:', error.message);
    throw new Error('Error al procesar las facturas');
  }
};

// Función para obtener los puntos de un cliente específico
const getPuntosCliente = async (contificoId) => {
  try {
    const cliente = await Cliente.findOne({ contificoId });
    if (!cliente) {
      return { puntos: 0, message: 'Cliente no encontrado' };
    }
    return { puntos: cliente.puntos };
  } catch (error) {
    console.error('Error al obtener puntos:', error.message);
    throw new Error('No se pudieron obtener los puntos del cliente');
  }
};

// Exportar las funciones para usarlas en las rutas
module.exports = {
  getFacturas,
  procesarFacturas,
  getPuntosCliente,
};