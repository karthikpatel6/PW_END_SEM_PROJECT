# SpiceRoute Project Structure

This file provides a comprehensive overview of the folder and file structure for the **SpiceRoute: Smart Restaurant Ordering & Workload Management System**.

## Root Directory (`d:\PW_END_SEM`)
├── `client/` (React Frontend)
├── `server/` (Node.js/Express Backend)
├── `PRD.md` (Product Requirements Document)
└── `folder_structure.md` (This file)

---

## 🖥️ Backend Structure (`/server`)

The backend is built using Node.js, Express, Mongoose, and Socket.IO.

```text
server/
├── config/
│   └── db.js                 # MongoDB connection logic (with memory-server fallback)
│
├── controllers/
│   ├── authController.js     # Handles login and JWT generation
│   ├── managerController.js  # Analytics, dashboard stats, staff overview
│   ├── menuController.js     # Menu CRUD, dynamic active-load filtering
│   └── orderController.js    # Placed orders, tracking, Socket.IO triggers
│
├── middleware/
│   └── auth.js               # JWT verification & role-based access control (RBAC)
│
├── models/
│   ├── MenuItem.js           # Menu items schema (prices, complexity, prep time)
│   ├── Order.js              # Order schema (table numbers, item arrays, total)
│   ├── Restaurant.js         # Settings, kitchen capacity, workload thresholds
│   ├── Staff.js              # Users, bcrypt passwords, roles (manager/kitchen)
│   └── WorkloadMetric.js     # Time-series analytics (auto-archived via TTL)
│
├── routes/
│   ├── auth.js               # POST /api/auth/login, GET /api/auth/me
│   ├── manager.js            # GET /api/manager/dashboard, GET /api/manager/analytics
│   ├── menu.js               # GET /api/menu/:restaurantId, POST /api/menu (manager)
│   └── orders.js             # POST /api/orders, GET /api/orders/track/:token
│
├── utils/
│   └── workloadEngine.js     # Core AI Engine (calculates load %, updates wait times)
│
├── .env                      # Environment variables (Port, MongoDB URI, JWT Secret)
├── package.json              # Backend dependencies
├── seed.js                   # Database initialization script with mock data
└── server.js                 # Main entry point (Express setup, API routing, WebSockets)
```

---

## 🎨 Frontend Structure (`/client`)

The frontend is built using React 18, Vite, React Router, Context API, and Recharts.

```text
client/
├── public/
│   └── spiceroute.svg        # Brand Logo/Favicon
│
├── src/
│   ├── api/
│   │   └── axios.js          # Axios interceptors configured with JWT authorization
│   │
│   ├── context/
│   │   ├── AuthContext.jsx   # Global user state (session persistence, login/logout)
│   │   └── CartContext.jsx   # Shopping cart logic (add, remove, edit quantities)
│   │
│   ├── pages/
│   │   ├── customer/
│   │   │   ├── Cart.jsx          # Order review, smart wait times, checkout
│   │   │   ├── Menu.jsx          # Active menu filtering with live kitchen pulse
│   │   │   └── OrderTracking.jsx # Live order status tracker (WebSockets)
│   │   │
│   │   ├── kitchen/
│   │   │   ├── KitchenDashboard.jsx # KDS order cards, 'Fire'/'Plated' buttons
│   │   │   └── KitchenLogin.jsx     # Staff portal login
│   │   │
│   │   ├── manager/
│   │   │   ├── Analytics.jsx        # Recharts visualization (Orders, Revenue)
│   │   │   ├── ManagerDashboard.jsx # Workload gauges, stats, active staff
│   │   │   ├── ManagerLogin.jsx     # Admin authentication
│   │   │   └── MenuManagement.jsx   # Add/edit/delete/toggle menu items
│   │   │
│   │   └── Landing.jsx       # Unified portal entry (Customer, Kitchen, Manager)
│   │
│   ├── App.jsx               # React Router config protecting routes
│   ├── index.css             # Global CSS variables, Dark Glassmorphism themes
│   └── main.jsx              # React mounting point
│
├── index.html                # App entry HTML (Google Fonts loaded)
├── package.json              # Frontend dependencies
└── vite.config.js            # Vite bundler configuration (with /api proxy)
```

## How It Starts Up
1. `node server.js` initializes the express app. If no MongoDB URI is available, it spins up `mongodb-memory-server`.
2. The server detects an empty database and triggers `seedDatabase` from `seed.js`.
3. The Vite frontend proxies all `/api` requests to port `5000`.
