import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  DocumentData,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { Order, FirestoreOrder } from '../types/order';
import { Address } from '../types/address';

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
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  updatedAt: Date;
  shippingAddress?: Address;
  paymentMethod?: 'cod' | 'online';
  deliveryStatus?: 'pending' | 'shipped' | 'delivered';
}

interface Order {
  id: string; // Firestore document ID
  userEmail: string;
  createdAt: Date;
  totalAmount: number;
  paymentMethod: 'cod' | 'online';
  status: 'placed' | 'processed' | 'shipped' | 'delivered';
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  shippingAddress?: Address;
}

interface FirestoreOrder extends Omit<Order, 'id' | 'createdAt'> {
  createdAt: firebase.firestore.Timestamp;
}

interface UserProfileData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  address: Address;
  email: string;
  emailVerified: boolean;
  photoURL?: string;
}

interface Address {
  fullName: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
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

  async getUserByEmail(email: string): Promise<UserProfileData | null> {
    await requestManager.throttle();
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const nameParts = data.name ? data.name.split(' ') : ['', ''];
        return {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          gender: data.gender || '',
          birthDate: data.birthDate || '',
          address: data.address || {
            fullName: '',
            streetAddress: '',
            apartment: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
          },
          email: data.email,
          emailVerified: data.emailVerified,
          photoURL: data.photoURL || '',
        };
      } else {
        return null;
      }
    } catch (error: any) {
      if (error.code === 'resource-exhausted') {
        await requestManager.exponentialBackoff();
        return this.getUserByEmail(email);
      }
      throw error;
    }
  },

  async updateUserProfile(email: string, updatedData: Partial<FirestoreUser>) {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found.');
      }

      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, updatedData);
    } catch (error) {
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
        shippingAddress: cartData.shippingAddress || {
          fullName: '',
          streetAddress: '',
          apartment: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
        },
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

      // Fetch the existing cart to preserve fields not being updated
      const cartSnap = await getDoc(cartRef);
      if (!cartSnap.exists()) {
        // If the cart doesn't exist, create it with the provided data
        return this.createCart(email, cartData);
      }

      const existingCart = cartSnap.data() as Cart;

      // Calculate updated pricing fields
      const subtotal = cartData.items
        ? cartData.items.reduce((total, item) => total + item.price * item.quantity, 0)
        : existingCart.subtotal;

      const shipping = 9.99; // Fixed shipping cost; adjust as needed
      const tax = parseFloat((subtotal * 0.10).toFixed(2)); // 10% tax
      const total = parseFloat((subtotal + shipping + tax).toFixed(2));

      await setDoc(
        cartRef,
        {
          ...cartData,
          subtotal,
          shipping,
          tax,
          total,
          updatedAt: new Date(),
          shippingAddress: cartData.shippingAddress || existingCart.shippingAddress,
          paymentMethod: cartData.paymentMethod || existingCart.paymentMethod,
          deliveryStatus: cartData.deliveryStatus || existingCart.deliveryStatus,
        },
        { merge: true }
      );

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
  async createOrder(orderData: Omit<Order, 'id'>) {
    await requestManager.throttle();
    try {
      const ordersRef = collection(db, 'orders');
      const orderDoc = doc(ordersRef);
      await setDoc(orderDoc, {
        ...orderData,
        createdAt: orderData.createdAt,
        updatedAt: new Date(),
        status: 'placed',
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

  // Get Orders by User Email
  async getOrdersByUserEmail(email: string): Promise<Order[]> {
    try {
      const ordersCollection = collection(db, 'orders');
      const q = query(ordersCollection, where('userEmail', '==', email));
      const querySnapshot = await getDocs(q);

      const orders: Order[] = [];
      querySnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        orders.push({
          id: docSnapshot.id,
          userEmail: data.userEmail,
          createdAt: data.createdAt.toDate(),
          totalAmount: data.totalAmount,
          shippingCost: data.shippingCost,
          tax: data.tax,
          paymentMethod: data.paymentMethod,
          status: data.status,
          shippingAddress: data.shippingAddress
            ? {
                fullName: data.shippingAddress.fullName,
                streetAddress: data.shippingAddress.streetAddress,
                apartment: data.shippingAddress.apartment,
                city: data.shippingAddress.city,
                state: data.shippingAddress.state,
                zipCode: data.shippingAddress.zipCode,
                phone: data.shippingAddress.phone,
              }
            : undefined,
          items: data.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        });
      });

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
};

export default firestoreDB;
