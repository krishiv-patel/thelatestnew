import React, { createContext, useContext, useState, useEffect } from 'react';
import { SignupFormData } from '../schemas/auth';
import { auth, googleProvider, microsoftProvider, db } from '../firebase';
import { 
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthUser extends User {
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  signup: (data: SignupFormData & { captchaToken: string }) => Promise<{ user: any; twoFactorSecret?: string }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setToken(token);
          
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          setUser({
            ...user,
            role: userData?.role || 'user'
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthError = (error: AuthError) => {
    let errorMessage = 'An error occurred during authentication.';
    
    switch (error.code) {
      case 'auth/popup-blocked':
        errorMessage = 'Please enable popups for this website to sign in.';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign in was cancelled. Please try again.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with this email using a different sign-in method.';
        break;
      default:
        errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  };

  const createOrUpdateUserDocument = async (user: User, additionalData = {}) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        role: 'user',
        lastLogin: new Date(),
        ...additionalData
      }, { merge: true });
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  };

  const signup = async (data: SignupFormData & { captchaToken: string }) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUserDocument(result.user);
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      await createOrUpdateUserDocument(result.user);
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        token,
        signup, 
        signInWithGoogle, 
        signInWithMicrosoft,
        logout
      }}
    >
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