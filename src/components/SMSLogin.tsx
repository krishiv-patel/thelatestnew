import React, { useState } from 'react';
import { sendSMSVerification, verifySMSCode } from '../utils/auth';
import { ConfirmationResult } from 'firebase/auth';

const SMSLogin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await sendSMSVerification(phoneNumber);
      setConfirmationResult(result);
    } catch (error) {
      // Handle error (e.g., show notification)
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationResult) {
      try {
        await verifySMSCode(confirmationResult, code);
        // Redirect or update UI upon successful verification
      } catch (error) {
        // Handle error (e.g., incorrect code)
      }
    }
  };

  return (
    <div>
      {!confirmationResult ? (
        <form onSubmit={handleSendCode}>
          <h2>Login with Phone Number</h2>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            required
          />
          <div id="recaptcha-container"></div>
          <button type="submit">Send Verification Code</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <h2>Enter Verification Code</h2>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the code you received"
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      )}
    </div>
  );
};

export default SMSLogin; 