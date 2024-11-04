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
  async getDocument(collection: string, id: string) {
    await requestManager.throttle();
    try {
      const docRef = doc(db, collection, id);
      const result = await getDoc(docRef);
      requestManager.resetRetryCount();
      return result;
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.getDocument(collection, id);
      }
      throw error;
    }
  },

  async setDocument(collection: string, id: string, data: any, options?: any) {
    await requestManager.throttle();
    try {
      const docRef = doc(db, collection, id);
      await setDoc(docRef, data, options);
      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.setDocument(collection, id, data, options);
      }
      throw error;
    }
  },

  async updateDocument(collection: string, id: string, data: any) {
    await requestManager.throttle();
    try {
      const docRef = doc(db, collection, id);
      await updateDoc(docRef, data);
      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.updateDocument(collection, id, data);
      }
      throw error;
    }
  },

  async queryDocuments(collectionName: string, conditions: Array<{ field: string; operator: string; value: any }>) {
    await requestManager.throttle();
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = conditions.map(({ field, operator, value }) => 
        where(field, operator as any, value)
      );
      
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      requestManager.resetRetryCount();
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.queryDocuments(collectionName, conditions);
      }
      throw error;
    }
  }
};