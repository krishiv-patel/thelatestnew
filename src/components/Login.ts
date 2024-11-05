import React, { useState } from 'react';
import firebase, { auth } from '../firebase';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        },
      });
    }
  };

  const handlePhoneSignIn = (e) => {
    e.preventDefault();
    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;

    auth.signInWithPhoneNumber(phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        console.log('SMS sent');
      })
      .catch((error) => {
        console.error('Phone sign-in error:', error);
      });
  };

  return (
    <div>
      <form onSubmit={handlePhoneSignIn}>
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
      {/* Add verification code input and handler as needed */}
    </div>
  );
};

export default Login; 