const express = require('express');
require('dotenv').config();
const { errorHandler } = require('./middlewares/errorMiddleware.js');
const colors = require('colors');
const connectDB = require('./config/db.js');
const cors = require('cors');

const port = process.env.PORT || 8081;

connectDB();

const app = express();

//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/placas', require('./routes/placasRoutes.js'));
app.use('/api/users', require('./routes/usersRoutes.js'));
app.use('/api/products', require('./routes/productsRoutes.js'));
app.use(errorHandler);
app.listen(port, () => console.log(`listening en ${port}`));
