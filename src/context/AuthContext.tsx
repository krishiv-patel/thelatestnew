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
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';

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
  signup: (email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<any>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If user document doesn't exist, create one
          const newUser: User = {
            uid: uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: 'user',
            phone: firebaseUser.phoneNumber || '',
          };
          await setDoc(doc(db, 'users', uid), newUser);
          setUser(newUser);
        }
        const token = await firebaseUser.getIdToken();
        setToken(token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
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

  const signup = async (email: string, password: string, phoneNumber?: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      // Send email verification
      await sendEmailVerification(currentUser);

      const userEmail = currentUser.email?.toLowerCase();
      if (!userEmail) {
        throw new Error('No email associated with this account.');
      }

      const newUser: User = {
        uid: userCredential.user.uid,
        name: currentUser.displayName || '',
        email: userEmail,
        role: 'user',
        phone: phoneNumber || currentUser.phoneNumber || '',
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setUser(newUser);
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
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
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