const express = require('express');
const joi = require('joi');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Validation schemas
const updateSettingSchema = joi.object({
  value: joi.alternatives().try(
    joi.string(),
    joi.number(),
    joi.boolean(),
    joi.object(),
    joi.array()
  ).required()
});

// Get all user settings
router.get('/', asyncHandler(async (req, res) => {
  const db = req.app.locals.services.db;
  const settings = await db.getUserSettings(req.user.id);

  res.json({
    success: true,
    settings
  });
}));

// Get settings by category
router.get('/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const db = req.app.locals.services.db;
  
  const settings = await db.getUserSettings(req.user.id, category);

  res.json({
    success: true,
    category,
    settings
  });
}));

// Update a specific setting
router.put('/:category/:key', rateLimit.settings, asyncHandler(async (req, res) => {
  const { category, key } = req.params;
  const { error, value } = updateSettingSchema.validate(req.body);
  
  if (error) {
    throw new ValidationError('Invalid setting value', error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    })));
  }

  const db = req.app.locals.services.db;
  const notificationService = req.app.locals.services.notifications;
  const aiService = req.app.locals.services.ai;
  const infrastructureService = req.app.locals.services.infrastructure;
  const monitoringService = req.app.locals.services.monitoring;

  // Handle special setting categories that trigger real actions
  switch (category) {
    case 'ai':
      await handleAISettingUpdate(key, value.value, req.user.id, aiService, db);
      break;
    
    case 'infrastructure':
      await handleInfrastructureSettingUpdate(key, value.value, req.user.id, infrastructureService, db);
      break;
    
    case 'notifications':
      await handleNotificationSettingUpdate(key, value.value, req.user.id, notificationService, db);
      break;
    
    case 'security':
      await handleSecuritySettingUpdate(key, value.value, req.user.id, db, req);
      break;
    
    case 'appearance':
      // Appearance settings are client-side only, just store them
      break;
    
    case 'teams':
      await handleTeamSettingUpdate(key, value.value, req.user.id, db);
      break;
    
    case 'privacy':
      await handlePrivacySettingUpdate(key, value.value, req.user.id, db, req);
      break;
  }

  // Update the setting in database
  const updatedSettings = await db.updateUserSetting(req.user.id, category, key, value.value);

  // Create audit log
  await db.query(
    'INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      req.user.id,
      'setting_updated',
      'user_setting',
      JSON.stringify({ category, key, value: value.value }),
      req.ip,
      req.get('User-Agent')
    ]
  );

  // Broadcast setting change via WebSocket
  const io = req.app.locals.io;
  if (io) {
    io.to(`user_${req.user.id}`).emit('setting_updated', {
      category,
      key,
      value: value.value,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Setting updated successfully',
    category,
    key,
    value: value.value,
    settings: updatedSettings
  });
}));

// Delete a setting
router.delete('/:category/:key', rateLimit.settings, asyncHandler(async (req, res) => {
  const { category, key } = req.params;
  const db = req.app.locals.services.db;

  await db.deleteUserSetting(req.user.id, category, key);

  // Create audit log
  await db.query(
    'INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      req.user.id,
      'setting_deleted',
      'user_setting',
      JSON.stringify({ category, key }),
      req.ip,
      req.get('User-Agent')
    ]
  );

  res.json({
    success: true,
    message: 'Setting deleted successfully'
  });
}));

// Export user settings data
router.get('/export/data', asyncHandler(async (req, res) => {
  const db = req.app.locals.services.db;
  
  // Get all user data
  const user = await db.getUserById(req.user.id);
  const settings = await db.getUserSettings(req.user.id);
  const notifications = await db.getUserNotifications(req.user.id, 1000);
  const resources = await db.getInfrastructureResources(req.user.id);

  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    },
    settings,
    notifications: notifications.map(n => ({
      type: n.type,
      title: n.title,
      message: n.message,
      created_at: n.created_at
    })),
    resources: resources.map(r => ({
      name: r.name,
      type: r.type,
      provider: r.provider,
      region: r.region,
      created_at: r.created_at
    })),
    exported_at: new Date().toISOString()
  };

  // Create audit log
  await db.query(
    'INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      req.user.id,
      'data_exported',
      'user_data',
      JSON.stringify({ export_type: 'full_data' }),
      req.ip,
      req.get('User-Agent')
    ]
  );

  res.json({
    success: true,
    data: exportData
  });
}));

// Helper functions for handling specific setting updates

async function handleAISettingUpdate(key, value, userId, aiService, db) {
  switch (key) {
    case 'aiSuggestions':
      if (value) {
        await aiService.enableSuggestions(userId);
      } else {
        await aiService.disableSuggestions(userId);
      }
      break;
    
    case 'autoOptimization':
      if (value) {
        await aiService.enableAutoOptimization(userId);
        await db.createNotification(
          userId,
          'ai',
          'Auto-Optimization Enabled',
          'AI will now automatically optimize your infrastructure based on usage patterns'
        );
      } else {
        await aiService.disableAutoOptimization(userId);
      }
      break;
    
    case 'predictiveAnalytics':
      await aiService.togglePredictiveAnalytics(userId, value);
      break;
    
    case 'aiAssistantEnabled':
      await aiService.toggleAssistant(userId, value);
      break;
  }
}

async function handleInfrastructureSettingUpdate(key, value, userId, infrastructureService, db) {
  switch (key) {
    case 'monitoringEnabled':
      if (value) {
        await infrastructureService.enableMonitoring(userId);
        await db.createNotification(
          userId,
          'infrastructure',
          'Monitoring Enabled',
          'Infrastructure monitoring has been enabled for your resources'
        );
      } else {
        await infrastructureService.disableMonitoring(userId);
      }
      break;
    
    case 'autoBackup':
      await infrastructureService.toggleAutoBackup(userId, value);
      break;
    
    case 'alertsEnabled':
      await infrastructureService.toggleAlerts(userId, value);
      break;
    
    case 'resourceOptimization':
      if (value) {
        await infrastructureService.enableResourceOptimization(userId);
      } else {
        await infrastructureService.disableResourceOptimization(userId);
      }
      break;
    
    case 'autoResourceScaling':
      await infrastructureService.toggleAutoScaling(userId, value);
      if (value) {
        await db.createNotification(
          userId,
          'infrastructure',
          'Auto-Scaling Enabled',
          'Resources will now automatically scale based on demand'
        );
      }
      break;
  }
}

async function handleNotificationSettingUpdate(key, value, userId, notificationService, db) {
  switch (key) {
    case 'emailNotifications':
      await notificationService.toggleEmailNotifications(userId, value);
      break;
    
    case 'pushNotifications':
      await notificationService.togglePushNotifications(userId, value);
      break;
    
    case 'securityAlerts':
      await notificationService.toggleSecurityAlerts(userId, value);
      break;
    
    case 'deploymentAlerts':
      await notificationService.toggleDeploymentAlerts(userId, value);
      break;
    
    case 'performanceAlerts':
      await notificationService.togglePerformanceAlerts(userId, value);
      break;
    
    case 'weeklyReports':
      if (value) {
        await notificationService.enableWeeklyReports(userId);
      } else {
        await notificationService.disableWeeklyReports(userId);
      }
      break;
  }
}

async function handleSecuritySettingUpdate(key, value, userId, db, req) {
  switch (key) {
    case 'sessionTimeout':
      // Update all active sessions with new timeout
      await db.query(
        'UPDATE user_sessions SET expires_at = now() + interval \'1 minute\' * $1 WHERE user_id = $2',
        [value, userId]
      );
      
      await db.createNotification(
        userId,
        'security',
        'Session Timeout Updated',
        `Session timeout has been set to ${value} minutes`
      );
      break;
    
    case 'loginAlerts':
      // This is handled in the login process
      break;
    
    case 'passwordExpiry':
      // Store password expiry setting for future password change enforcement
      break;
  }
}

async function handleTeamSettingUpdate(key, value, userId, db) {
  switch (key) {
    case 'allowCollaboration':
      // Update team collaboration permissions
      break;
    
    case 'shareData':
      // Toggle data sharing with team members
      break;
    
    case 'publicProfile':
      await db.updateUser(userId, { public_profile: value });
      break;
  }
}

async function handlePrivacySettingUpdate(key, value, userId, db, req) {
  switch (key) {
    case 'telemetryEnabled':
      if (!value) {
        await db.createNotification(
          userId,
          'privacy',
          'Telemetry Disabled',
          'Anonymous usage data collection has been disabled'
        );
      }
      break;
    
    case 'dataRetention':
      // Schedule data cleanup based on retention period
      await scheduleDataCleanup(userId, value, db);
      break;
    
    case 'usageAnalytics':
      // Toggle usage analytics collection
      break;
  }
}

async function scheduleDataCleanup(userId, retentionDays, db) {
  // In a real implementation, this would schedule a background job
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  // Clean up old notifications
  await db.query(
    'DELETE FROM notifications WHERE user_id = $1 AND created_at < $2',
    [userId, cutoffDate]
  );
  
  // Clean up old audit logs
  await db.query(
    'DELETE FROM audit_logs WHERE user_id = $1 AND created_at < $2',
    [userId, cutoffDate]
  );
}

module.exports = router;
