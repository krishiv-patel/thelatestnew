import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

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

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: Record<string, any>;
  settings?: Record<string, any>;
  updatedAt: Date;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any>;
}

interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'online';
  status: 'placed' | 'processed' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

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

  async updateUserProfile(email: string, newData: Partial<UserProfile>) {
    await requestManager.throttle();
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await updateDoc(userRef, {
        ...newData,
        updatedAt: new Date(),
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

  // Cart Collection Methods

  async createCart(userId: string, cartData: Partial<Cart>) {
    await requestManager.throttle();
    try {
      const cartRef = doc(collection(db, 'carts'));
      await setDoc(cartRef, {
        ...cartData,
        userId,
        updatedAt: new Date(),
      });

      requestManager.resetRetryCount();
      return cartRef.id;
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.createCart(userId, cartData);
      }
      throw error;
    }
  },

  async updateCart(cartId: string, cartData: Partial<Cart>) {
    await requestManager.throttle();
    try {
      const cartRef = doc(db, 'carts', cartId);
      await updateDoc(cartRef, {
        ...cartData,
        updatedAt: new Date(),
      });

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.updateCart(cartId, cartData);
      }
      throw error;
    }
  },

  async getCartByUserId(userId: string): Promise<Cart | null> {
    try {
      const cartsCollection = collection(db, 'carts');
      const q = query(cartsCollection, where('userId', '==', userId), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const cartDoc = querySnapshot.docs[0];
        return cartDoc.data() as Cart;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user cart:', error);
      throw error;
    }
  },

  async createOrder(orderData: Partial<Order>) {
    await requestManager.throttle();
    try {
      const ordersRef = collection(db, 'orders');
      const orderDoc = doc(ordersRef);
      await setDoc(orderDoc, {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      requestManager.resetRetryCount();
      return orderDoc.id;
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.createOrder(orderData);
      }
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    await requestManager.throttle();
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date(),
      });

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.updateOrderStatus(orderId, status);
      }
      throw error;
    }
  }
};
