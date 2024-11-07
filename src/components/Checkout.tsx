import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import firestoreDB from '../utils/firestore';

const Checkout: React.FC = () => {
  const { cartItems, totalAmount, clearCart, updateCart } = useCart();
  const { user, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchShippingAddress = async () => {
      if (user && user.email) {
        try {
          const cart = await firestoreDB.getCartByUserEmail(user.email);
          if (cart && cart.shippingAddress) {
            setShippingAddress(cart.shippingAddress);
          } else if (userProfile && userProfile.address) {
            setShippingAddress(userProfile.address);
          }
        } catch (error) {
          console.error('Error fetching shipping address:', error);
          showNotification('Failed to load shipping address.', 'error');
        }
      }
    };

    fetchShippingAddress();
  }, [user, userProfile, showNotification]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress(e.target.value);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value as 'cod' | 'online');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!shippingAddress) {
      showNotification('Please enter a shipping address.', 'error');
      return;
    }

    setLoading(true);

    try {
      if (user && user.email) {
        // Update Cart's shippingAddress
        await firestoreDB.updateCart(user.email, {
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
        });

        // Bi-Directional Synchronization: Update User Profile's address
        await firestoreDB.updateUserProfile(user.email, {
          address: shippingAddress,
        });

        // Optional: Create Order in Firestore
        // await firestoreDB.createOrder(user.email, { /* order details */ });

        showNotification('Checkout successful!', 'success');
        clearCart();
        navigate('/order-confirmation'); // Redirect to an order confirmation page
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showNotification('Checkout failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Processing your order...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>
        <form onSubmit={handleCheckout}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shippingAddress">Shipping Address<span className="text-red-500">*</span>:</label>
            <input
              type="text"
              id="shippingAddress"
              name="shippingAddress"
              value={shippingAddress}
              onChange={handleAddressChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your shipping address"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">Payment Method:</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          {/* Display Cart Items */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Your Cart</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <ul>
                {cartItems.map(item => (
                  <li key={item.productId} className="flex justify-between mb-2">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-6">
            <p className="text-lg font-bold">Total: ${totalAmount.toFixed(2)}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 