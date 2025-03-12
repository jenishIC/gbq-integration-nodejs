import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Dashboard = () => {
  const [refreshToken, setRefreshToken] = useState('');
  const [projectId, setProjectId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have a refresh token in localStorage
    const storedToken = localStorage.getItem('refreshToken');
    if (storedToken) {
      setRefreshToken(storedToken);
    }
  }, []);
  
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    
    if (!refreshToken || !projectId || !datasetId) {
      setError('All fields are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const response = await apiService.grantAccess(refreshToken, projectId, datasetId);
      
      setResult({
        message: response.message,
        stackName: response.stackName,
        outputs: response.outputs
      });
      
    } catch (error) {
      console.error('Error granting access:', error);
      setError(error.response?.data?.message || error.message || 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('refreshToken');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">BigQuery Access Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Grant BigQuery Access</h2>
          
          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="refreshToken">
                Refresh Token
              </label>
              <input
                id="refreshToken"
                type="text"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your OAuth refresh token"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="projectId">
                GCP Project ID
              </label>
              <input
                id="projectId"
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., my-gcp-project-123"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="datasetId">
                BigQuery Dataset ID
              </label>
              <input
                id="datasetId"
                type="text"
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., my_dataset"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Grant Access'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {result && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Deployment Result</h2>
            
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">{result.message}</p>
              <p>Stack Name: {result.stackName}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Outputs:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(result.outputs, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
