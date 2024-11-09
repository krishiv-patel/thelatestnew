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
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
}

export interface Order extends FirestoreOrder {} 