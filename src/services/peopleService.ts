import { httpsCallable } from 'firebase/functions';
import functions from '../firebase'; // Now correctly initialized as Functions

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