import React from 'react';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  onGoogleSignIn: () => void;
  onMicrosoftSignIn: () => void;
  isLoading: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ onGoogleSignIn, onMicrosoftSignIn, isLoading }) => {
  return (
    <div className="flex justify-center space-x-4">
      <button
        onClick={onGoogleSignIn}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Google</span>
      </button>
      <button
        onClick={onMicrosoftSignIn}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Microsoft</span>
      </button>
    </div>
  );
};

export default SocialAuthButtons;