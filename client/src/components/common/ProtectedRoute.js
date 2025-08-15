import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // You can show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If the user is not logged in, redirect them to the login page.
    return <Navigate to="/login" replace />;
  }

  // The user's role might be 'super-admin', which should be treated as 'admin'
  const userRole = user.role === 'super-admin' ? 'admin' : user.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If the user's role is not allowed for this route, redirect them.
    // A good practice is to redirect to their own dashboard or a "not authorized" page.
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;