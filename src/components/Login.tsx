import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import { AlertCircle } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa'; // Import Google Icon
import Button from './Button';
import Spinner from './Spinner';
import ReactCountryFlag from 'react-country-flag'; // Import the flag component
import Select, { components } from 'react-select'; // Import react-select

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

// Define the shape of a country option
interface CountryOption {
  label: React.ReactNode;
  value: string;
}

// Create the options for react-select
const countryOptions: CountryOption[] = [
  { label: <><ReactCountryFlag countryCode="US" svg style={{ marginRight: '8px' }} /> United States (+1)</>, value: '+1' },
  { label: <><ReactCountryFlag countryCode="IN" svg style={{ marginRight: '8px' }} /> India (+91)</>, value: '+91' },
  { label: <><ReactCountryFlag countryCode="GB" svg style={{ marginRight: '8px' }} /> United Kingdom (+44)</>, value: '+44' },
  { label: <><ReactCountryFlag countryCode="AE" svg style={{ marginRight: '8px' }} /> United Arab Emirates (+971)</>, value: '+971' },
  { label: <><ReactCountryFlag countryCode="SA" svg style={{ marginRight: '8px' }} /> Saudi Arabia (+966)</>, value: '+966' },
  { label: <><ReactCountryFlag countryCode="CA" svg style={{ marginRight: '8px' }} /> Canada (+1)</>, value: '+1' },
  { label: <><ReactCountryFlag countryCode="AU" svg style={{ marginRight: '8px' }} /> Australia (+61)</>, value: '+61' },
  { label: <><ReactCountryFlag countryCode="KW" svg style={{ marginRight: '8px' }} /> Kuwait (+965)</>, value: '+965' },
  { label: <><ReactCountryFlag countryCode="OM" svg style={{ marginRight: '8px' }} /> Oman (+968)</>, value: '+968' },
  { label: <><ReactCountryFlag countryCode="QA" svg style={{ marginRight: '8px' }} /> Qatar (+974)</>, value: '+974' },
  { label: <><ReactCountryFlag countryCode="SG" svg style={{ marginRight: '8px' }} /> Singapore (+65)</>, value: '+65' },
  { label: <><ReactCountryFlag countryCode="MY" svg style={{ marginRight: '8px' }} /> Malaysia (+60)</>, value: '+60' },
  { label: <><ReactCountryFlag countryCode="NP" svg style={{ marginRight: '8px' }} /> Nepal (+977)</>, value: '+977' },
  { label: <><ReactCountryFlag countryCode="BH" svg style={{ marginRight: '8px' }} /> Bahrain (+973)</>, value: '+973' },
  { label: <><ReactCountryFlag countryCode="ZA" svg style={{ marginRight: '8px' }} /> South Africa (+27)</>, value: '+27' },
  { label: <><ReactCountryFlag countryCode="NZ" svg style={{ marginRight: '8px' }} /> New Zealand (+64)</>, value: '+64' },
  { label: <><ReactCountryFlag countryCode="DE" svg style={{ marginRight: '8px' }} /> Germany (+49)</>, value: '+49' },
  { label: <><ReactCountryFlag countryCode="FR" svg style={{ marginRight: '8px' }} /> France (+33)</>, value: '+33' },
  { label: <><ReactCountryFlag countryCode="NL" svg style={{ marginRight: '8px' }} /> Netherlands (+31)</>, value: '+31' },
  { label: <><ReactCountryFlag countryCode="IT" svg style={{ marginRight: '8px' }} /> Italy (+39)</>, value: '+39' },
  { label: <><ReactCountryFlag countryCode="JP" svg style={{ marginRight: '8px' }} /> Japan (+81)</>, value: '+81' },
  { label: <><ReactCountryFlag countryCode="BE" svg style={{ marginRight: '8px' }} /> Belgium (+32)</>, value: '+32' },
  // Add more countries as needed
];

// Custom Option component to better display flags
const CustomOption = (props: any) => (
  <components.Option {...props}>
    <div className="flex items-center">
      {props.data.label.props.children[0]}
      <span>{props.data.label.props.children.slice(1)}</span>
    </div>
  </components.Option>
);

// Custom SingleValue component to display flag in selected option
const CustomSingleValue = (props: any) => (
  <components.SingleValue {...props}>
    <div className="flex items-center">
      {props.data.label.props.children[0]}
      <span>{props.data.label.props.children.slice(1)}</span>
    </div>
  </components.SingleValue>
);

export default function Login() {
  const { login, signInWithGoogle, signInWithPhone, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countryOptions[1]); // Default to India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(email, password);
      navigate('/profile');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      navigate('/profile');
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        setErrorMessage('Popup was blocked. Please allow popups for this site and try again.');
      } else {
        setErrorMessage(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log('reCAPTCHA resolved');
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            console.log('reCAPTCHA expired');
          },
        });
      }
      // Combine country code with phone number
      const fullPhoneNumber = `${selectedCountry.value}${phoneNumber}`;
      const confirmation = await signInWithPhone(fullPhoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send verification code');
      console.error('Phone sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (confirmationResult && verificationCode) {
        await confirmationResult.confirm(verificationCode);
        navigate('/profile');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Invalid verification code');
      console.error('Verification code error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {(authError || errorMessage) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {authError || errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email and Password Fields */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email-address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={loading} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                loading ? 'cursor-not-allowed' : ''
              }`}
            >
              {/* Google Logo */}
              <FaGoogle className="w-5 h-5 mr-2" aria-hidden="true" />
              Sign in with Google
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-2">
              {/* Country Code Selector using react-select */}
              <div className="w-32">
                <Select
                  value={selectedCountry}
                  onChange={(selected) => setSelectedCountry(selected as CountryOption)}
                  options={countryOptions}
                  isDisabled={loading}
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      borderColor: '#D1D5DB', // Tailwind gray-300
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#10B981', // Tailwind green-500
                      },
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      display: 'flex',
                      alignItems: 'center',
                    }),
                  }}
                  components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                  }}
                />
              </div>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handlePhoneSignIn}
                disabled={loading || !phoneNumber}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !phoneNumber
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
              >
                Send Code
              </button>
            </div>

            {confirmationResult && (
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Verification code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading || !verificationCode}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !verificationCode
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
                >
                  Verify
                </button>
              </div>
            )}
          </div>
        </div>

        <div id="recaptcha-container"></div>

        <div className="text-sm text-center">
          <Link
            to="/signup"
            className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}