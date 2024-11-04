import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { Product } from '../types/product';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { firestoreDB } from '../utils/firestore';

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

const SYNC_DEBOUNCE_MS = 2000;

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(false);
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const debouncedSync = (items: CartItem[]) => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    const timeout = setTimeout(async () => {
      if (user && isOnline) {
        try {
          await firestoreDB.setDocument('carts', user.uid, { items }, { merge: true });
          setSyncPending(false);
        } catch (error) {
          console.error('Error syncing cart:', error);
          setSyncPending(true);
        }
      }
    }, SYNC_DEBOUNCE_MS);

    setSyncTimeout(timeout);
  };

  useEffect(() => {
    const initializeCart = async () => {
      const savedCart = localStorage.getItem('cart');
      const localCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      if (user && isOnline) {
        try {
          const docSnapshot = await firestoreDB.getDocument('carts', user.uid);
          
          if (docSnapshot.exists()) {
            const firestoreCart = docSnapshot.data().items as CartItem[];
            const mergedCart = mergeLocalAndFirestoreCart(localCart, firestoreCart);
            setCartItems(mergedCart);
            localStorage.removeItem('cart');
          } else {
            await firestoreDB.setDocument('carts', user.uid, { items: localCart });
            setCartItems(localCart);
          }
        } catch (error) {
          console.error('Error initializing cart:', error);
          setCartItems(localCart);
          setSyncPending(true);
        }
      } else {
        setCartItems(localCart);
      }
    };

    initializeCart();

    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [user, isOnline]);

  const mergeLocalAndFirestoreCart = (localCart: CartItem[], firestoreCart: CartItem[]): CartItem[] => {
    const mergedCartMap = new Map<number, CartItem>();
    
    firestoreCart.forEach(item => mergedCartMap.set(item.id, { ...item }));
    localCart.forEach(item => {
      if (mergedCartMap.has(item.id)) {
        const existingItem = mergedCartMap.get(item.id)!;
        mergedCartMap.set(item.id, {
          ...existingItem,
          quantity: existingItem.quantity + item.quantity
        });
      } else {
        mergedCartMap.set(item.id, { ...item });
      }
    });

    return Array.from(mergedCartMap.values());
  };

  useEffect(() => {
    if (user && isOnline && !syncPending) {
      debouncedSync(cartItems);
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems, user, isOnline, syncPending]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      const updatedItems = existingItem
        ? prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevItems, { ...product, quantity: 1 }];

      showNotification({
        name: product.name,
        image: product.image,
        quantity: 1,
        type: 'success'
      });

      return updatedItems;
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
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-lg">
          <p className="text-yellow-700">
            You're currently offline. Changes will sync when you're back online.
          </p>
        </div>
      )}
    </CartContext.Provider>
  );
};