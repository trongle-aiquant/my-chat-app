import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '../components/Login';
import { Register } from '../components/Register';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to chat after successful login/register
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* App branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💬 Meteor Chat</h1>
          <p className="text-gray-600">Real-time messaging made simple</p>
        </div>

        {/* Auth forms */}
        {isLogin ? (
          <Login onSuccess={handleSuccess} onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <Register onSuccess={handleSuccess} onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

