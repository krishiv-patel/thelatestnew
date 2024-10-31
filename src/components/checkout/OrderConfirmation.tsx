import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function OrderConfirmation() {
  const { cartItems } = useCart();
  const orderId = 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Thank you for your order. We'll send you shipping updates via email.
          </p>
          <p className="mt-2 text-sm font-medium text-gray-900">
            Order number: {orderId}
          </p>
        </div>

        <div className="mt-12 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
            
            <div className="mt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-500">Your order has been confirmed</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Processing</p>
                    <p className="text-sm text-gray-500">We're preparing your order</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Truck className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Shipping</p>
                    <p className="text-sm text-gray-500">Your order will be shipped soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            <dl className="mt-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <dt className="text-sm text-gray-600">
                    {item.name} × {item.quantity}
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-gray-900">
                  ₹{totalAmount.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-green-600 hover:text-green-500"
          >
            Continue Shopping
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}