# Product Requirements Document (PRD)
**Project Name:** SpiceRoute – Smart Restaurant Ordering & Workload Management System  
**Version:** 1.0  
**Date:** March 2026  

---

## 1. Executive Summary
**SpiceRoute** is a comprehensive MERN-stack web application designed for mid-size restaurants. Unlike standard QR-based digital menus that simply push orders to the kitchen blindly, SpiceRoute introduces an **Intelligent Workload Engine**. It actively monitors the kitchen's current capacity, dynamically adjusts estimated wait times, and intelligently filters menu recommendations (e.g., hiding complex dishes and promoting quick-prep items during peak rush hours). By stabilizing kitchen workflows, SpiceRoute reduces staff burnout, prevents kitchen bottlenecks, and guarantees a vastly improved, transparent dining experience for customers.

---

## 2. Target Audience & Use Cases
- **Customers (Dine-in/Takeout):** Scan a QR code on their table to browse the menu, see real-time wait estimates based on kitchen load, and track their order status live without waiting for a waiter.
- **Kitchen Staff:** View incoming orders on a digital Kitchen Display System (KDS), manage ticket priorities, and mark items/orders as 'Preparing' or 'Ready'.
- **Restaurant Managers:** Access a unified dashboard containing real-time workload analytics, revenue reports, and staff efficiency metrics, with the ability to manage the menu catalog instantly.

---

## 3. Core Features & Requirements

### 3.1 Customer Portal (Digital Menu & Ordering)
- **Live Kitchen Pulse:** Displays a visual indicator of current kitchen load (e.g., Low, Moderate, High, Critical) and dynamically calculated base wait times.
- **Smart Menu Filtering:** Automatically highlights "Quick Prep" items or hides high-complexity dishes when the kitchen is operating above maximum capacity.
- **Cart & UPI Payments:** Add items, view order summary, see AI-adjusted ETA, and select a simulated UPI payment method to checkout.
- **Live Order Tracking:** Track the exact status of an order (Placed, Preparing, Ready) via a unique Token Number. Features a live progress bar through WebSockets.

### 3.2 Kitchen Display System (KDS)
- **Real-Time Order Queue:** Orders appear instantly on the dashboard utilizing Socket.IO.
- **Color-Coded Prioritization:** Orders are visually flagged if they are 'Rush', 'Priority', or 'Late'.
- **Ticket Management:** Staff can click 'Fire' to start an order and 'Plated' when done, updating the customer's tracking screen instantly.
- **Station Routing (Future Expansion):** Allows item-level routing to specific kitchen stations (Grill, Fryer, Cold, etc.).

### 3.3 Manager Dashboard
- **Live Workload Gauge:** A visual dial mapping active order volume against the restaurant’s predefined kitchen capacity.
- **Staff Recommendations:** AI-driven alerts suggesting optimal staff numbers based on the current workload level and historical prep times.
- **Menu Management System:** A graphical table to add, edit, or toggle the availability of menu items, assign complexities (LOW, MEDIUM, HIGH), and define base prep times.
- **Analytics & Revenue Reports:** Visual charts displaying Orders by Hour, Revenue by Category, and Peak Time metrics (built with Recharts).

---

## 4. Technical Architecture

### 4.1 Technology Stack
- **Frontend:** React.js 18, Vite, React Router, Axios, Recharts (for analytics), CSS (Custom styling utilizing a dark glassmorphic UI).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose ODM (Features automatic fallback to `mongodb-memory-server` for seamless local testing).
- **Real-time Communication:** Socket.IO.
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for encrypted staff passwords.

### 4.2 Database Models
1. **Restaurant:** Stores global configuration, table counts, and algorithmic workload thresholds.
2. **MenuItem:** Stores price, category, preparation time, and complexity levels required by the Workload Engine.
3. **Order:** Includes embedded items, status tracking, financial totals, and precise timestamping for analytics.
4. **Staff:** User accounts mapped to roles (`manager`, `kitchen`).
5. **WorkloadMetric:** Time-series logging of kitchen load percentage and active orders (auto-archived via TTL index).

---

## 5. System Logic: The Workload Engine 

The primary differentiator of SpiceRoute is its centralized Workload Engine logic.
- **Capacity Calculation:** `Load % = (Active Orders / defined Kitchen Capacity) * 100`
- **Wait Time Adjustment:** 
  - Low (<50%): `Base Wait Time`
  - Moderate (50-85%): `Base Wait + 5 mins`
  - High (85-110%): `Base Wait + 12 mins`
  - Critical (>110%): `Base Wait + 20 mins`
- **Menu Filtering Algorithm:** When load exceeds 85%, items marked with `complexity: 'HIGH'` are dynamically flagged as unavailable or delayed, pushing the customer towards `isQuickPrep: true` items.

---

## 6. Future Scope
1. **POS Integration:** Seamless syncing with physical Point-Of-Sale systems for offline orders.
2. **Inventory Management:** Auto-deduct raw materials when an item is ordered and alert managers on low stock.
3. **Machine Learning ETA Prediction:** Replacing the fixed algorithmic wait time increments with trained AI models adjusting to specific kitchen staff speeds.
4. **Customer Auth & Loyalty:** Saving order history, favorite items, and rewarding frequent dining via a Customer Profile.
