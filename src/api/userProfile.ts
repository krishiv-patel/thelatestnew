import { db } from '../firebase';

/**
 * Fetches the user profile from Firestore.
 * @param uid - The user's UID.
 * @returns The user profile data.
 */
export async function fetchUserProfile(uid: string) {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new Error('User profile not found.');
  }
  return userDoc.data();
} 