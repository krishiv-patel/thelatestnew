import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';
import { AlertCircle, Eye, EyeOff, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signupSchema, type SignupFormData } from '../schemas/auth';
import SocialAuthButtons from './auth/SocialAuthButtons';
import PasswordStrengthIndicator from './auth/PasswordStrengthIndicator';
import TwoFactorSetup from './auth/TwoFactorSetup';
import Select from 'react-select';
import ReactCountryFlag from 'react-country-flag';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isValid, dirtyFields }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  const password = watch('password', '');

  const onSubmit = async (data: SignupFormData) => {
    if (!captchaToken) {
      alert('Please complete the CAPTCHA verification');
      return;
    }

    setIsLoading(true);
    try {
      const { user, twoFactorSecret } = await signup({ ...data, captchaToken });
      
      if (twoFactorSecret) {
        setTwoFactorSecret(twoFactorSecret);
        setShowTwoFactorSetup(true);
      } else {
        setVerificationEmailSent(true);
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/profile');
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      await signInWithMicrosoft();
      navigate('/profile');
    } catch (error) {
      console.error('Microsoft sign-in error:', error);
    }
  };

  const handleTwoFactorVerification = async (code: string) => {
    try {
      setVerificationEmailSent(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <AnimatePresence mode="wait">
          {verificationEmailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-md bg-green-50 p-4"
            >
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
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
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                            options={[
                              { value: '+1', label: <><ReactCountryFlag countryCode="US" svg /> +1</> },
                              { value: '+44', label: <><ReactCountryFlag countryCode="GB" svg /> +44</> },
                              { value: '+91', label: <><ReactCountryFlag countryCode="IN" svg /> +91</> },
                            ]}
                            className="w-32"
                          />
                        )}
                      />
                      <input
                        type="tel"
                        {...register('phoneNumber')}
                        className="flex-1 min-w-0 block rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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

                {/* CAPTCHA */}
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={(token: string) => setCaptchaToken(token)}
                    options={{
                      theme: 'light',
                      // Add other options if necessary
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid || !captchaToken}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin h-5 w-5" />
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <SocialAuthButtons
                    onGoogleSignIn={handleGoogleSignIn}
                    onMicrosoftSignIn={handleMicrosoftSignIn}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;