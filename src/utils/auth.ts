import { RecaptchaVerifier, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { signInWithPhoneNumber, PhoneAuthProvider, ConfirmationResult } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

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
 * Sends an SMS verification code to the specified phone number.
 * @param phoneNumber User's phone number in E.164 format.
 * @returns ConfirmationResult for verifying the code.
 */
export const sendSMSVerification = async (phoneNumber: string): Promise<ConfirmationResult> => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        console.log('reCAPTCHA resolved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    }, auth);
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    console.log('SMS verification code sent.');
    return confirmationResult;
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    throw error;
  }
};

/**
 * Verifies the SMS code entered by the user.
 * @param confirmationResult The ConfirmationResult returned from sendSMSVerification.
 * @param code The SMS code entered by the user.
 */
export const verifySMSCode = async (confirmationResult: ConfirmationResult, code: string) => {
  try {
    const userCredential = await confirmationResult.confirm(code);
    console.log('User signed in successfully:', userCredential.user);
    // Handle successful sign-in (e.g., redirect to dashboard)
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    // Handle errors here (e.g., show notification to user)
  }
};

/**
 * Registers a new user and creates a Firestore document if it doesn't exist.
 * @param email User's email.
 * @param password User's password.
 */
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userRef = doc(db, "users", uid);
    
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { email, createdAt: new Date() });
      console.log("User registered and Firestore document created.");
    } else {
      console.log("User document already exists.");
    }
  } catch (error) {
    console.error("Error registering user:", error);
  }
}; 