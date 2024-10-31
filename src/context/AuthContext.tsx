import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const createOrUpdateUserProfile = async (firebaseUser: any) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user profile
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'user',
          phone: firebaseUser.phoneNumber || '',
          address: '',
          createdAt: new Date().toISOString(),
        };
        
        await setDoc(userRef, userData);
        return userData;
      } else {
        // Update existing user profile
        const existingData = userDoc.data();
        const updatedData = {
          ...existingData,
          name: firebaseUser.displayName || existingData.name,
          email: firebaseUser.email || existingData.email,
          phone: firebaseUser.phoneNumber || existingData.phone,
          lastLoginAt: new Date().toISOString(),
        };
        
        await setDoc(userRef, updatedData, { merge: true });
        return updatedData;
      }
    } catch (error) {
      console.error('Error managing user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          const userData = await createOrUpdateUserProfile(firebaseUser);
          setUser(userData as User);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthError('Authentication error occurred');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserProfile(userCredential.user);
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthError(error.message || 'Failed to signup');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuthError(error.message || 'Failed to logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUserProfile(result.user);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setAuthError(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    setLoading(true);
    setAuthError(null);
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    } catch (error: any) {
      console.error('Phone sign-in error:', error);
      setAuthError(error.message || 'Failed to sign in with phone number');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      login,
      signup,
      logout,
      signInWithGoogle,
      signInWithPhone,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};