import { RecaptchaVerifier, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestoreDB } from './firestore';
import { db } from '../firebase';

/**
 * Sends a password reset email to the specified email address.
 * @param email User's email address.
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: 'https://localhost:5173/login', // Redirect URL after reset
    });
    console.log('Password reset email sent successfully.');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Handle errors here (e.g., show notification to user)
  }
};

/**
 * Registers a new user and creates a Firestore document with email as ID.
 * @param email User's email.
 * @param password User's password.
 */
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userEmail = userCredential.user.email;
    if (!userEmail) throw new Error('User email not available.');

    const userData = {
      email: userEmail.toLowerCase(),
      name: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || '',
      role: 'user',
      createdAt: new Date(),
      lastLogin: new Date(),
      preferences: {},
      settings: {},
      roles: ['user']
    };

    await firestoreDB.createUserProfile(userEmail, userData);
    console.log("User registered and Firestore document created.");
  } catch (error) {
    console.error("Error registering user:", error);
  }
}; 