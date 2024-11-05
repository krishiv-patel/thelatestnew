import React, { createContext, useContext } from 'react';
import { SignupFormData } from '../schemas/auth';

interface AuthContextType {
  signup: (data: SignupFormData & { captchaToken: string }) => Promise<{ user: any; twoFactorSecret?: string }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  // Add other authentication methods as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const signup = async (data: SignupFormData & { captchaToken: string }) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Signup failed');
    }

    const result = await response.json();
    return result; // Should include user and optionally twoFactorSecret
  };

  const signInWithGoogle = async () => {
    // Implement Google sign-in logic
  };

  const signInWithMicrosoft = async () => {
    // Implement Microsoft sign-in logic
  };

  return (
    <AuthContext.Provider value={{ signup, signInWithGoogle, signInWithMicrosoft }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};