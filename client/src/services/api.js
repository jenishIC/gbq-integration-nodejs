import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  // No baseURL needed since we're using the Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
const apiService = {
  // Get auth URL for OAuth flow
  getAuthUrl: async () => {
    try {
      const response = await api.get('/auth');
      return response.data;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  },

  // Process OAuth callback
  processCallback: async (code) => {
    try {
      const response = await api.get(`/oauth2callback?code=${code}`);
      return response.data;
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      throw error;
    }
  },

  // Grant access to BigQuery dataset
  grantAccess: async (refreshToken, projectId, datasetId) => {
    try {
      const response = await api.post('/grant-access', {
        refreshToken,
        projectId,
        datasetId,
      });
      return response.data;
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  },

  // Revoke token
  revokeToken: async (token) => {
    try {
      const response = await api.post('/revoke', { token });
      return response.data;
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  },
};

export default apiService;
