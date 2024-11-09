import React from 'react';
import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-md shadow-md text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. Your order is being processed and will be delivered soon.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
} 