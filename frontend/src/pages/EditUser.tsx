import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUserQuery, useUpdateUserMutation } from '../generated/graphql';

export const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, loading: queryLoading } = useGetUserQuery({
    variables: { id: id || '' },
    skip: !id,
  });
  const [updateUser, { loading: updateLoading }] = useUpdateUserMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (data?.user) {
      setFormData({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || '',
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!id) {
      setError('User ID is missing');
      return;
    }

    try {
      await updateUser({
        variables: {
          id,
          input: formData,
        },
      });
      setSuccess('User updated successfully!');
      setTimeout(() => navigate('/users'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  if (queryLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="edit-user-container">
      <div className="edit-user-card">
        <h2>Edit User</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
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
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={updateLoading} className="btn-primary">
              {updateLoading ? 'Updating...' : 'Update User'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
