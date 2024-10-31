import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, getTotalItems } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryMethod: 'standard',
    paymentMethod: 'cod', // 'cod' or 'online'
  });

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: totalPrice * 100 }), // amount in paise
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID',
        amount: data.amount,
        currency: data.currency,
        name: 'Krishiv Organic Juices',
        description: 'Payment for your order',
        order_id: data.id,
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // Process order placement here
          navigate('/order-success');
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#38a169',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error during payment:', error);
      alert('Payment failed. Please try again later.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'online') {
      handlePayment();
    } else {
      // Handle Cash on Delivery
      alert('Order placed successfully with Cash on Delivery!');
      navigate('/order-success');
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
          Checkout
        </h2>
        <form onSubmit={handleSubmit} className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {/* Delivery Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>
              {/* Delivery Method */}
              <div>
                <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-700">
                  Delivery Method
                </label>
                <select
                  name="deliveryMethod"
                  id="deliveryMethod"
                  value={formData.deliveryMethod}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="standard">Standard Delivery</option>
                  <option value="express">Express Delivery</option>
                </select>
              </div>
              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <button onClick={() => decreaseQuantity(item.id)} className="px-2 py-1 bg-gray-200 rounded">
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item.id)} className="px-2 py-1 bg-gray-200 rounded">
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={cartItems.length === 0}
              className={`mt-6 w-full flex items-center justify-center rounded-md border border-transparent ${
                cartItems.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } px-6 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            >
              {formData.paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        {/* The earlier order summary is already included above */}
      </div>
    </div>
  );
} 