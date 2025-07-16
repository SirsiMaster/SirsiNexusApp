const { RateLimiterMemory } = require('rate-limiter-flexible');

// General API rate limiter
const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = new RateLimiterMemory({
  keyPrefix: 'strict',
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Settings update rate limiter
const settingsLimiter = new RateLimiterMemory({
  keyPrefix: 'settings',
  points: 30, // Number of updates
  duration: 60, // Per 60 seconds
});

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const key = req.ip;
    await generalLimiter.consume(key);
    next();
  } catch (rateLimiterRes) {
    const remainingPoints = rateLimiterRes.remainingPoints;
    const msBeforeNext = rateLimiterRes.msBeforeNext;
    
    res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
    res.set('X-RateLimit-Limit', 100);
    res.set('X-RateLimit-Remaining', remainingPoints);
    res.set('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext).toISOString());
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

const strictRateLimit = async (req, res, next) => {
  try {
    const key = req.ip;
    await strictLimiter.consume(key);
    next();
  } catch (rateLimiterRes) {
    const remainingPoints = rateLimiterRes.remainingPoints;
    const msBeforeNext = rateLimiterRes.msBeforeNext;
    
    res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests for this sensitive endpoint.',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

const settingsRateLimit = async (req, res, next) => {
  try {
    const key = req.user ? `user_${req.user.id}` : req.ip;
    await settingsLimiter.consume(key);
    next();
  } catch (rateLimiterRes) {
    const remainingPoints = rateLimiterRes.remainingPoints;
    const msBeforeNext = rateLimiterRes.msBeforeNext;
    
    res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
    
    return res.status(429).json({
      error: 'Settings update limit exceeded',
      message: 'Too many settings updates. Please slow down.',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

module.exports = {
  general: rateLimitMiddleware,
  strict: strictRateLimit,
  settings: settingsRateLimit
};
