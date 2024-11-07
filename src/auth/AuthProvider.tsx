import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  getIdTokenResult,
  linkWithPopup,
  unlink,
  sendEmailVerification,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface AuthUser extends User {
  role?: string;
  customClaims?: {
    admin?: boolean;
    premium?: boolean;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  linkAccount: (provider: 'google' | 'microsoft') => Promise<void>;
  unlinkAccount: (providerId: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Initialize providers
  const googleProvider = new GoogleAuthProvider();
  const microsoftProvider = new OAuthProvider('microsoft.com');

  // Configure provider settings
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  microsoftProvider.setCustomParameters({
    prompt: 'select_account',
    tenant: 'common'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user token and claims
          const tokenResult = await getIdTokenResult(user, true);
          setToken(tokenResult.token);
          
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          const authUser: AuthUser = {
            ...user,
            role: userData?.role || 'user',
            customClaims: tokenResult.claims
          };

          setUser(authUser);
          setIsAdmin(!!tokenResult.claims.admin);

          // Set up token refresh
          const tokenExpirationTime = new Date(tokenResult.expirationTime).getTime();
          const refreshTime = tokenExpirationTime - (5 * 60 * 1000); // 5 minutes before expiration
          
          const now = new Date().getTime();
          if (now < refreshTime) {
            setTimeout(async () => {
              const newToken = await user.getIdToken(true);
              setToken(newToken);
            }, refreshTime - now);
          }

        } catch (error) {
          console.error('Error setting up user session:', error);
          setUser(null);
          setToken(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setToken(null);
        setIsAdmin(false);
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
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'This sign-in method is not enabled. Please try another method.';
        break;
      default:
        errorMessage = error.message;
    }
    
    setError(errorMessage);
    throw new Error(errorMessage);
  };

  const createOrUpdateUserDocument = async (user: User, additionalData = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          providers: [user.providerData[0]?.providerId],
          ...additionalData
        });
      } else {
        // Update existing user document
        const userData = userDoc.data();
        const providers = new Set([
          ...(userData.providers || []),
          user.providerData[0]?.providerId
        ]);

        await updateDoc(userRef, {
          lastLogin: new Date(),
          providers: Array.from(providers),
          ...additionalData
        });
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUserDocument(result.user);
      navigate('/profile');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, microsoftProvider);
      await createOrUpdateUserDocument(result.user);
      navigate('/profile');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const linkAccount = async (provider: 'google' | 'microsoft') => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const authProvider = provider === 'google' ? googleProvider : microsoftProvider;
      await linkWithPopup(user, authProvider);
      await createOrUpdateUserDocument(user);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const unlinkAccount = async (providerId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await unlink(user, providerId);
      await createOrUpdateUserDocument(user);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await sendEmailVerification(user);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      navigate('/login');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        loading,
        error,
        token,
        isAdmin,
        signInWithGoogle,
        signInWithMicrosoft,
        logout,
        linkAccount,
        unlinkAccount,
        verifyEmail,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};