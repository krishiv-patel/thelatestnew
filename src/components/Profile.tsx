import React from 'react';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

export default function Profile() {
  const { user } = useAuth();

  const resendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert('Verification email resent.');
      } catch (error: any) {
        console.error('Error resending verification email:', error);
        alert('Failed to resend verification email.');
      }
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {!auth.currentUser?.emailVerified && (
        <div>
          <p>Your email is not verified.</p>
          <button onClick={resendVerification}>Resend Verification Email</button>
        </div>
      )}
      {/* Rest of your profile component */}
    </div>
  );
} 