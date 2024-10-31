import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { Product } from '../types/product';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartDocRef = user ? doc(db, 'carts', user.uid) : null;

  // Fetch cart from Firestore on user login
  useEffect(() => {
    if (user && cartDocRef) {
      const unsubscribe = onSnapshot(cartDocRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const firestoreCart = docSnapshot.data().items as CartItem[];
          const savedCart = localStorage.getItem('cart');
          const localCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

          // Merge logic: Combine quantities for duplicate items
          const mergedCartMap = new Map<number, CartItem>();

          firestoreCart.forEach(item => mergedCartMap.set(item.id, { ...item }));
          localCart.forEach(item => {
            if (mergedCartMap.has(item.id)) {
              const existingItem = mergedCartMap.get(item.id)!;
              mergedCartMap.set(item.id, { ...existingItem, quantity: existingItem.quantity + item.quantity });
            } else {
              mergedCartMap.set(item.id, { ...item });
            }
          });

          const mergedCart = Array.from(mergedCartMap.values());
          setCartItems(mergedCart);
          // Update Firestore with merged cart
          try {
            await updateDoc(cartDocRef, { items: mergedCart });
          } catch (error) {
            console.error('Error updating merged cart:', error);
          }
          // Clear localStorage after merging
          localStorage.removeItem('cart');
        } else {
          // Initialize cart document if it doesn't exist
          try {
            await setDoc(cartDocRef, { items: [] });
          } catch (error) {
            console.error('Error initializing cart document:', error);
          }
        }
      });

      return () => unsubscribe();
    } else {
      // If no user is logged in, load cart from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    }
  }, [user, cartDocRef]);

  // Update Firestore whenever cartItems change
  useEffect(() => {
    if (user && cartDocRef) {
      updateDoc(cartDocRef, { items: cartItems }).catch((error) => {
        console.error('Error updating cart:', error);
      });
    } else {
      // Sync with localStorage when no user is logged in
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user, cartDocRef]);

  // Load cart from Firestore or localStorage on initial load
  useEffect(() => {
    if (user && cartDocRef) {
      // Cart is already being handled by the onSnapshot listener
      return;
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [user, cartDocRef]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) { 
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1 }];
    });

    showNotification({
      name: product.name,
      image: product.image,
      quantity: 1,
      type: 'success'
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  const increaseQuantity = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return updatedItems.filter(item => item.quantity > 0);
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      getTotalItems,
      getTotalPrice,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}; 