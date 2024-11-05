import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[@$!%*?&#]/.test(pw)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  let strengthLabel = '';
  let strengthColor = '';

  switch (strength) {
    case 0:
    case 1:
      strengthLabel = 'Weak';
      strengthColor = 'bg-red-500';
      break;
    case 2:
      strengthLabel = 'Fair';
      strengthColor = 'bg-yellow-500';
      break;
    case 3:
      strengthLabel = 'Good';
      strengthColor = 'bg-blue-500';
      break;
    case 4:
      strengthLabel = 'Strong';
      strengthColor = 'bg-green-500';
      break;
    default:
      break;
  }

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-300 h-2 rounded">
        <div className={`h-2 rounded ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }}></div>
      </div>
      <p className="text-sm mt-1 text-gray-600">Password strength: {strengthLabel}</p>
    </div>
  );
};

export default PasswordStrengthIndicator;