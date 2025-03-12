const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const oauthUtils = require('./utils/oauth');
const pulumiUtils = require('./utils/pulumi');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.url}`, {
    data: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
  
  // Log response time on completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Response time: ${duration}ms`, {
      data: {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration
      }
    });
  });
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    data: {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    }
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Routes

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'GBQ Integration API',
    version: '1.0.0',
    authUrl: '/auth'
  });
});

// Auth route - redirects to Google OAuth
app.get('/auth', (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/bigquery',
      'https://www.googleapis.com/auth/cloud-platform'
    ];
    
    const authUrl = oauthUtils.getAuthUrl(scopes);
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error generating auth URL', {
      data: { error: error.message, stack: error.stack }
    });
    
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to generate authentication URL'
    });
  }
});

// OAuth callback route
app.get('/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        error: 'Missing Code',
        message: 'Authorization code is required'
      });
    }
    
    // Exchange code for tokens
    const tokens = await oauthUtils.getTokensFromCode(code);
    
    // Check if we have a refresh token
    if (!tokens.refresh_token) {
      logger.warn('No refresh token received');
      return res.status(400).json({
        error: 'Missing Refresh Token',
        message: 'No refresh token was received. Please revoke access and try again.'
      });
    }
    
    // For API requests, return JSON
    if (req.headers.accept === 'application/json') {
      return res.json({
        message: 'Authentication successful',
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      });
    }
    
    // For browser requests, redirect to the React client callback page with the code
    const clientCallbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/callback?code=${code}`;
    res.redirect(clientCallbackUrl);
  } catch (error) {
    logger.error('OAuth callback error', {
      data: { error: error.message, stack: error.stack }
    });
    
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to complete authentication'
    });
  }
});

// Grant access to BigQuery dataset
app.post('/grant-access', async (req, res) => {
  try {
    const { refreshToken, projectId, datasetId } = req.body;
    
    // Validate required fields
    if (!refreshToken || !projectId || !datasetId) {
      return res.status(400).json({
        error: 'Missing Required Fields',
        message: 'Refresh token, project ID, and dataset ID are required'
      });
    }
    
    // Grant access using Pulumi
    const result = await pulumiUtils.grantBigQueryAccess(
      refreshToken,
      projectId,
      datasetId
    );
    
    res.json({
      message: 'Access granted successfully',
      stackName: result.stackName,
      outputs: result.outputs
    });
  } catch (error) {
    logger.error('Error granting access', {
      data: { 
        error: error.message, 
        stack: error.stack,
        projectId: req.body.projectId,
        datasetId: req.body.datasetId
      }
    });
    
    res.status(500).json({
      error: 'Deployment Error',
      message: 'Failed to grant access to BigQuery dataset'
    });
  }
});

// Revoke token
app.post('/revoke', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Missing Token',
        message: 'Token is required'
      });
    }
    
    await oauthUtils.revokeToken(token);
    
    res.json({
      message: 'Token revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking token', {
      data: { error: error.message, stack: error.stack }
    });
    
    res.status(500).json({
      error: 'Revocation Error',
      message: 'Failed to revoke token'
    });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Auth URL: http://localhost:${port}/auth`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    data: { error: error.message, stack: error.stack }
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    data: { reason: reason.toString(), stack: reason.stack }
  });
});
