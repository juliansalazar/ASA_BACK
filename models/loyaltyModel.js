const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  contificoId: String,
  nombre: String,
  puntos: { type: Number, default: 0 },
});

const transaccionSchema = new mongoose.Schema({
  clienteId: mongoose.Schema.Types.ObjectId,
  facturaId: String,
  monto: Number,
  puntosOtorgados: Number,
  fecha: { type: Date, default: Date.now },
});

const Cliente = mongoose.model('Cliente', clienteSchema);
const Transaccion = mongoose.model('Transaccion', transaccionSchema);