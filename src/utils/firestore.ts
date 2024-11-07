import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';

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
  discountApplied?: string;
  notes?: string;
}

interface Cart {
  email: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
  shippingAddress?: string;
  paymentMethod?: 'cod' | 'online';
  deliveryStatus?: 'pending' | 'shipped' | 'delivered';
}

interface Order {
  orderId: string;
  email: string;
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
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async createCart(email: string, cartData: Partial<Cart>) {
    await requestManager.throttle();
    try {
      const cartRef = doc(db, 'carts', email.toLowerCase());
      const totalAmount = cartData.items
        ? cartData.items.reduce((total, item) => total + item.price * item.quantity, 0)
        : 0;

      await setDoc(cartRef, {
        ...cartData,
        email: email.toLowerCase(),
        totalAmount,
        updatedAt: new Date(),
        shippingAddress: cartData.shippingAddress || '',
        paymentMethod: cartData.paymentMethod || 'cod',
        deliveryStatus: cartData.deliveryStatus || 'pending',
      });

      requestManager.resetRetryCount();
      return cartRef.id;
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.createCart(email, cartData);
      }
      console.error('Error creating cart:', error);
      throw error;
    }
  },

  // Update Cart
  async updateCart(email: string, cartData: Partial<Cart>) {
    await requestManager.throttle();
    try {
      const cartRef = doc(db, 'carts', email.toLowerCase());
      const totalAmount = cartData.items
        ? cartData.items.reduce((total, item) => total + item.price * item.quantity, 0)
        : 0;

      await updateDoc(cartRef, {
        ...cartData,
        totalAmount,
        updatedAt: new Date(),
        ...(cartData.shippingAddress && { shippingAddress: cartData.shippingAddress }),
        ...(cartData.paymentMethod && { paymentMethod: cartData.paymentMethod }),
        ...(cartData.deliveryStatus && { deliveryStatus: cartData.deliveryStatus }),
      });

      requestManager.resetRetryCount();
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.updateCart(email, cartData);
      }
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  // Get Cart by User Email
  async getCartByUserEmail(email: string): Promise<Cart | null> {
    try {
      const cartRef = doc(db, 'carts', email.toLowerCase());
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        return cartSnap.data() as Cart;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user cart:', error);
      throw error;
    }
  },

  // Create Order
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
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update Order Status
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
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Real-time listener for cart updates
  listenToCartUpdates(email: string, callback: (cart: Cart | null) => void) {
    const cartRef = doc(db, 'carts', email.toLowerCase());
    return onSnapshot(
      cartRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as Cart);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to cart updates:', error);
        callback(null);
      }
    );
  },
};

export default firestoreDB;
