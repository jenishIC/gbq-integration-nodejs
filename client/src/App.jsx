import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import OAuthCallback from './components/OAuthCallback';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
