const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configurações compatíveis com Mongoose 8.x
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dncommerce', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    // Event listeners para monitorar a conexão
    mongoose.connection.on('error', (err) => {
      console.error('Erro de conexão MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado');
    });
    
  } catch (error) {
    console.error(`Erro de conexão com MongoDB: ${error.message}`);
    console.log('Tentando novamente em 5 segundos...');
    
    // Tentar reconectar após 5 segundos
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
