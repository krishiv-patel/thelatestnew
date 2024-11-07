import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { Product } from '../types/product';
import firestoreDB, { CartItem as FirestoreCartItem } from '../utils/firestore';
import { useAuth } from './AuthContext';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalAmount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Helper functions
const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const mergeLocalAndFirestoreCart = (localCart: CartItem[], firestoreCartItems: CartItem[]): CartItem[] => {
  const mergedCartMap: { [key: string]: CartItem } = {};

  localCart.forEach(item => {
    mergedCartMap[item.productId] = { ...item };
  });

  firestoreCartItems.forEach(item => {
    if (mergedCartMap[item.productId]) {
      mergedCartMap[item.productId].quantity += item.quantity;
    } else {
      mergedCartMap[item.productId] = { ...item };
    }
  });

  return Object.values(mergedCartMap);
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const { showNotification } = useNotification();
  const { user, userProfile } = useAuth();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncPending, setSyncPending] = useState<boolean>(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync local cart with Firestore when back online
      syncLocalCartWithFirestore();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('You are offline. Changes will sync when you are back online.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  const syncLocalCartWithFirestore = async () => {
    if (user && user.email) {
      const savedCart = localStorage.getItem('cart');
      const localCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      try {
        const firestoreCart = await firestoreDB.getCartByUserEmail(user.email);

        if (firestoreCart) {
          const mergedCart = mergeLocalAndFirestoreCart(localCart, firestoreCart.items);
          const newTotal = calculateTotalAmount(mergedCart);
          await firestoreDB.updateCart(user.email, { items: mergedCart, totalAmount: newTotal });
          setCartItems(mergedCart);
          setTotalAmount(newTotal);
          localStorage.removeItem('cart');
        } else {
          const total = calculateTotalAmount(localCart);
          await firestoreDB.createCart(user.email, { items: localCart, totalAmount: total });
          setCartItems(localCart);
          setTotalAmount(total);
          localStorage.removeItem('cart');
        }

        showNotification('Cart synchronized successfully.', 'success');
      } catch (error) {
        console.error('Error syncing cart:', error);
        setSyncPending(true);
        showNotification('Unable to sync cart changes. They will be retried automatically.', 'error');
      }
    }
  };

  const addToCart = async (product: Product) => {
    if (!user || !user.email) {
      showNotification('Please log in to add items to your cart.', 'error');
      return;
    }

    const existingItem = cartItems.find(item => item.productId === product.id);

    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedCart);
    const newTotal = calculateTotalAmount(updatedCart);
    setTotalAmount(newTotal);

    if (isOnline) {
      try {
        await firestoreDB.updateCart(user.email, { items: updatedCart, totalAmount: newTotal });
        showNotification('Item added to cart.', 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        setSyncPending(true);
        showNotification('Unable to sync cart changes. They will be retried automatically.', 'error');
      }
    } else {
      // Save to localStorage for offline
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      showNotification('Item added to cart (offline).', 'warning');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user || !user.email) {
      showNotification('Please log in to modify your cart.', 'error');
      return;
    }

    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    const newTotal = calculateTotalAmount(updatedCart);
    setTotalAmount(newTotal);

    if (isOnline) {
      try {
        await firestoreDB.updateCart(user.email, { items: updatedCart, totalAmount: newTotal });
        showNotification('Item removed from cart.', 'success');
      } catch (error) {
        console.error('Error removing from cart:', error);
        setSyncPending(true);
        showNotification('Unable to sync cart changes. They will be retried automatically.', 'error');
      }
    } else {
      // Save to localStorage for offline
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      showNotification('Item removed from cart (offline).', 'warning');
    }
  };

  const increaseQuantity = async (productId: string) => {
    if (!user || !user.email) {
      showNotification('Please log in to modify your cart.', 'error');
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCartItems(updatedCart);
    const newTotal = calculateTotalAmount(updatedCart);
    setTotalAmount(newTotal);

    if (isOnline) {
      try {
        await firestoreDB.updateCart(user.email, { items: updatedCart, totalAmount: newTotal });
        showNotification('Item quantity increased.', 'success');
      } catch (error) {
        console.error('Error increasing quantity:', error);
        setSyncPending(true);
        showNotification('Unable to sync cart changes. They will be retried automatically.', 'error');
      }
    } else {
      // Save to localStorage for offline
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      showNotification('Item quantity increased (offline).', 'warning');
    }
  };

  const decreaseQuantity = async (productId: string) => {
    if (!user || !user.email) {
      showNotification('Please log in to modify your cart.', 'error');
      return;
    }

    const existingItem = cartItems.find(item => item.productId === productId);
    if (!existingItem) return;

    let updatedCart: CartItem[];

    if (existingItem.quantity > 1) {
      updatedCart = cartItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    } else {
      updatedCart = cartItems.filter(item => item.productId !== productId);
    }

    setCartItems(updatedCart);
    const newTotal = calculateTotalAmount(updatedCart);
    setTotalAmount(newTotal);

    if (isOnline) {
      try {
        await firestoreDB.updateCart(user.email, { items: updatedCart, totalAmount: newTotal });
        showNotification('Item quantity decreased.', 'success');
      } catch (error) {
        console.error('Error decreasing quantity:', error);
        setSyncPending(true);
        showNotification('Unable to sync cart changes. They will be retried automatically.', 'error');
      }
    } else {
      // Save to localStorage for offline
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      showNotification('Item quantity decreased (offline).', 'warning');
    }
  };

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return totalAmount;
  };

  const clearCart = async () => {
    if (!user || !user.email) {
      showNotification('Please log in to clear your cart.', 'error');
      return;
    }

    setCartItems([]);
    setTotalAmount(0);

    if (isOnline) {
      try {
        await firestoreDB.updateCart(user.email, { items: [], totalAmount: 0 });
        showNotification('Cart has been cleared.', 'success');
      } catch (error) {
        console.error('Error clearing cart:', error);
        setSyncPending(true);
        showNotification('Unable to sync cart changes. They will be retried automatically.', 'error');
      }
    } else {
      // Clear localStorage for offline
      localStorage.removeItem('cart');
      showNotification('Cart has been cleared (offline).', 'warning');
    }
  };

  // Initialize cart with real-time listener
  useEffect(() => {
    const initializeCart = async () => {
      if (user && user.email) {
        try {
          // Set up real-time listener
          const unsubscribeFn = firestoreDB.listenToCartUpdates(user.email, (cart) => {
            if (cart) {
              setCartItems(cart.items);
              setTotalAmount(cart.totalAmount);
              localStorage.removeItem('cart');
            } else {
              setCartItems([]);
              setTotalAmount(0);
            }
          });

          setUnsubscribe(() => unsubscribeFn);

          // Fetch local cart
          const savedCart = localStorage.getItem('cart');
          const localCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

          const firestoreCart = await firestoreDB.getCartByUserEmail(user.email);

          if (firestoreCart) {
            const mergedCart = mergeLocalAndFirestoreCart(localCart, firestoreCart.items);
            const newTotal = calculateTotalAmount(mergedCart);
            await firestoreDB.updateCart(user.email, { items: mergedCart, totalAmount: newTotal });
            setCartItems(mergedCart);
            setTotalAmount(newTotal);
            localStorage.removeItem('cart');
          } else {
            const total = calculateTotalAmount(localCart);
            await firestoreDB.createCart(user.email, { items: localCart, totalAmount: total });
            setCartItems(localCart);
            setTotalAmount(total);
          }
        } catch (error) {
          console.error('Error initializing cart:', error);
          setCartItems([]);
          setTotalAmount(0);
        }
      }
    };

    initializeCart();
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [unsubscribe]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
      }}
    >
      {children}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-lg">
          <p className="text-yellow-700">
            You're currently offline. Changes will sync when you're back online.
          </p>
        </div>
      )}
      {syncPending && (
        <div className="fixed bottom-4 left-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-lg">
          <p className="text-red-700">
            Unable to sync cart changes. They will be retried automatically.
          </p>
        </div>
      )}
    </CartContext.Provider>
  );
};

export default CartProvider;  