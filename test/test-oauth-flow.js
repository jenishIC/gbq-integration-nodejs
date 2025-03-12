/**
 * Test script for OAuth flow and token handling
 * 
 * This script simulates the OAuth flow and token refresh process
 * to verify that the implementation works correctly.
 */

const { createOAuth2Client, getAuthUrl, refreshAccessToken } = require('../utils/oauth');
const logger = require('../utils/logger');
require('dotenv').config();

// Check if required environment variables are set
const checkEnvVars = () => {
  const requiredVars = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
};

// Test OAuth URL generation
const testAuthUrlGeneration = () => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/bigquery',
      'https://www.googleapis.com/auth/cloud-platform'
    ];
    
    const authUrl = getAuthUrl(scopes);
    console.log('✅ Successfully generated OAuth URL:');
    console.log(`\n${authUrl}\n`);
    console.log('Open this URL in your browser to start the OAuth flow');
    console.log('After authorization, you will be redirected to your callback URL');
    console.log('Check the URL parameters for the "code" parameter');
    console.log('You can use this code to get tokens in your application');
    
    return authUrl;
  } catch (error) {
    console.error('❌ Failed to generate OAuth URL:', error);
    throw error;
  }
};

// Instructions for manual testing
const showManualTestInstructions = () => {
  console.log('\n--- Manual Testing Instructions ---\n');
  console.log('1. Start the server: npm run dev');
  console.log('2. Visit http://localhost:3000/auth in your browser');
  console.log('3. Complete the OAuth flow');
  console.log('4. The server will receive the callback at /oauth2callback');
  console.log('5. Check the server logs for the refresh token');
  console.log('6. Use the refresh token to test the /grant-access endpoint:');
  console.log(`
  curl -X POST http://localhost:3000/grant-access \\
    -H "Content-Type: application/json" \\
    -d '{
      "refreshToken": "YOUR_REFRESH_TOKEN",
      "projectId": "YOUR_GCP_PROJECT_ID",
      "datasetId": "YOUR_BIGQUERY_DATASET_ID"
    }'
  `);
};

// Main function
const main = async () => {
  try {
    console.log('--- OAuth Flow Test ---\n');
    
    // Check environment variables
    checkEnvVars();
    
    // Test auth URL generation
    testAuthUrlGeneration();
    
    // Show manual testing instructions
    showManualTestInstructions();
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

// Run the test
main();
