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
  async createUserProfile(email: string, userData: any) {
    await requestManager.throttle();
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await setDoc(userRef, {
        ...userData,
        email: email.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: userData.preferences || {
          theme: "light",
          notifications: true
        },
        settings: userData.settings || {
          language: "en",
          privacy: "medium"
        },
        roles: userData.roles || ['user'],
        twoFactorAuth: {
          enabled: false,
          secret: ""
        },
        lastLogin: userData.lastLogin || new Date()
      });

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.createUserProfile(email, userData);
      }
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    await requestManager.throttle();
    try {
      // Fetch user profile using email
      const userRef = doc(db, 'users', email.toLowerCase());
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      requestManager.resetRetryCount();
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.getUserByEmail(email);
      }
      throw error;
    }
  },

  async updateUserProfile(email: string, newData: any) {
    await requestManager.throttle();
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await updateDoc(userRef, {
        ...newData,
        updatedAt: new Date(),
        // Update advanced parameters as needed
        ...newData.preferences && { preferences: newData.preferences },
        ...newData.settings && { settings: newData.settings }
      });

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.updateUserProfile(email, newData);
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