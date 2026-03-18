/* ============================================
   SpiceRoute - Main Server Entry Point
   Express server with Socket.IO for real-time
   order updates between kitchen and customers.
   
   Features:
   - RESTful API routes
   - Socket.IO real-time communication
   - CORS enabled for frontend
   - MongoDB connection via Mongoose
   ============================================ */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seed');
const Restaurant = require('./models/Restaurant');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const managerRoutes = require('./routes/manager');

// Initialize Express app
const app = express();
const server = http.createServer(app);

/* ---- Socket.IO Setup ---- */
// Real-time communication for order status updates
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Make io accessible to route handlers
app.set('io', io);

/* ---- Middleware ---- */
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---- API Routes ---- */
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/manager', managerRoutes);

/* ---- Health Check Endpoint ---- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SpiceRoute API',
    timestamp: new Date().toISOString()
  });
});

/* ---- Socket.IO Connection Handler ---- */
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join restaurant-specific room for targeted updates
  socket.on('joinRestaurant', (restaurantId) => {
    socket.join(`restaurant:${restaurantId}`);
    console.log(`📡 Socket ${socket.id} joined restaurant: ${restaurantId}`);
  });

  // Join order-specific room for customer tracking
  socket.on('trackOrder', (tokenNumber) => {
    socket.join(`order:${tokenNumber}`);
    console.log(`📡 Socket ${socket.id} tracking order: ${tokenNumber}`);
  });

  // Kitchen staff joins kitchen room
  socket.on('joinKitchen', (restaurantId) => {
    socket.join(`kitchen:${restaurantId}`);
    console.log(`👨‍🍳 Socket ${socket.id} joined kitchen: ${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

/* ---- Start Server ---- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  try {
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      console.log('📦 Empty database detected. Seeding initial data...');
      await seedDatabase();
    }
  } catch (err) {
    console.log('⚠️ Error checking database count:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║                                          ║
    ║   🍛 SpiceRoute Server Running           ║
    ║   📡 Port: ${PORT}                        ║
    ║   🔌 Socket.IO: Enabled                  ║
    ║   🗄️  MongoDB: Connected                  ║
    ║                                          ║
    ╚══════════════════════════════════════════╝
    `);
  });
};

startServer().catch(console.error);
