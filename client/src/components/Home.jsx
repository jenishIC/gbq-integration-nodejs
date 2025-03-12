import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleStartAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, we would redirect to the auth URL
      // For this demo, we'll just redirect to the auth endpoint
      window.location.href = '/auth';
    } catch (error) {
      setError('Failed to start authentication process');
      console.error('Auth error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Google BigQuery Integration
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          This application demonstrates OAuth2 authentication with Google and 
          granting access to BigQuery datasets using Pulumi Automation API.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleStartAuth}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start OAuth Flow'}
          </button>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click the button above to start the OAuth flow</li>
              <li>Authorize the application to access your Google account</li>
              <li>You'll be redirected back with a refresh token</li>
              <li>Use the refresh token to grant access to BigQuery datasets</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
