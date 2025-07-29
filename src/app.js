const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

console.log('🔍 Iniciando servidor DNCommerce (modo cauteloso)...');

// Inicializar Express
const app = express();

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota inicial
app.get('/', (req, res) => {
  console.log('📨 Rota raiz acessada');
  res.json({
    message: 'API DNCommerce funcionando!',
    version: '1.0.0',
    status: 'online'
  });
});

console.log('🏠 Rota raiz configurada');

// Carregar apenas rotas básicas primeiro
try {
  console.log('🚀 Carregando rotas básicas...');

  // Rotas de categorias (sempre primeiro)
  const categoryRoutes = require('./routes/categoryRoutes');
  app.use('/api/categories', categoryRoutes);
  console.log('✓ Rotas de categorias carregadas');

  // Rotas de produtos
  const productRoutes = require('./routes/productRoutes');
  app.use('/api/products', productRoutes);
  console.log('✓ Rotas de produtos carregadas');

  // Rotas de clientes
  const customerRoutes = require('./routes/customerRoutes');
  app.use('/api/customers', customerRoutes);
  console.log('✓ Rotas de clientes carregadas');

  // Rotas de pedidos (ordenadas corretamente)
  const orderRoutes = require('./routes/orderRoutes');
  app.use('/api/orders', orderRoutes);
  console.log('✓ Rotas de pedidos carregadas');

  // COMENTAR DASHBOARD TEMPORARIAMENTE
  const dashboardRoutes = require('./routes/dashboardRoutes');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✓ Rotas de dashboard carregadas');

  console.log('✅ Rotas básicas carregadas com sucesso!');

} catch (error) {
  console.error('❌ Erro ao carregar rotas:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.log(`🔍 Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro capturado:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Porta
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API: http://localhost:3000`);
  console.log(`🏠 Rota raiz: http://localhost:3000/`);
  console.log('🎉 Sistema inicializado com sucesso!');
});

module.exports = app;