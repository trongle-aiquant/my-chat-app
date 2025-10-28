import { Accounts } from 'meteor/accounts-base';
import { Button, Label, TextInput } from 'flowbite-react';
import React, { useState } from 'react';

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!password || password.length === 0) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Create account with username and password
      await new Promise<void>((resolve, reject) => {
        Accounts.createUser(
          {
            username: username.trim(),
            password: password,
          },
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      // Success - user is automatically logged in
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.reason || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field */}
          <div>
            <Label htmlFor="username" value="Username" className="mb-2 block" />
            <TextInput
              id="username"
              type="text"
              placeholder="Choose a username"
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
              placeholder="Choose a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
              color={error && !password ? 'failure' : 'gray'}
            />
          </div>

          {/* Confirm Password field */}
          <div>
            <Label htmlFor="confirmPassword" value="Confirm Password" className="mb-2 block" />
            <TextInput
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
              color={error && password !== confirmPassword ? 'failure' : 'gray'}
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
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Switch to login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

