import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../generated/graphql';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data, loading, error } = useGetMeQuery();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error.message}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="profile-card">
        <h2>Your Profile</h2>
        {data?.me && (
          <div className="profile-info">
            <p>
              <strong>ID:</strong> {data.me.id}
            </p>
            <p>
              <strong>Name:</strong> {data.me.name}
            </p>
            <p>
              <strong>Email:</strong> {data.me.email}
            </p>
            <p>
              <strong>Role:</strong> {data.me.role || 'N/A'}
            </p>
            <p>
              <strong>Created At:</strong>{' '}
              {data.me.createdAt ? new Date(data.me.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        )}
      </div>

      <div className="dashboard-actions">
        <button onClick={() => navigate('/users')} className="btn-primary">
          Manage Users
        </button>
      </div>
    </div>
  );
};
