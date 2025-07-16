const jwt = require('jsonwebtoken');
const { RateLimiterRedis } = require('rate-limiter-flexible');

class AuthMiddleware {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
    
    // Rate limiters for auth endpoints
    this.loginLimiter = new RateLimiterRedis({
      storeClient: null, // Will be set when Redis is available
      keyPrefix: 'login_fail',
      points: 5, // Number of attempts
      duration: 900, // Per 15 minutes
      blockDuration: 900, // Block for 15 minutes
    });
  }

  // Generate JWT access token
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      this.jwtSecret,
      {
        expiresIn: '15m',
        issuer: 'sirsi-nexus',
        audience: 'sirsi-nexus-users'
      }
    );
  }

  // Generate JWT refresh token
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: 'refresh'
      },
      this.jwtRefreshSecret,
      {
        expiresIn: '7d',
        issuer: 'sirsi-nexus',
        audience: 'sirsi-nexus-users'
      }
    );
  }

  // Verify JWT token
  verifyToken(token, isRefresh = false) {
    try {
      const secret = isRefresh ? this.jwtRefreshSecret : this.jwtSecret;
      return jwt.verify(token, secret, {
        issuer: 'sirsi-nexus',
        audience: 'sirsi-nexus-users'
      });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Middleware to authenticate requests
  authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No authorization header provided'
        });
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No token provided'
        });
      }

      // Verify the token
      const decoded = this.verifyToken(token);
      
      // Check if session exists in database
      const db = req.app.locals.services.db;
      const session = await db.getSession(token);
      
      if (!session) {
        return res.status(401).json({
          error: 'Session expired',
          message: 'Please log in again'
        });
      }

      // Get full user data
      const user = await db.getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          message: 'Invalid user credentials'
        });
      }

      // Attach user to request
      req.user = user;
      req.sessionToken = token;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Please refresh your token or log in again'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token format is invalid'
        });
      }

      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal authentication error'
      });
    }
  };

  // Middleware for optional authentication (for public endpoints that can be enhanced with auth)
  optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        req.user = null;
        return next();
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        req.user = null;
        return next();
      }

      const decoded = this.verifyToken(token);
      const db = req.app.locals.services.db;
      const user = await db.getUserById(decoded.id);
      
      req.user = user;
      req.sessionToken = token;
      
      next();
    } catch (error) {
      // For optional auth, we don't fail on auth errors
      req.user = null;
      next();
    }
  };

  // Middleware to check user roles
  requireRole = (roles) => {
    if (typeof roles === 'string') {
      roles = [roles];
    }

    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      const userRole = req.user.role || 'user';
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `This action requires one of the following roles: ${roles.join(', ')}`
        });
      }

      next();
    };
  };

  // Rate limiting for authentication endpoints
  rateLimitAuth = async (req, res, next) => {
    try {
      const key = req.ip;
      await this.loginLimiter.consume(key);
      next();
    } catch (rateLimiterRes) {
      const remainingPoints = rateLimiterRes.remainingPoints;
      const msBeforeNext = rateLimiterRes.msBeforeNext;
      
      res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
      
      return res.status(429).json({
        error: 'Too many attempts',
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.round(msBeforeNext / 1000)
      });
    }
  };

  // Verify WebSocket token
  verifySocketToken = async (token) => {
    try {
      const decoded = this.verifyToken(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid WebSocket token');
    }
  };

  // Session cleanup (to be called periodically)
  cleanupExpiredSessions = async (db) => {
    try {
      await db.deleteExpiredSessions();
      console.log('Expired sessions cleaned up');
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  };
}

module.exports = new AuthMiddleware();
