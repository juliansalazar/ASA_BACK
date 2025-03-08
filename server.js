const express = require('express');
require('dotenv').config();
const { errorHandler } = require('./middlewares/errorMiddleware.js');
const colors = require('colors');
const connectDB = require('./config/db.js');
const cors = require('cors');

const port = process.env.PORT || 8081;

connectDB();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Ajusta según tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Habilita el envío de cookies y credenciales
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Habilita CORS con las opciones definidas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/api/placas', require('./routes/placasRoutes.js'));
app.use('/api/users', require('./routes/usersRoutes.js'));
app.use('/api/products', require('./routes/productsRoutes.js'));

// Middleware de manejo de errores
app.use(errorHandler);

// Inicia el servidor
app.listen(port, () => console.log(`Server listening on port ${port}`.cyan));