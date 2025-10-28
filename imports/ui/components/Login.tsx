import { Meteor } from 'meteor/meteor';
import { Button, Label, TextInput } from 'flowbite-react';
import React, { useState } from 'react';

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username || username.trim().length === 0) {
      setError('Username is required');
      return;
    }

    if (!password || password.length === 0) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      // Login with username and password
      await new Promise<void>((resolve, reject) => {
        Meteor.loginWithPassword(username.trim(), password, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      // Success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      if (err.reason === 'User not found') {
        errorMessage = 'Username not found. Please check your username or create an account.';
      } else if (err.reason === 'Incorrect password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field */}
          <div>
            <Label htmlFor="username" value="Username" className="mb-2 block" />
            <TextInput
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="username"
              color={error && !username ? 'failure' : 'gray'}
            />
          </div>

          {/* Password field */}
          <div>
            <Label htmlFor="password" value="Password" className="mb-2 block" />
            <TextInput
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
              color={error && !password ? 'failure' : 'gray'}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" color="blue" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Switch to register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

