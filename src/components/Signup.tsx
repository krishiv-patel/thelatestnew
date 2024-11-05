import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signupSchema, type SignupFormData } from '../schemas/auth';
import { Turnstile } from '@marsidev/react-turnstile';
import PasswordStrengthIndicator from './auth/PasswordStrengthIndicator';
import TwoFactorSetup from './auth/TwoFactorSetup';
import Select from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';

const options = {
  translations: zxcvbnCommonPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
  },
};

zxcvbnOptions.setOptions(options);

const countryOptions = [
  { value: '+1', label: 'US', code: 'US' },
  { value: '+44', label: 'UK', code: 'GB' },
  { value: '+91', label: 'IN', code: 'IN' },
  // Add more country options as needed
].map(option => ({
  value: option.value,
  label: (
    <div className="flex items-center">
      <ReactCountryFlag
        countryCode={option.code}
        svg
        className="mr-2"
      />
      {option.value}
    </div>
  )
}));

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isValid, dirtyFields },
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  const password = watch('password', '');
  const passwordStrength = password ? zxcvbn(password) : null;

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setError('Captcha verification failed. Please try again.');
    setTurnstileToken(null);
  }, []);

  const onSubmit = async (data: SignupFormData) => {
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    if (passwordStrength && passwordStrength.score < 3) {
      setError('Please choose a stronger password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: turnstileToken })
      });

      const result = await response.json();

      if (result.success) {
        const { user, twoFactorSecret: secret } = await signup({
          ...data,
          captchaToken: turnstileToken
        });

        if (secret) {
          setTwoFactorSecret(secret);
          setShowTwoFactorSetup(true);
        } else {
          setVerificationEmailSent(true);
          reset();
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        }
      } else {
        setError('Security verification failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'microsoft') => {
    try {
      setIsLoading(true);
      setError(null);
      await (provider === 'google' ? signInWithGoogle() : signInWithMicrosoft());
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || `${provider} signup failed.`);
      console.error(`${provider} signup error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerification = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Verify 2FA code with backend
      await fetch('/api/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      setVerificationEmailSent(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error: any) {
      setError(error.message || 'Failed to verify 2FA code.');
      console.error('2FA verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Sign in
            </Link>
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-md bg-red-50 p-4"
            >
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </motion.div>
          )}

          {verificationEmailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-md bg-green-50 p-4"
            >
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Verification email sent
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    Please check your email to verify your account. Redirecting to login...
                  </p>
                </div>
              </div>
            </motion.div>
          ) : showTwoFactorSetup ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TwoFactorSetup
                secretKey={twoFactorSecret}
                onVerify={handleTwoFactorVerification}
                isLoading={isLoading}
                error={error}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div className="rounded-md shadow-sm space-y-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.name
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className={`mt-1 block w-full rounded-md shadow-sm ${
                          errors.password
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                    {password && <PasswordStrengthIndicator password={password} />}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className={`mt-1 block w-full rounded-md shadow-sm ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <Controller
                        name="countryCode"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={countryOptions}
                            className="w-32"
                            isDisabled={isLoading}
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                              }),
                            }}
                          />
                        )}
                      />
                      <input
                        type="tel"
                        {...register('phoneNumber')}
                        className={`flex-1 min-w-0 block rounded-none rounded-r-md ${
                          errors.phoneNumber
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-center">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      {...register('acceptTerms')}
                      className={`h-4 w-4 rounded ${
                        errors.acceptTerms
                          ? 'border-red-300 text-red-600 focus:ring-red-500'
                          : 'border-gray-300 text-green-600 focus:ring-green-500'
                      }`}
                      disabled={isLoading}
                    />
                    <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                      I accept the{' '}
                      <Link to="/terms" className="text-green-600 hover:text-green-500">
                        Terms and Conditions
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
                  )}
                </div>

                {/* Turnstile */}
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={handleTurnstileSuccess}
                    onError={handleTurnstileError}
                    options={{
                      theme: 'light',
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || isLoading || !turnstileToken}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isLoading || !isValid || !turnstileToken
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    'Sign up'
                  )}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialSignup('google')}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sign up with Google</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleSocialSignup('microsoft')}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sign up with Microsoft</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                      />
                    </svg>
                  </button>
                </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Signup;