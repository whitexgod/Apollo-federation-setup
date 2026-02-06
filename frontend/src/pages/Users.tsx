import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsersQuery, useDeleteUserMutation } from '../generated/graphql';

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUser({ variables: { id } });
      refetch();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error.message}</div>;

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Users Management</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      {deleteError && <div className="error-message">{deleteError}</div>}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role || 'N/A'}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td className="actions">
                  <button
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    className="btn-small btn-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
