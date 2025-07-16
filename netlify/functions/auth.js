const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// Environment variables (set these in Netlify dashboard)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const BCRYPT_ROUNDS = 12;

// In-memory user store (replace with database in production)
const users = {
  'admin': {
    id: 'admin',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGjqsKHVFWVTGBS', // admin2025
    role: 'admin',
    name: 'Administrator',
    email: 'admin@sirsinexus.com',
    createdAt: new Date().toISOString()
  },
  'demo': {
    id: 'demo',
    passwordHash: '$2a$12$UjVGhZWV/KXfAzCJjIgK6OXFTUJnzQnLqKmAEJlmgFpSQzIcGVgKC', // investor2025
    role: 'investor',
    name: 'Demo Investor',
    email: 'demo@sirsinexus.com',
    createdAt: new Date().toISOString()
  }
};

// Rate limiting store (in memory - use Redis in production)
const rateLimitStore = new Map();

// Rate limiting function
function isRateLimited(ip) {
  const key = `rate_limit_${ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  const record = rateLimitStore.get(key);
  
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Set secure cookie
function setSecureCookie(name, value, maxAge = 8 * 60 * 60 * 1000) {
  return cookie.serialize(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: maxAge / 1000,
    path: '/'
  });
}

exports.handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Get client IP for rate limiting
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    const path = event.path.replace('/.netlify/functions/auth', '');
    
    // LOGIN ENDPOINT
    if (event.httpMethod === 'POST' && path === '/login') {
      // Rate limiting check
      if (isRateLimited(clientIP)) {
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Too many login attempts. Please try again in 15 minutes.'
          })
        };
      }

      const { investorId, accessCode } = JSON.parse(event.body);

      // Validate input
      if (!investorId || !accessCode) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Investor ID and access code are required'
          })
        };
      }

      // Check if user exists
      const user = users[investorId];
      if (!user) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Invalid credentials'
          })
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(accessCode, user.passwordHash);
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Invalid credentials'
          })
        };
      }

      // Generate JWT token
      const token = generateToken(user);

      // Set secure cookie
      const cookieHeader = setSecureCookie('auth-token', token);

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Set-Cookie': cookieHeader
        },
        body: JSON.stringify({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        })
      };
    }

    // VERIFY TOKEN ENDPOINT
    if (event.httpMethod === 'POST' && path === '/verify') {
      const authHeader = event.headers.authorization;
      const cookies = cookie.parse(event.headers.cookie || '');
      
      const token = authHeader?.replace('Bearer ', '') || cookies['auth-token'];

      if (!token) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'No token provided'
          })
        };
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Invalid or expired token'
          })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          valid: true,
          user: {
            id: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
          }
        })
      };
    }

    // LOGOUT ENDPOINT
    if (event.httpMethod === 'POST' && path === '/logout') {
      const cookieHeader = setSecureCookie('auth-token', '', 0);

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Set-Cookie': cookieHeader
        },
        body: JSON.stringify({
          success: true
        })
      };
    }

    // CHANGE PASSWORD ENDPOINT
    if (event.httpMethod === 'POST' && path === '/change-password') {
      const authHeader = event.headers.authorization;
      const cookies = cookie.parse(event.headers.cookie || '');
      
      const token = authHeader?.replace('Bearer ', '') || cookies['auth-token'];

      if (!token) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Authentication required'
          })
        };
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Invalid or expired token'
          })
        };
      }

      const { currentPassword, newPassword } = JSON.parse(event.body);

      if (!currentPassword || !newPassword) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Current password and new password are required'
          })
        };
      }

      const user = users[decoded.userId];
      if (!user) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'User not found'
          })
        };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Current password is incorrect'
          })
        };
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      user.passwordHash = newPasswordHash;

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Password changed successfully'
        })
      };
    }

    // 404 for unknown endpoints
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Endpoint not found'
      })
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};
