import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get the code from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        
        if (!code) {
          setStatus('error');
          setError('No authorization code found in the URL');
          return;
        }
        
        // Process the code to get tokens
        const response = await apiService.processCallback(code);
        
        // Check if we got a refresh token
        if (!response.refreshToken) {
          setStatus('error');
          setError('No refresh token received. Please try again.');
          return;
        }
        
        // Store token data
        setTokenData({
          refreshToken: response.refreshToken,
          expiryDate: response.expiryDate
        });
        
        // Update status
        setStatus('success');
        
        // In a real app, you might store the token in localStorage or a secure cookie
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setStatus('error');
        setError(error.message || 'Failed to process authentication');
      }
    };
    
    processOAuthCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          OAuth Authentication
        </h1>
        
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing authentication...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Authentication Successful!</p>
              <p>You have successfully authenticated with Google.</p>
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-semibold mb-2">Refresh Token:</h3>
              <p className="font-mono text-sm break-all bg-gray-200 p-2 rounded">
                {tokenData?.refreshToken.substring(0, 10)}...
              </p>
              
              <h3 className="font-semibold mt-4 mb-2">Expiry Date:</h3>
              <p className="font-mono text-sm bg-gray-200 p-2 rounded">
                {tokenData?.expiryDate ? new Date(tokenData.expiryDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <p className="mt-4 text-gray-600">
              Redirecting to dashboard in a moment...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Authentication Failed</p>
              <p>{error || 'An unknown error occurred'}</p>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
