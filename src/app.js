const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Inicializar Express
const app = express();

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    message: 'API DNCommerce funcionando!',
    version: '1.0.0',
    status: 'online'
  });
});

// Carregar rotas individualmente para debug
console.log('Carregando rotas...');

try {
  const productRoutes = require('./routes/productRoutes');
  app.use('/api/products', productRoutes);
  console.log('✓ Rotas de produtos carregadas');
} catch (error) {
  console.error('✗ Erro ao carregar rotas de produtos:', error.message);
}

try {
  const customerRoutes = require('./routes/customerRoutes');
  app.use('/api/customers', customerRoutes);
  console.log('✓ Rotas de clientes carregadas');
} catch (error) {
  console.error('✗ Erro ao carregar rotas de clientes:', error.message);
}

try {
  const orderRoutes = require('./routes/orderRoutes');
  app.use('/api/orders', orderRoutes);
  console.log('✓ Rotas de pedidos carregadas');
} catch (error) {
  console.error('✗ Erro ao carregar rotas de pedidos:', error.message);
}

try {
  const dashboardRoutes = require('./routes/dashboardRoutes');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✓ Rotas de dashboard carregadas');
} catch (error) {
  console.error('✗ Erro ao carregar rotas de dashboard:', error.message);
}

try {
  const categoryRoutes = require('./routes/categoryRoutes');
  app.use('/api/categories', categoryRoutes);
  console.log('✓ Rotas de categorias carregadas');
} catch (error) {
  console.error('✗ Erro ao carregar rotas de categorias:', error.message);
}

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
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
  console.log(`📊 API: http://localhost:${PORT}`);
});
