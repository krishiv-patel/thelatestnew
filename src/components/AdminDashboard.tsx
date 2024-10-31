import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';

interface Order {
  id: string;
  user: string;
  total: number;
  paymentMethod: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.role === 'admin' && token) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (!response.ok) {
              throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
          } catch (error) {
            console.error('Error fetching orders:', error);
          }
        }
      }
    };

    fetchOrders();
  }, [user, token]);

  if (user?.role !== 'admin') {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Order ID</th>
            <th className="py-2 px-4 border-b">User</th>
            <th className="py-2 px-4 border-b">Total</th>
            <th className="py-2 px-4 border-b">Payment Method</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-2 px-4 border-b">{order.id}</td>
              <td className="py-2 px-4 border-b">{order.user}</td>
              <td className="py-2 px-4 border-b">${order.total.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{order.paymentMethod}</td>
              <td className="py-2 px-4 border-b">
                {/* Implement actions like view details, update status */}
                <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 