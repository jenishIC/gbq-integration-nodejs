const { google } = require('googleapis');
const logger = require('./logger');
require('dotenv').config();

// Create OAuth2 client
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
};

// Generate authorization URL
const getAuthUrl = (scopes = ['https://www.googleapis.com/auth/bigquery']) => {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get a refresh token
    prompt: 'consent', // Force to get a new refresh token
    scope: scopes,
  });
};

// Exchange authorization code for tokens
const getTokensFromCode = async (code) => {
  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    logger.info('Successfully obtained tokens', { 
      data: { 
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date
      } 
    });
    
    return tokens;
  } catch (error) {
    logger.error('Error getting tokens from code', { 
      data: { error: error.message, stack: error.stack } 
    });
    throw error;
  }
};

// Check if token is expired
const isTokenExpired = (expiryDate) => {
  if (!expiryDate) return true;
  
  // Add a 5-minute buffer to ensure we refresh before actual expiry
  const bufferMs = 5 * 60 * 1000;
  return Date.now() >= (expiryDate - bufferMs);
};

// Refresh access token using refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    logger.info('Successfully refreshed access token', { 
      data: { 
        hasAccessToken: !!credentials.access_token,
        expiryDate: credentials.expiry_date
      } 
    });
    
    return credentials;
  } catch (error) {
    logger.error('Error refreshing access token', { 
      data: { error: error.message, stack: error.stack } 
    });
    throw error;
  }
};

// Get a valid access token (refreshing if necessary)
const getValidAccessToken = async (refreshToken, expiryDate) => {
  try {
    // Check if token is expired
    if (isTokenExpired(expiryDate)) {
      logger.info('Access token expired, refreshing...');
      const newCredentials = await refreshAccessToken(refreshToken);
      return {
        accessToken: newCredentials.access_token,
        expiryDate: newCredentials.expiry_date
      };
    }
    
    // Token is still valid
    logger.info('Using existing access token');
    return null; // No need to refresh
  } catch (error) {
    logger.error('Error getting valid access token', { 
      data: { error: error.message, stack: error.stack } 
    });
    throw error;
  }
};

// Revoke token
const revokeToken = async (token) => {
  try {
    const oauth2Client = createOAuth2Client();
    await oauth2Client.revokeToken(token);
    logger.info('Token revoked successfully');
    return true;
  } catch (error) {
    logger.error('Error revoking token', { 
      data: { error: error.message, stack: error.stack } 
    });
    throw error;
  }
};

module.exports = {
  createOAuth2Client,
  getAuthUrl,
  getTokensFromCode,
  isTokenExpired,
  refreshAccessToken,
  getValidAccessToken,
  revokeToken
};
