const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Rotas básicas
router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.delete('/:id', orderController.cancelOrder);

// Rotas específicas
router.patch('/:id/status', orderController.updateOrderStatus);
router.get('/date/range', orderController.getOrdersByDateRange);

module.exports = router;

