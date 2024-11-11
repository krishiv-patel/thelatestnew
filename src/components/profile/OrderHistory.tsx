import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import firestoreDB from '../../utils/firestore';
import { Order } from '../../types/order';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      try {
        // Fetch orders from Firestore where 'userEmail' matches the current user's email
        const fetchedOrders = await firestoreDB.getOrdersByUserEmail(user.email);

        // Log fetched orders for debugging
        console.log('Fetched Orders:', fetchedOrders);

        // No need to map since getOrdersByUserEmail already returns Order[]
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" aria-label="Delivered" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" aria-label="Shipped" />;
      case 'processed':
        return <Package className="w-5 h-5 text-yellow-500" aria-label="Processed" />;
      case 'placed':
        return <Package className="w-5 h-5 text-gray-500" aria-label="Placed" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" aria-label="Unknown Status" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const toggleDetails = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-xl">You have no placed orders yet.</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 max-w-4xl mx-auto"
    >
      <div className="border rounded-lg divide-y">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="p-6 transition-colors duration-200 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold">Order ID: {order.id}</h4>
                <p className="text-sm text-gray-500">
                  {order.createdAt.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100"
                aria-label={`Order status: ${order.status}`}
              >
                {getStatusIcon(order.status)}
                <span className="text-sm font-medium capitalize">
                  {order.status.replace('_', ' ')}
                </span>
              </motion.div>
            </div>
            <motion.div className="space-y-3">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={`Image of ${item.name}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                  </div>
                  <span>
                    $
                    {item.price !== undefined
                      ? (item.price * item.quantity).toFixed(2)
                      : '0.00' /* Fallback value */}
                  </span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t flex justify-between"
              >
                <span>Shipping Cost</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </motion.div>
              <motion.div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t flex justify-between font-semibold text-lg"
              >
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </motion.div>
              <motion.div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => toggleDetails(order.id)}
                  className="text-sm text-blue-500 hover:underline focus:outline-none"
                >
                  {expandedOrderIds.has(order.id) ? 'Hide Details' : 'More Details'}
                </button>
              </motion.div>
              {expandedOrderIds.has(order.id) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-gray-100 rounded-lg"
                >
                  <h5 className="text-md font-semibold mb-2">Shipping Address</h5>
                  {order.shippingAddress ? (
                    <>
                      <p>Name: {order.shippingAddress.fullName}</p>
                      <p>Street: {order.shippingAddress.streetAddress}</p>
                      {order.shippingAddress.apartment && (
                        <p>Apartment: {order.shippingAddress.apartment}</p>
                      )}
                      <p>City: {order.shippingAddress.city}</p>
                      <p>State: {order.shippingAddress.state}</p>
                      <p>Zip Code: {order.shippingAddress.zipCode}</p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                      {order.shippingAddress.country && (
                        <p>Country: {order.shippingAddress.country}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No shipping address provided.</p>
                  )}
                  {/* Add more details as needed */}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrderHistory;