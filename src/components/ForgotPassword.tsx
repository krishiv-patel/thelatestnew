import React, { useState } from 'react';
import { resetPassword } from '../utils/auth';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await resetPassword(data.email);
      setMessage({ type: 'success', text: 'Password reset email sent successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send password reset email.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
        </div>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50 border border-green-400 text-green-700' : 'bg-red-50 border border-red-400 text-red-700'
            }`}
          >
            <div className="flex">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <div className="ml-3">
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          </motion.div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { required: 'Email is required.' })}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;