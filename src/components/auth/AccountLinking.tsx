import React from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import * as urlLib from 'url';

const allowedHosts = ['microsoft.com'];

const isAllowedHost = (providerUrl: string) => {
  const host = urlLib.parse(providerUrl).host;
  return allowedHosts.includes(host);
};

const AccountLinking: React.FC = () => {
  const { user, loading, linkAccount, unlinkAccount } = useAuth();

  const connectedProviders = user?.providerData.map(provider => provider.providerId) || [];

  const handleLink = async (provider: 'google' | 'microsoft') => {
    try {
      await linkAccount(provider);
    } catch (error) {
      console.error('Error linking account:', error);
    }
  };

  const handleUnlink = async (providerId: string) => {
    if (connectedProviders.length <= 1) {
      alert('You must keep at least one sign-in method.');
      return;
    }
    try {
      await unlinkAccount(providerId);
    } catch (error) {
      console.error('Error unlinking account:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
      
      <div className="space-y-4">
        {/* Google Account */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              />
            </svg>
            <span>Google</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => connectedProviders.includes('google.com') 
              ? handleUnlink('google.com')
              : handleLink('google')
            }
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              connectedProviders.includes('google.com')
                ? 'text-red-600 hover:text-red-700'
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : connectedProviders.includes('google.com') ? (
              'Disconnect'
            ) : (
              'Connect'
            )}
          </motion.button>
        </div>

        {/* Microsoft Account */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
              />
            </svg>
            <span>Microsoft</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => connectedProviders.some(provider => isAllowedHost(provider))
              ? handleUnlink('microsoft.com')
              : handleLink('microsoft')
            }
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              connectedProviders.some(provider => isAllowedHost(provider))
                ? 'text-red-600 hover:text-red-700'
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : connectedProviders.some(provider => isAllowedHost(provider)) ? (
              'Disconnect'
            ) : (
              'Connect'
            )}
          </motion.button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Connecting multiple accounts allows you to sign in using any of them.
      </p>
    </div>
  );
};

export default AccountLinking;