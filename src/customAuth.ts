import { signInWithCustomToken as firebaseSignInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase';
import { fetchUserProfile } from './api/userProfile';

export async function signInWithCustomToken(token: string) {
  try {
    const userCredential = await firebaseSignInWithCustomToken(auth, token);
    console.log('Custom token sign-in successful:', userCredential.user);
    await loadUserProfile(userCredential.user.uid);
  } catch (error) {
    console.error('Firebase: Error (auth/invalid-credential).', error);
    // Handle error appropriately
  }
}

async function loadUserProfile(uid: string) {
  try {
    const profile = await fetchUserProfile(uid);
    console.log('User Profile:', profile);
    // Update state or context with profile data
  } catch (error) {
    console.error('Error loading profile information:', error);
    // Display error message to the user
  }
} 
