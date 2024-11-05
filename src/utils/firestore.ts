import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Rate limiting configuration with exponential backoff
const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  initialRetryDelay: 1000,
  maxRetryDelay: 32000,
  maxRetries: 5
};

class RequestManager {
  private requests: number = 0;
  private lastReset: number = Date.now();
  private retryCount: number = 0;

  private async exponentialBackoff(): Promise<void> {
    if (this.retryCount >= RATE_LIMIT.maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    const delay = Math.min(
      RATE_LIMIT.initialRetryDelay * Math.pow(2, this.retryCount),
      RATE_LIMIT.maxRetryDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));
    this.retryCount++;
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    if (now - this.lastReset > RATE_LIMIT.windowMs) {
      this.requests = 0;
      this.lastReset = now;
      this.retryCount = 0;
    }

    if (this.requests >= RATE_LIMIT.maxRequests) {
      await this.exponentialBackoff();
      return this.throttle();
    }

    this.requests++;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }
}

const requestManager = new RequestManager();

export const firestoreDB = {
  async createUserProfile(uid: string, email: string, userData: any) {
    await requestManager.throttle();
    try {
      // Create user profile with UID
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userData,
        email: email.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create email lookup document
      const emailLookupRef = doc(db, 'emailLookup', email.toLowerCase());
      await setDoc(emailLookupRef, {
        uid,
        email: email.toLowerCase()
      });

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.createUserProfile(uid, email, userData);
      }
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    await requestManager.throttle();
    try {
      // Look up UID from email
      const emailLookupRef = doc(db, 'emailLookup', email.toLowerCase());
      const emailLookupDoc = await getDoc(emailLookupRef);

      if (!emailLookupDoc.exists()) {
        return null;
      }

      // Get user profile using UID
      const uid = emailLookupDoc.data().uid;
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      requestManager.resetRetryCount();
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.getUserByEmail(email);
      }
      throw error;
    }
  },

  async updateUserProfile(uid: string, newData: any) {
    await requestManager.throttle();
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...newData,
        updatedAt: new Date()
      });

      // If email is being updated, update the lookup document
      if (newData.email) {
        const oldEmailLookupRef = doc(db, 'emailLookup', newData.oldEmail.toLowerCase());
        await setDoc(oldEmailLookupRef, { 
          uid,
          email: newData.email.toLowerCase()
        });
      }

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.updateUserProfile(uid, newData);
      }
      throw error;
    }
  },

  async createUserCard(uid: string, cardData: any) {
    await requestManager.throttle();
    try {
      // Store card under user's UID with a unique card ID
      const cardsRef = collection(db, 'users', uid, 'cards');
      const cardDoc = doc(cardsRef);
      await setDoc(cardDoc, {
        ...cardData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      requestManager.resetRetryCount();
      return cardDoc.id;
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.createUserCard(uid, cardData);
      }
      throw error;
    }
  },

  async getUserCards(uid: string) {
    await requestManager.throttle();
    try {
      const cardsRef = collection(db, 'users', uid, 'cards');
      const querySnapshot = await getDocs(cardsRef);
      
      requestManager.resetRetryCount();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.getUserCards(uid);
      }
      throw error;
    }
  }
};