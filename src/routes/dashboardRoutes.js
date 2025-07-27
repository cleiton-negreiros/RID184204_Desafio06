const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Estatísticas gerais
router.get('/stats', dashboardController.getGeneralStats);
router.get('/sales-summary', dashboardController.getSalesSummary);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/recent-orders', dashboardController.getRecentOrders);

module.exports = router;