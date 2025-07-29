const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ROTAS ESPECÍFICAS PRIMEIRO (sem parâmetros)
router.get('/date-range', orderController.getOrdersByDateRange);
router.get('/recent', orderController.getRecentOrders);
router.get('/stats/general', orderController.getGeneralStats);
router.get('/stats/sales-summary', orderController.getSalesSummary);
router.get('/stats/top-products', orderController.getTopProducts);

// ROTAS BÁSICAS (com parâmetros por último)
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;