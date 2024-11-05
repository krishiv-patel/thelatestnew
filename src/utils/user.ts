import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Fetches user data from Firestore using UID.
 * @param uid User's UID.
 * @returns User data or null if not found.
 */
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log('No such user!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}; 