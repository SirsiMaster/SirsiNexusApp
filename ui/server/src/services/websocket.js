const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.connectedUsers = new Map();
    this.userRooms = new Map();
    
    this.setupAuthentication();
    this.setupEventHandlers();
    
    console.log('WebSocket service initialized');
  }

  setupAuthentication() {
    // Middleware for socket authentication
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        
        next();
      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected via WebSocket`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Send connection success
      socket.emit('connected', {
        message: 'Connected to real-time updates',
        timestamp: new Date().toISOString()
      });

      // Handle subscription to specific channels
      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data);
      });

      // Handle unsubscription from channels
      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data);
      });

      // Handle infrastructure monitoring subscription
      socket.on('monitor_infrastructure', (data) => {
        this.handleInfrastructureMonitoring(socket, data);
      });

      // Handle AI job status subscription
      socket.on('monitor_ai_jobs', (data) => {
        this.handleAIJobMonitoring(socket, data);
      });

      // Handle team collaboration
      socket.on('join_team', (data) => {
        this.handleTeamJoin(socket, data);
      });

      socket.on('leave_team', (data) => {
        this.handleTeamLeave(socket, data);
      });

      // Handle typing indicators for team chat
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle real-time settings changes
      socket.on('settings_update', (data) => {
        this.broadcastSettingsUpdate(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
        this.cleanupUserRooms(socket.userId);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`WebSocket error for user ${socket.userId}:`, error);
      });
    });
  }

  handleSubscription(socket, data) {
    const { channel, filters = {} } = data;
    
    switch (channel) {
      case 'infrastructure':
        socket.join('infrastructure_updates');
        if (filters.provider) {
          socket.join(`infrastructure_${filters.provider}`);
        }
        break;
        
      case 'ai_jobs':
        socket.join('ai_jobs_updates');
        break;
        
      case 'notifications':
        socket.join('notifications_updates');
        break;
        
      case 'team_activities':
        if (filters.teamId) {
          socket.join(`team_${filters.teamId}`);
        }
        break;
        
      default:
        socket.emit('error', { message: `Unknown channel: ${channel}` });
        return;
    }

    // Track user subscriptions
    if (!this.userRooms.has(socket.userId)) {
      this.userRooms.set(socket.userId, new Set());
    }
    this.userRooms.get(socket.userId).add(channel);

    socket.emit('subscribed', { channel, timestamp: new Date().toISOString() });
    console.log(`User ${socket.userId} subscribed to ${channel}`);
  }

  handleUnsubscription(socket, data) {
    const { channel } = data;
    
    switch (channel) {
      case 'infrastructure':
        socket.leave('infrastructure_updates');
        // Leave all provider-specific rooms
        ['aws', 'azure', 'gcp', 'digitalocean'].forEach(provider => {
          socket.leave(`infrastructure_${provider}`);
        });
        break;
        
      case 'ai_jobs':
        socket.leave('ai_jobs_updates');
        break;
        
      case 'notifications':
        socket.leave('notifications_updates');
        break;
        
      case 'team_activities':
        // Leave all team rooms for this user
        socket.rooms.forEach(room => {
          if (room.startsWith('team_')) {
            socket.leave(room);
          }
        });
        break;
    }

    // Update user subscriptions tracking
    if (this.userRooms.has(socket.userId)) {
      this.userRooms.get(socket.userId).delete(channel);
    }

    socket.emit('unsubscribed', { channel, timestamp: new Date().toISOString() });
    console.log(`User ${socket.userId} unsubscribed from ${channel}`);
  }

  handleInfrastructureMonitoring(socket, data) {
    const { resourceIds = [], providers = [] } = data;
    
    // Subscribe to specific resource updates
    resourceIds.forEach(resourceId => {
      socket.join(`resource_${resourceId}`);
    });

    // Subscribe to provider-specific updates
    providers.forEach(provider => {
      socket.join(`infrastructure_${provider}`);
    });

    socket.emit('infrastructure_monitoring_started', {
      resourceIds,
      providers,
      timestamp: new Date().toISOString()
    });
  }

  handleAIJobMonitoring(socket, data) {
    const { jobTypes = [], priority = 'all' } = data;
    
    socket.join('ai_jobs_updates');
    
    // Subscribe to specific job types
    jobTypes.forEach(type => {
      socket.join(`ai_jobs_${type}`);
    });

    if (priority !== 'all') {
      socket.join(`ai_jobs_priority_${priority}`);
    }

    socket.emit('ai_job_monitoring_started', {
      jobTypes,
      priority,
      timestamp: new Date().toISOString()
    });
  }

  handleTeamJoin(socket, data) {
    const { teamId } = data;
    
    if (!teamId) {
      socket.emit('error', { message: 'Team ID required' });
      return;
    }

    socket.join(`team_${teamId}`);
    
    // Notify other team members
    socket.to(`team_${teamId}`).emit('team_member_joined', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      teamId,
      timestamp: new Date().toISOString()
    });

    socket.emit('team_joined', { teamId, timestamp: new Date().toISOString() });
  }

  handleTeamLeave(socket, data) {
    const { teamId } = data;
    
    if (!teamId) {
      socket.emit('error', { message: 'Team ID required' });
      return;
    }

    // Notify other team members before leaving
    socket.to(`team_${teamId}`).emit('team_member_left', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      teamId,
      timestamp: new Date().toISOString()
    });

    socket.leave(`team_${teamId}`);
    socket.emit('team_left', { teamId, timestamp: new Date().toISOString() });
  }

  handleTypingStart(socket, data) {
    const { teamId, context = 'chat' } = data;
    
    socket.to(`team_${teamId}`).emit('user_typing_start', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      teamId,
      context,
      timestamp: new Date().toISOString()
    });
  }

  handleTypingStop(socket, data) {
    const { teamId, context = 'chat' } = data;
    
    socket.to(`team_${teamId}`).emit('user_typing_stop', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      teamId,
      context,
      timestamp: new Date().toISOString()
    });
  }

  broadcastSettingsUpdate(socket, data) {
    const { setting, value, scope = 'user' } = data;
    
    if (scope === 'user') {
      // Only update for the specific user
      socket.emit('settings_updated', {
        setting,
        value,
        scope,
        timestamp: new Date().toISOString()
      });
    } else if (scope === 'team') {
      // Broadcast to team members
      const { teamId } = data;
      if (teamId) {
        socket.to(`team_${teamId}`).emit('team_settings_updated', {
          setting,
          value,
          updatedBy: socket.userId,
          teamId,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  cleanupUserRooms(userId) {
    if (this.userRooms.has(userId)) {
      this.userRooms.delete(userId);
    }
  }

  // Public methods for broadcasting updates

  // Broadcast infrastructure updates
  broadcastInfrastructureUpdate(update) {
    const { resourceId, provider, type, data } = update;
    
    // Broadcast to all infrastructure subscribers
    this.io.to('infrastructure_updates').emit('infrastructure_update', {
      resourceId,
      provider,
      type,
      data,
      timestamp: new Date().toISOString()
    });

    // Broadcast to provider-specific subscribers
    if (provider) {
      this.io.to(`infrastructure_${provider}`).emit('infrastructure_update', {
        resourceId,
        provider,
        type,
        data,
        timestamp: new Date().toISOString()
      });
    }

    // Broadcast to resource-specific subscribers
    if (resourceId) {
      this.io.to(`resource_${resourceId}`).emit('resource_update', {
        resourceId,
        type,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Broadcast AI job updates
  broadcastAIJobUpdate(jobUpdate) {
    const { jobId, type, status, progress, result, priority } = jobUpdate;
    
    const update = {
      jobId,
      type,
      status,
      progress,
      result,
      priority,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all AI job subscribers
    this.io.to('ai_jobs_updates').emit('ai_job_update', update);

    // Broadcast to job type specific subscribers
    if (type) {
      this.io.to(`ai_jobs_${type}`).emit('ai_job_update', update);
    }

    // Broadcast to priority specific subscribers
    if (priority) {
      this.io.to(`ai_jobs_priority_${priority}`).emit('ai_job_update', update);
    }
  }

  // Broadcast system-wide notifications
  broadcastSystemNotification(notification) {
    this.io.emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to specific user
  sendUserNotification(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast team activity
  broadcastTeamActivity(teamId, activity) {
    this.io.to(`team_${teamId}`).emit('team_activity', {
      ...activity,
      teamId,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users in specific room
  getUsersInRoom(room) {
    const socketsInRoom = this.io.sockets.adapter.rooms.get(room);
    return socketsInRoom ? socketsInRoom.size : 0;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get WebSocket server instance
  getIO() {
    return this.io;
  }

  // Graceful shutdown
  shutdown() {
    console.log('Shutting down WebSocket service...');
    this.io.close();
    this.connectedUsers.clear();
    this.userRooms.clear();
  }
}

module.exports = WebSocketService;
