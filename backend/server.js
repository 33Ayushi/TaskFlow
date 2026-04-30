const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow API is running!',
    timestamp: new Date().toISOString(),
  });
});
// Root route
app.get("/", (req, res) => {
  res.send("TaskFlow API is running 🚀");
});

// Serve frontend in production
//if (process.env.NODE_ENV === 'production') {
  //app.use(express.static(path.join(__dirname, '../frontend/dist')));
 // app.get('*', (req, res) => {
    //res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  //});
//}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
