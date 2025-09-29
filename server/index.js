import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from './config/database.config.js';
import { syncDatabase } from './src/models/index.js';
import { specs, swaggerUi } from './config/swagger.config.js';
import authRoutes from './src/routes/auth.route.js';
import courseRoutes from './src/routes/course.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:8081', 'http://127.0.0.1:8081'], // Angular dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Original-Password']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Learnify API Documentation'
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Server status check
 *     description: Returns a simple message indicating the server is running
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: Server is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Learnify Server is running!"
 */
app.get('/', (req, res) => {
  res.json({ message: 'Learnify Server is running!' });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     description: Returns API version and available endpoints
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Learnify API v1"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: "/api/v1/auth"
 *                     health:
 *                       type: string
 *                       example: "/api/v1/health"
 */
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

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     description: Returns server and database status
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 database:
 *                   type: string
 *                   example: "Connected"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
app.get('/api/v1/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    status: 'OK', 
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✅ Database connected');
    await syncDatabase();
  } else {
    console.log('❌ Failed to connect to database');
  }
});