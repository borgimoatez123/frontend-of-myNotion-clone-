'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            data?: { message?: string };
            status?: number;
            statusText?: string;
          };
          message?: string;
        };
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const message = axiosError.response.data?.message || axiosError.response.statusText;
          setError(`Login failed (${status}): ${message}`);
        } else {
          setError(`Network error: ${axiosError.message || 'Unable to connect to server'}`);
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorWithMessage = err as { message: string };
        setError(`Error: ${errorWithMessage.message}`);
      } else {
        setError('Login failed: Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};