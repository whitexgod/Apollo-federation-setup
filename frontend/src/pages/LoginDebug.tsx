import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../generated/graphql';
import { useAuth } from '../context/AuthContext';

export const LoginDebug: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const [loginMutation, { loading }] = useLoginMutation();

  const addDebug = (msg: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);
    console.log(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo([]);
    addDebug('Form submitted');
    addDebug(`Email: ${formData.email}`);

    try {
      addDebug('Calling loginMutation...');
      const { data } = await loginMutation({
        variables: {
          input: formData,
        },
      });

      addDebug('Mutation completed');
      addDebug(`Data received: ${JSON.stringify(data)}`);

      if (data?.login) {
        addDebug('Login data found');
        addDebug(`Access Token: ${data.login.accessToken?.substring(0, 20)}...`);
        addDebug(`Refresh Token: ${data.login.refreshToken?.substring(0, 20)}...`);
        
        login(
          data.login.accessToken, 
          data.login.refreshToken,
          data.login.user
        );
        addDebug('Auth context updated');
        addDebug('Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        addDebug('No login data in response');
      }
    } catch (err: any) {
      addDebug(`Error caught: ${err.message}`);
      addDebug(`Error details: ${JSON.stringify(err)}`);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login (Debug Mode)</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {debugInfo.length > 0 && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
            <strong>Debug Log:</strong>
            {debugInfo.map((info, idx) => (
              <div key={idx}>{info}</div>
            ))}
          </div>
        )}
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};
