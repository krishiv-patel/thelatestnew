import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firestoreDB from '../utils/firestore';
import { useAuth } from './AuthContext';
import { CartItem } from '../types/product';
import { useNotification } from './NotificationContext';
import { Address } from '../types/address';

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  increaseQuantity: (id: string) => Promise<void>;
  decreaseQuantity: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  shippingAddress: Address;
  setShippingAddress: (address: Address) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  // Fetch cart from Firestore on mount and when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (user && user.email) {
        try {
          const cart = await firestoreDB.getCartByUserEmail(user.email);
          if (cart && cart.items) {
            setCartItems(cart.items);
            setShippingAddress(cart.shippingAddress || {
              fullName: '',
              streetAddress: '',
              apartment: '',
              city: '',
              state: '',
              zipCode: '',
              phone: '',
            });
          } else {
            setCartItems([]);
            setShippingAddress({
              fullName: '',
              streetAddress: '',
              apartment: '',
              city: '',
              state: '',
              zipCode: '',
              phone: '',
            });
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
          showNotification('Failed to load cart.', 'error');
        }
      } else {
        setCartItems([]);
        setShippingAddress({
          fullName: '',
          streetAddress: '',
          apartment: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
        });
      }
    };

    fetchCart();
  }, [user, showNotification]);

  // Sync cart with Firestore whenever cartItems or shippingAddress change
  useEffect(() => {
    const syncCart = async () => {
      if (user && user.email) {
        try {
          await firestoreDB.updateCart(user.email, {
            items: cartItems,
            shippingAddress: shippingAddress,
          });
        } catch (error) {
          console.error('Error syncing cart:', error);
          showNotification('Failed to sync cart.', 'error');
        }
      }
    };

    syncCart();
  }, [cartItems, shippingAddress, user, showNotification]);

  const addToCart = async (product: CartItem) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...product, quantity: 1 }]);
    }
    showNotification('Item added to cart.', 'success');
  };

  const removeFromCart = async (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    showNotification('Item removed from cart.', 'info');
  };

  const increaseQuantity = async (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = async (id: string) => {
    const item = cartItems.find(ci => ci.id === id);
    if (item) {
      if (item.quantity > 1) {
        setCartItems(prev =>
          prev.map(ci =>
            ci.id === id ? { ...ci, quantity: ci.quantity - 1 } : ci
          )
        );
      } else {
        removeFromCart(id);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    showNotification('Cart has been cleared.', 'success');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        shippingAddress,
        setShippingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};  