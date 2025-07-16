const express = require('express');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Infrastructure optimization
router.post('/optimize', auth, rateLimit.strict, async (req, res, next) => {
  try {
    const { resources, preferences = {} } = req.body;
    
    if (!resources || !Array.isArray(resources)) {
      return res.status(400).json({ 
        error: 'Resources array is required' 
      });
    }

    const result = await req.app.locals.aiService.generateInfrastructureOptimizations(
      req.user.id, 
      resources
    );

    res.json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      message: 'Infrastructure optimization analysis started'
    });
  } catch (error) {
    next(error);
  }
});

// Security analysis
router.post('/security-analysis', auth, rateLimit.strict, async (req, res, next) => {
  try {
    const { resources, configuration } = req.body;
    
    if (!resources || !Array.isArray(resources)) {
      return res.status(400).json({ 
        error: 'Resources array is required' 
      });
    }

    const result = await req.app.locals.aiService.generateSecurityAnalysis(
      req.user.id, 
      resources,
      configuration || {}
    );

    res.json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      message: 'Security analysis started'
    });
  } catch (error) {
    next(error);
  }
});

// Performance recommendations
router.post('/performance-analysis', auth, rateLimit.strict, async (req, res, next) => {
  try {
    const { metrics } = req.body;
    
    if (!metrics) {
      return res.status(400).json({ 
        error: 'Performance metrics are required' 
      });
    }

    const result = await req.app.locals.aiService.generatePerformanceRecommendations(
      req.user.id, 
      metrics
    );

    res.json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      message: 'Performance analysis started'
    });
  } catch (error) {
    next(error);
  }
});

// Get AI job status
router.get('/jobs/:jobId', auth, async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    const job = await req.app.locals.aiService.getAIJob(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found' 
      });
    }

    // Ensure user owns this job
    if (job.user_id !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    res.json({
      success: true,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        result: job.result ? JSON.parse(job.result) : null,
        error: job.error_message,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's AI jobs
router.get('/jobs', auth, async (req, res, next) => {
  try {
    const { limit = 50, type } = req.query;
    
    const jobs = await req.app.locals.aiService.getUserAIJobs(req.user.id, parseInt(limit));
    
    // Filter by type if specified
    const filteredJobs = type ? jobs.filter(job => job.type === type) : jobs;
    
    res.json({
      success: true,
      jobs: filteredJobs.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        result: job.result ? JSON.parse(job.result) : null,
        error: job.error_message,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Chat with AI
router.post('/chat', auth, rateLimit.general, async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({ 
        error: 'Message too long (max 2000 characters)' 
      });
    }

    const result = await req.app.locals.aiService.chatWithAI(
      req.user.id, 
      message.trim(),
      context
    );

    res.json({
      success: true,
      response: result.response,
      timestamp: result.timestamp
    });
  } catch (error) {
    next(error);
  }
});

// Get AI service status
router.get('/status', auth, async (req, res, next) => {
  try {
    const isHealthy = req.app.locals.aiService.isHealthy();
    const services = req.app.locals.aiService.getAvailableServices();
    
    res.json({
      success: true,
      healthy: isHealthy,
      services,
      message: isHealthy ? 'AI services are available' : 'AI services are not configured'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
