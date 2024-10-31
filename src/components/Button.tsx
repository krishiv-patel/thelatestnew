import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', isLoading = false, children, ...props }) => {
  let className =
    'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

  switch (variant) {
    case 'secondary':
      className += ' bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      break;
    case 'outline':
      className += ' bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-green-500';
      break;
    case 'primary':
    default:
      className += ' bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
      break;
  }

  return (
    <button className={className} disabled={isLoading} {...props}>
      {isLoading && <Spinner />}
      {children}
    </button>
  );
};

export default Button; 