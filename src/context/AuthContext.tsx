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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../utils/firestore';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, OAuthProvider, linkWithPopup, unlink, sendEmailVerification } from 'firebase/auth';

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
  const googleProviderInit = new GoogleAuthProvider();
  const microsoftProviderInit = new OAuthProvider('microsoft.com');

  // Configure provider settings
  googleProviderInit.setCustomParameters({
    prompt: 'select_account'
  });
  microsoftProviderInit.setCustomParameters({
    prompt: 'select_account',
    tenant: 'common'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userEmail = currentUser.email;
          if (!userEmail) throw new Error('User email not available.');

          // Get user token and claims
          const tokenResult = await currentUser.getIdTokenResult(true);
          setToken(tokenResult.token);
          
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', userEmail.toLowerCase()));
          const userData = userDoc.data();
          
          const authUser: AuthUser = {
            ...currentUser,
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
              const newToken = await currentUser.getIdToken(true);
              setToken(newToken);
            }, refreshTime - now);
          }

          // Update lastLogin
          await updateDoc(doc(db, 'users', userEmail.toLowerCase()), {
            lastLogin: new Date(),
            // Add any advanced parameters if needed
          });

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

  const createOrUpdateUserDocument = async (currentUser: User, additionalData = {}) => {
    try {
      const userEmail = currentUser.email;
      if (!userEmail) throw new Error('User email not available.');

      const userRef = doc(db, 'users', userEmail.toLowerCase());
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document with advanced parameters
        await setDoc(userRef, {
          email: userEmail.toLowerCase(),
          name: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          providers: [currentUser.providerData[0]?.providerId],
          preferences: {
            theme: "light",
            notifications: true
          },
          settings: {
            language: "en",
            privacy: "medium"
          },
          roles: ['user'],
          twoFactorAuth: {
            enabled: false,
            secret: ""
          },
          ...additionalData
        });
      } else {
        // Update existing user document with advanced parameters
        const userData = userDoc.data();
        const providers = new Set([
          ...(userData.providers || []),
          currentUser.providerData[0]?.providerId
        ]);

        await updateDoc(userRef, {
          lastLogin: new Date(),
          providers: Array.from(providers),
          ...(additionalData.preferences && { preferences: additionalData.preferences }),
          ...(additionalData.settings && { settings: additionalData.settings }),
          ...(additionalData.roles && { roles: additionalData.roles }),
          ...(additionalData.twoFactorAuth && { twoFactorAuth: additionalData.twoFactorAuth })
        });
      }
    } catch (error) {
      console.error('Error creating or updating user document:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProviderInit);
      await createOrUpdateUserDocument(result.user);
      navigate('/dashboard');
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
      const result = await signInWithPopup(auth, microsoftProviderInit);
      await createOrUpdateUserDocument(result.user);
      navigate('/dashboard');
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
      const authProvider = provider === 'google' ? googleProviderInit : microsoftProviderInit;
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
      console.log('Verification email sent.');
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

  const AuthProvider: React.FC = ({ children }) => {
    const navigate = useNavigate();
    // ... other state and functions
  
    const signInWithGoogle = async () => {
      try {
        // ... sign-in logic
        navigate('/profile'); // Ensure redirect to /profile
      } catch (error) {
        // ... error handling
      }
    };
  
    const signInWithMicrosoft = async () => {
      try {
        // ... sign-in logic
        navigate('/profile'); // Ensure redirect to /profile
      } catch (error) {
        // ... error handling
      }
    };
  
    // ... rest of the provider
  }; 
};