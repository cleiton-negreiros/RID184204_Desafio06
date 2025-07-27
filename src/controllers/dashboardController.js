const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Estatísticas gerais
exports.getGeneralStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0
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
    
    const monthlyOrders = await Order.find({
      createdAt: { $gte: startOfMonth }
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Produtos mais vendidos
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.product', 
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
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
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
