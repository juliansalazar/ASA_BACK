const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
    console.log('MONGO_URI:', process.env.MONGO_URI); // Verifica que se cargue
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;