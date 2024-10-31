import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../firebase'; // FirebaseApp instance

const functions = getFunctions(app);

export const fetchUserContacts = async () => {
  const getContacts = httpsCallable(functions, 'getContacts');
  try {
    const result = await getContacts();
    return result.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}; 