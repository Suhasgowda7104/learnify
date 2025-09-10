import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database.config.js';
import { syncDatabase } from './src/models/index.js';
import authRoutes from './src/routes/auth.route.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging middleware with status code
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Status: ${res.statusCode} - ${responseTime}ms - IP: ${req.ip}`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Routes with API versioning
app.use('/api/v1/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Learnify Server is running!' });
});

// API v1 routes
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Learnify API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      health: '/api/v1/health'
    }
  });
});

// Health check route
app.get('/api/v1/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    status: 'OK', 
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server and test database connection
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✅ Database connected');
    await syncDatabase();
  } else {
    console.log('❌ Failed to connect to database');
  }
});