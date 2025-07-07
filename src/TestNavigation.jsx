import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

const TestNavigation = () => {
  const { login, user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testLogin = async (username, password) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await login(username, password);
      if (result.success) {
        // Login successful, the AuthContext will handle the redirect
        console.log('Login successful');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Test Navigation</h2>
      
      {user ? (
        <div>
          <p>Currently logged in as: <strong>{user.username}</strong> (Role: {user.roleName})</p>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Login with test credentials:</p>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => testLogin('admin', '12345678')}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
            
            <button 
              onClick={() => testLogin('owner', '12345678')}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Logging in...' : 'Login as Owner'}
            </button>
            
            <button 
              onClick={() => testLogin('guard', '12345678')}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#ffc107', 
                color: 'black', 
                border: 'none', 
                borderRadius: '5px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Logging in...' : 'Login as Guard'}
            </button>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>Test Credentials:</strong></p>
            <p>Admin: admin / 12345678</p>
            <p>Owner: owner / 12345678</p>
            <p>Guard: guard / 12345678</p>
            <p><em>Note: You may need to create these users in your backend first</em></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestNavigation; 