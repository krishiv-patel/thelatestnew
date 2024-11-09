import React, { useRef, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from '../common/Modal'; // Ensure Modal component is correctly imported

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getTotalItems,
    getTotalPrice,
  } = useCart();
  const navigate = useNavigate();
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  const drawerVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Ref for the drawer to manage focus
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      drawerRef.current?.focus();
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Confirmation state
  const [itemToRemove, setItemToRemove] = React.useState<string | null>(null);

  const handleRemove = (id: string) => {
    setItemToRemove(id);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };

  const cancelRemove = () => {
    setItemToRemove(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            aria-hidden="true"
          />

          {/* Cart Drawer */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cartDrawerTitle"
            ref={drawerRef}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="h-6 w-6 text-gray-600 mr-2" aria-hidden="true" />
                <h2 id="cartDrawerTitle" className="text-lg font-semibold">
                  Shopping Cart ({getTotalItems()})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      formatter={formatter}
                      onRemove={handleRemove}
                      onIncrease={() => increaseQuantity(item.id)}
                      onDecrease={() => decreaseQuantity(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">{formatter.format(getTotalPrice())}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md flex items-center justify-center"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}

            {/* Remove Confirmation Modal */}
            <Modal
              isOpen={itemToRemove !== null}
              onClose={cancelRemove}
              title="Remove Item"
              description="Are you sure you want to remove this item from your cart?"
              onConfirm={confirmRemove}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

interface CartItemProps {
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  };
  formatter: Intl.NumberFormat;
  onRemove: (id: string) => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

const CartItemComponent: React.FC<CartItemProps> = React.memo(
  ({ item, formatter, onRemove, onIncrease, onDecrease }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-lg"
          loading="lazy"
        />
        <div className="flex-1">
          <h4 className="text-md font-semibold">{item.name}</h4>
          <p className="text-sm text-gray-600">{formatter.format(item.price)} each</p>
          <div className="mt-2 flex items-center space-x-2">
            <button
              onClick={onDecrease}
              className="px-2 py-1 bg-gray-200 rounded"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={onIncrease}
              className="px-2 py-1 bg-gray-200 rounded"
              aria-label={`Increase quantity of ${item.name}`}
            >
              +
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-gray-900">{formatter.format(item.price * item.quantity)}</p>
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-800 mt-2"
            aria-label={`Remove ${item.name} from cart`}
          >
            🗑️
          </button>
        </div>
      </motion.div>
    );
  }
);

