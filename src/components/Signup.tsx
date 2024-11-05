import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import ReactCountryFlag from 'react-country-flag';
import Select, { components } from 'react-select';
import Button from './Button';

interface CountryOption {
  label: React.ReactNode;
  value: string;
}

const countryOptions: CountryOption[] = [
  { label: <><ReactCountryFlag countryCode="US" svg style={{ marginRight: '8px' }} /> United States (+1)</>, value: '+1' },
  { label: <><ReactCountryFlag countryCode="IN" svg style={{ marginRight: '8px' }} /> India (+91)</>, value: '+91' },
  // ... other countries
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

export default function Signup() {
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countryOptions[0]); // Default to first country
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Combine country code with phone number before signup
      const fullPhoneNumber = `${selectedCountry.value}${phoneNumber}`;
      await signup(email, password, fullPhoneNumber);
      alert('A verification email has been sent to your email address. Please verify to continue.');
      navigate('/profile'); // Redirect after successful signup
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      navigate('/profile');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        {errorMessage && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{errorMessage}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={loading}
              />
            </div>

            {/* Country Selector and Phone Number Input */}
            <div className="flex items-center space-x-2 mt-4">
              {/* Country Selector using react-select */}
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
                required
              />
            </div>

            <div className="mt-4">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={loading} disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className={`w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                loading ? 'cursor-not-allowed' : ''
              }`}
            >
              {/* Google Logo */}
              <FaGoogle className="w-5 h-5 mr-2" aria-hidden="true" />
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
