import React, { useState } from 'react';

interface TwoFactorSetupProps {
  secretKey: string;
  onVerify: (code: string) => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ secretKey, onVerify }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  return (
    <div className="p-4 bg-yellow-50 rounded-md">
      <h3 className="text-lg font-medium text-yellow-800">Set up Two-Factor Authentication</h3>
      <p className="mt-2 text-sm text-yellow-700">
        Scan the QR code with your authenticator app and enter the code below.
      </p>
      {/* Replace with a proper QR code generator */}
      <div className="mt-4 flex justify-center">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/YourAppName?secret=${secretKey}&issuer=YourAppName`} 
          alt="2FA QR Code" 
          className="w-32 h-32"
        />
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 2FA Code"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
        <button
          type="submit"
          className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default TwoFactorSetup;