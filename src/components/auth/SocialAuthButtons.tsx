import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  onGoogleSignIn: () => Promise<void>;
  onMicrosoftSignIn: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleSignIn,
  onMicrosoftSignIn,
  isLoading,
  disabled
}) => {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGoogleSignIn}
        disabled={isLoading || disabled}
        className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-gray-600 transition-colors duration-300 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onMicrosoftSignIn}
        disabled={isLoading || disabled}
        className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-gray-600 transition-colors duration-300 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Sign in with Microsoft"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
              />
            </svg>
            <span>Continue with Microsoft</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default SocialAuthButtons;