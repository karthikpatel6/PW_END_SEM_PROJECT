/* ============================================
   SpiceRoute - Order Controller
   Handles the complete order lifecycle:
   - Customer places order
   - Kitchen updates status
   - Customer tracks order in real-time
   Integrates with workload engine for
   smart wait time estimation.
   ============================================ */

const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { estimateWaitTime, calculateKitchenLoad } = require('../utils/workloadEngine');

/* ---- Generate Unique Order Token ---- */
// Creates tokens like #A-582, #B-103, etc.
const generateToken = async () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `#${letter}-${number}`;
};

/* ---- Place New Order (Customer) ---- */
// POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { restaurantId, tableNumber, items, paymentMethod, orderType } = req.body;

    // Validate input
    if (!restaurantId || !tableNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'Restaurant ID, table number, and items are required' });
    }

    // Get restaurant for tax calculation
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Build order items with details from menu
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;

      // Check if item is available and not locked
      if (!menuItem.isAvailable || menuItem.isLockedBySystem) {
        return res.status(400).json({
          message: `${menuItem.name} is currently unavailable`
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes || '',
        station: menuItem.station
      });

      subtotal += menuItem.price * item.quantity;

      // Increment order count for analytics
      menuItem.orderCount += item.quantity;
      await menuItem.save();
    }

    // Calculate tax and total
    const tax = Math.round(subtotal * (restaurant.taxRate / 100));
    const total = subtotal + tax;

    // Estimate wait time using workload engine
    const waitTimeData = await estimateWaitTime(restaurantId, orderItems);

    // Generate unique token number
    const tokenNumber = await generateToken();

    // Create the order
    const order = await Order.create({
      restaurant: restaurantId,
      tokenNumber,
      tableNumber,
      orderType: orderType || 'Dine-In',
      items: orderItems,
      status: 'placed',
      subtotal,
      tax,
      total,
      estimatedWaitTime: waitTimeData.estimatedMinutes,
      paymentMethod: paymentMethod || 'Cash',
      kitchenNote: 'Order received, waiting for kitchen confirmation'
    });

    // Emit real-time event to kitchen displays
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', {
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        tableNumber: order.tableNumber,
        items: order.items,
        orderType: order.orderType
      });
    }

    res.status(201).json({
      success: true,
      order,
      waitTime: waitTimeData
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

/* ---- Get Order by Token (Customer Tracking) ---- */
// GET /api/orders/track/:tokenNumber
const trackOrder = async (req, res) => {
  try {
    const { tokenNumber } = req.params;
    const order = await Order.findOne({ tokenNumber })
      .populate('restaurant', 'name currency');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Get current kitchen load for live pulse display
    const loadData = await calculateKitchenLoad(order.restaurant._id);

    res.json({
      success: true,
      order,
      kitchenPulse: {
        loadLevel: loadData.loadLevel,
        loadPercentage: loadData.loadPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking order' });
  }
};

/* ---- Get All Orders for Kitchen Display ---- */
// GET /api/orders/kitchen/:restaurantId
const getKitchenOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.query;

    let query = {
      restaurant: restaurantId,
      status: { $in: ['placed', 'confirmed', 'preparing'] }
    };

    // Filter by specific status if requested
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ priority: -1, placedAt: 1 }) // Priority first, then FIFO
      .populate('restaurant', 'name');

    // Calculate time elapsed for each order
    const enrichedOrders = orders.map(order => {
      const orderObj = order.toObject();
      const minutesAgo = Math.round((Date.now() - new Date(order.placedAt).getTime()) / 60000);
      orderObj.minutesAgo = minutesAgo;

      // Flag late orders (more than estimated wait time)
      orderObj.isLate = minutesAgo > order.estimatedWaitTime;

      return orderObj;
    });

    // Get workload data
    const loadData = await calculateKitchenLoad(restaurantId);

    res.json({
      success: true,
      orders: enrichedOrders,
      workload: loadData,
      stats: {
        total: enrichedOrders.length,
        new: enrichedOrders.filter(o => o.status === 'placed').length,
        inPrep: enrichedOrders.filter(o => o.status === 'preparing').length,
        late: enrichedOrders.filter(o => o.isLate).length
      }
    });
  } catch (error) {
    console.error('Get kitchen orders error:', error);
    res.status(500).json({ message: 'Error fetching kitchen orders' });
  }
};

/* ---- Update Order Status (Kitchen Staff) ---- */
// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, kitchenProgress, kitchenNote, priority } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update status and related timestamps
    if (status) {
      order.status = status;

      if (status === 'preparing') {
        order.preparingAt = new Date();
        order.kitchenProgress = 25;
        order.kitchenNote = 'Chef has started preparing your order';
      } else if (status === 'ready') {
        order.readyAt = new Date();
        order.kitchenProgress = 100;
        order.kitchenNote = 'Your order is ready for pickup!';
      } else if (status === 'served') {
        order.servedAt = new Date();
      } else if (status === 'confirmed') {
        order.kitchenProgress = 10;
        order.kitchenNote = 'Order confirmed by kitchen';
      }
    }

    // Update progress if provided separately
    if (kitchenProgress !== undefined) order.kitchenProgress = kitchenProgress;
    if (kitchenNote) order.kitchenNote = kitchenNote;
    if (priority) order.priority = priority;

    await order.save();

    // Emit real-time status update to customer displays
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', {
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        status: order.status,
        kitchenProgress: order.kitchenProgress,
        kitchenNote: order.kitchenNote
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

/* ---- Get Order by ID ---- */
// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name currency');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

/* ---- Get Orders by Table (Customer) ---- */
// GET /api/orders/table/:restaurantId/:tableNumber
const getTableOrders = async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.params;
    const orders = await Order.find({
      restaurant: restaurantId,
      tableNumber,
      status: { $nin: ['served', 'cancelled'] }
    }).sort({ placedAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching table orders' });
  }
};

module.exports = {
  placeOrder,
  trackOrder,
  getKitchenOrders,
  updateOrderStatus,
  getOrder,
  getTableOrders
};
