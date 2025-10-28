import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that requires authentication
 * Redirects to /auth if user is not logged in
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Track authentication state reactively
  const { isLoading, userId } = useTracker(() => {
    const user = Meteor.user();
    const userId = Meteor.userId();
    
    // Check if user data is still loading
    const isLoading = !Meteor.loggingIn() && userId === null && user === null;
    
    return {
      isLoading: Meteor.loggingIn(),
      userId,
    };
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!userId) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

