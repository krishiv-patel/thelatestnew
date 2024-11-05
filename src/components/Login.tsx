import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/auth';
import { useAuth } from '../context/AuthContext';
import Turnstile from './Turnstile';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  // Memoize the handler to prevent re-renders
  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    if (!turnstileToken) {
      alert('Please complete the security check.');
      return;
    }

    setIsLoading(true);
    try {
      // Send the Turnstile token to the server for verification
      const response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: turnstileToken })
      });

      const result = await response.json();

      if (result.success) {
        // Proceed with Firebase login
        await login(data.email, data.password);
        navigate('/dashboard'); // Redirect to a protected route
      } else {
        alert('Turnstile verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Turnstile Widget */}
          <div>
            <Turnstile onSuccess={handleTurnstileSuccess} />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Logging In...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Social Authentication Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="mt-6">
          <button
            onClick={loginWithGoogle}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Login with Google
          </button>
          <button
            onClick={loginWithMicrosoft}
            className="mt-2 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Login with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;