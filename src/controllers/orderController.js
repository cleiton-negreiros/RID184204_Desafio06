const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Obter todos os pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar um novo pedido
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod } = req.body;
    
    if (!customer || !items || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Cliente, itens e método de pagamento são obrigatórios' 
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Pelo menos um item deve ser fornecido' 
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          message: 'Cada item deve ter produto e quantidade válida' 
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          message: `Produto ${item.product} não encontrado` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}` 
        });
      }
      
      const validatedItem = {
        product: item.product,
        quantity: item.quantity,
        price: product.price
      };
      
      validatedItems.push(validatedItem);
      totalAmount += product.price * item.quantity;
    }

    for (let i = 0; i < validatedItems.length; i++) {
      const item = validatedItems[i];
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    const order = new Order({
      customer,
      items: validatedItems,
      totalAmount,
      paymentMethod
    });
    
    const savedOrder = await order.save();

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name price');
      
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Atualizar status do pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancelar pedido
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Pedido já foi cancelado' });
    }
    
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({ message: 'Pedido cancelado com sucesso', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter pedidos por período
exports.getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate e endDate são obrigatórios' 
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('customer', 'name email')
    .populate('items.product', 'name price')
    .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deletar pedido
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({ 
        message: 'Não é possível deletar um pedido já entregue' 
      });
    }
    
    // Devolver itens ao estoque se necessário
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }
    
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pedido removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Estatísticas gerais
exports.getGeneralStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });
    
    res.status(200).json({
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resumo de vendas
exports.getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(monthlySales[0] || { totalSales: 0, totalOrders: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Produtos mais vendidos
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);
    
    res.status(200).json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pedidos recentes
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Middleware para tratamento centralizado de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Erro de validação',
      errors
    });
  }

  // Erro de cast (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID inválido fornecido'
    });
  }

  // Erro de duplicação (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} já existe no sistema`
    });
  }

  // Erro padrão
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
};

module.exports = {
  getAllOrders: exports.getAllOrders,
  getOrderById: exports.getOrderById,
  createOrder: exports.createOrder,
  updateOrderStatus: exports.updateOrderStatus,
  cancelOrder: exports.cancelOrder,
  getOrdersByDateRange: exports.getOrdersByDateRange,
  deleteOrder: exports.deleteOrder,
  getGeneralStats: exports.getGeneralStats,
  getSalesSummary: exports.getSalesSummary,
  getTopProducts: exports.getTopProducts,
  getRecentOrders: exports.getRecentOrders,
  errorHandler
};

