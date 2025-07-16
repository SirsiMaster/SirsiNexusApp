const express = require('express');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const joi = require('joi');

const authMiddleware = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { asyncHandler, ValidationError, AuthenticationError, ConflictError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  name: joi.string().min(1).max(100).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  twoFactorCode: joi.string().length(6).pattern(/^\d+$/).optional(),
  rememberMe: joi.boolean().default(false)
});

const changePasswordSchema = joi.object({
  currentPassword: joi.string().required(),
  newPassword: joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  confirmPassword: joi.string().required().valid(joi.ref('newPassword'))
    .messages({
      'any.only': 'Passwords do not match'
    })
});

// Register new user
router.post('/register', rateLimit.strict, asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    })));
  }

  const { email, password, name } = value;
  const db = req.app.locals.services.db;

  // Check if user already exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create user
  const user = await db.createUser({
    email,
    password,
    name
  });

  // Generate tokens
  const accessToken = authMiddleware.generateAccessToken(user);
  const refreshToken = authMiddleware.generateRefreshToken(user);

  // Create session
  const sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + 7); // 7 days
  
  await db.createSession(
    user.id,
    accessToken,
    sessionExpiry,
    req.ip,
    req.get('User-Agent')
  );

  // Send welcome notification
  const notificationService = req.app.locals.services.notifications;
  await notificationService.sendWelcomeEmail(user);

  // Create welcome notification
  await db.createNotification(
    user.id,
    'welcome',
    'Welcome to SirsiNexus!',
    'Your account has been created successfully. Start by configuring your infrastructure settings.',
    { source: 'registration' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: '15m'
    }
  });
}));

// Login user
router.post('/login', rateLimit.strict, asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    })));
  }

  const { email, password, twoFactorCode, rememberMe } = value;
  const db = req.app.locals.services.db;

  // Verify credentials
  const user = await db.verifyPassword(email, password);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check 2FA if enabled
  if (user.two_factor_enabled) {
    if (!twoFactorCode) {
      return res.status(200).json({
        success: false,
        requiresTwoFactor: true,
        message: 'Two-factor authentication code required'
      });
    }

    const userWithSecret = await db.getUserByEmail(email);
    const verified = speakeasy.totp.verify({
      secret: userWithSecret.two_factor_secret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 2
    });

    if (!verified) {
      throw new AuthenticationError('Invalid two-factor authentication code');
    }
  }

  // Generate tokens
  const accessToken = authMiddleware.generateAccessToken(user);
  const refreshToken = authMiddleware.generateRefreshToken(user);

  // Create session
  const sessionExpiry = new Date();
  if (rememberMe) {
    sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days
  } else {
    sessionExpiry.setDate(sessionExpiry.getDate() + 1); // 1 day
  }
  
  await db.createSession(
    user.id,
    accessToken,
    sessionExpiry,
    req.ip,
    req.get('User-Agent')
  );

  // Create login notification
  await db.createNotification(
    user.id,
    'security',
    'New Login',
    `New login from ${req.ip} at ${new Date().toLocaleString()}`,
    { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
  );

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      twoFactorEnabled: user.two_factor_enabled
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: '15m'
    }
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token required');
  }

  try {
    const decoded = authMiddleware.verifyToken(refreshToken, true);
    const db = req.app.locals.services.db;
    
    const user = await db.getUserById(decoded.id);
    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = authMiddleware.generateAccessToken(user);
    
    // Update session
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7);
    
    await db.createSession(
      user.id,
      newAccessToken,
      sessionExpiry,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: '15m'
    });
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
}));

// Change password
router.post('/change-password', authMiddleware.authenticate, rateLimit.strict, asyncHandler(async (req, res) => {
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    })));
  }

  const { currentPassword, newPassword } = value;
  const db = req.app.locals.services.db;

  // Verify current password
  const user = await db.verifyPassword(req.user.email, currentPassword);
  if (!user) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await db.updateUser(req.user.id, {
    password_hash: hashedPassword,
    updated_at: new Date()
  });

  // Invalidate all sessions except current
  // Note: In a real implementation, you'd want to keep track of session IDs
  
  // Create security notification
  await db.createNotification(
    req.user.id,
    'security',
    'Password Changed',
    'Your password has been successfully changed',
    { 
      ip: req.ip,
      timestamp: new Date().toISOString()
    }
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Setup 2FA
router.post('/setup-2fa', authMiddleware.authenticate, asyncHandler(async (req, res) => {
  const db = req.app.locals.services.db;

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `SirsiNexus (${req.user.email})`,
    issuer: 'SirsiNexus'
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Store secret temporarily (not yet enabled)
  await db.updateUser(req.user.id, {
    two_factor_secret: secret.base32
  });

  res.json({
    success: true,
    secret: secret.base32,
    qrCode: qrCodeUrl,
    backupCodes: [] // TODO: Generate backup codes
  });
}));

// Enable 2FA
router.post('/enable-2fa', authMiddleware.authenticate, asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    throw new ValidationError('Verification code is required');
  }

  const db = req.app.locals.services.db;
  const userWithSecret = await db.getUserByEmail(req.user.email);

  if (!userWithSecret.two_factor_secret) {
    throw new ValidationError('Two-factor authentication not set up. Please set up 2FA first.');
  }

  // Verify the code
  const verified = speakeasy.totp.verify({
    secret: userWithSecret.two_factor_secret,
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (!verified) {
    throw new ValidationError('Invalid verification code');
  }

  // Enable 2FA
  await db.updateUser(req.user.id, {
    two_factor_enabled: true
  });

  // Create security notification
  await db.createNotification(
    req.user.id,
    'security',
    'Two-Factor Authentication Enabled',
    'Two-factor authentication has been enabled for your account',
    { 
      ip: req.ip,
      timestamp: new Date().toISOString()
    }
  );

  res.json({
    success: true,
    message: 'Two-factor authentication enabled successfully'
  });
}));

// Disable 2FA
router.post('/disable-2fa', authMiddleware.authenticate, asyncHandler(async (req, res) => {
  const { password, code } = req.body;
  
  if (!password || !code) {
    throw new ValidationError('Password and verification code are required');
  }

  const db = req.app.locals.services.db;

  // Verify password
  const user = await db.verifyPassword(req.user.email, password);
  if (!user) {
    throw new AuthenticationError('Incorrect password');
  }

  // Verify 2FA code
  const userWithSecret = await db.getUserByEmail(req.user.email);
  const verified = speakeasy.totp.verify({
    secret: userWithSecret.two_factor_secret,
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (!verified) {
    throw new ValidationError('Invalid verification code');
  }

  // Disable 2FA
  await db.updateUser(req.user.id, {
    two_factor_enabled: false,
    two_factor_secret: null
  });

  // Create security notification
  await db.createNotification(
    req.user.id,
    'security',
    'Two-Factor Authentication Disabled',
    'Two-factor authentication has been disabled for your account',
    { 
      ip: req.ip,
      timestamp: new Date().toISOString()
    }
  );

  res.json({
    success: true,
    message: 'Two-factor authentication disabled successfully'
  });
}));

// Logout
router.post('/logout', authMiddleware.authenticate, asyncHandler(async (req, res) => {
  const db = req.app.locals.services.db;

  // Delete session
  await db.deleteSession(req.sessionToken);

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Get current user
router.get('/me', authMiddleware.authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      twoFactorEnabled: req.user.two_factor_enabled,
      created_at: req.user.created_at,
      updated_at: req.user.updated_at
    }
  });
}));

module.exports = router;
