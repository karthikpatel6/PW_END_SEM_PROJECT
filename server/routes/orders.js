/* ============================================
   SpiceRoute - Order Routes
   POST  /api/orders                        - Place order (customer)
   GET   /api/orders/track/:tokenNumber     - Track order (customer)
   GET   /api/orders/kitchen/:restaurantId  - Kitchen order queue
   PATCH /api/orders/:id/status             - Update order status (kitchen)
   GET   /api/orders/:id                    - Get single order
   GET   /api/orders/table/:restaurantId/:tableNumber - Table orders
   ============================================ */

const express = require('express');
const router = express.Router();
const {
  placeOrder,
  trackOrder,
  getKitchenOrders,
  updateOrderStatus,
  getOrder,
  getTableOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - Customers can place and track orders without login
router.post('/', placeOrder);
router.get('/track/:tokenNumber', trackOrder);
router.get('/table/:restaurantId/:tableNumber', getTableOrders);

// Protected routes - Kitchen and manager staff
router.get('/kitchen/:restaurantId', protect, authorize('kitchen', 'manager'), getKitchenOrders);
router.patch('/:id/status', protect, authorize('kitchen', 'manager'), updateOrderStatus);
router.get('/:id', getOrder);

module.exports = router;
