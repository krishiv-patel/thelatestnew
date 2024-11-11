import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firebase

export interface FirestoreOrder {
  id: string; // Firestore document ID
  userEmail: string;
  createdAt: Date; // Changed from Timestamp to Date after conversion
  totalAmount: number;
  shippingCost: number;
  tax: number;
  paymentMethod: 'cod' | 'online';
  status: 'placed' | 'processed' | 'shipped' | 'delivered';
  shippingAddress?: {
    fullName?: string;
    streetAddress?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    country?: string; // Include if applicable
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
}

export interface Order extends FirestoreOrder {} 