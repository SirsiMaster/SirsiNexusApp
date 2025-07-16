const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const winston = require('winston');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const aiRoutes = require('./routes/ai');
const infrastructureRoutes = require('./routes/infrastructure');
const teamsRoutes = require('./routes/teams');
const notificationsRoutes = require('./routes/notifications');

// Import middleware
const authMiddleware = require('./middleware/auth');
const rateLimitMiddleware = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

// Import services
const DatabaseService = require('./services/database');
const AIService = require('./services/ai');
const CloudProviderService = require('./services/cloudProviders');
const NotificationService = require('./services/notifications');
const WebSocketService = require('./services/websocket');

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sirsi-nexus-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Initialize services
let database, aiService, cloudService, notificationService, webSocketService;

async function initializeServices() {
  try {
    // Initialize database
    database = new DatabaseService();
    await database.initialize();
    logger.info('Database service initialized');

    // Initialize WebSocket service (replaces the basic socketIo setup)
    webSocketService = new WebSocketService(server);
    global.webSocketService = webSocketService;
    logger.info('WebSocket service initialized');

    // Initialize notification service
    notificationService = new NotificationService(webSocketService.getIO());
    await notificationService.initialize();
    logger.info('Notification service initialized');

    // Initialize AI service
    aiService = new AIService();
    logger.info('AI service initialized');

    // Initialize cloud provider service
    cloudService = new CloudProviderService();
    logger.info('Cloud provider service initialized');

    // Make services available globally
    app.locals.database = database;
    app.locals.aiService = aiService;
    app.locals.cloudService = cloudService;
    app.locals.notificationService = notificationService;
    app.locals.webSocketService = webSocketService;

    // Legacy service object for backward compatibility
    app.locals.services = {
      db: database,
      ai: aiService,
      infrastructure: cloudService,
      notifications: notificationService,
      monitoring: webSocketService
    };

  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/infrastructure', authMiddleware, infrastructureRoutes);
app.use('/api/teams', authMiddleware, teamsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: database?.isHealthy() || false,
      ai: aiService?.isHealthy() || false,
      infrastructure: cloudService ? true : false,
      notifications: notificationService?.isHealthy() || false,
      websocket: webSocketService?.getConnectedUsersCount() || 0
    }
  });
});

// WebSocket handling is now managed by WebSocketService

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
async function startServer() {
  await initializeServices();
  
  server.listen(PORT, () => {
    logger.info(`SirsiNexus backend server running on port ${PORT}`);
    console.log(`🚀 SirsiNexus backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  if (webSocketService) webSocketService.shutdown();
  if (cloudService) cloudService.shutdown();
  if (database) await database.close();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  if (webSocketService) webSocketService.shutdown();
  if (cloudService) cloudService.shutdown();
  if (database) await database.close();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
