import React, { memo } from 'react';
import { ShoppingBag } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onUpdateQuantity?: (id: string, quantity: number) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items = [],
  subtotal = 0,
  shipping = 0,
  tax = 0,
  total = 0,
  onUpdateQuantity,
}) => {
  const handleQuantityChange = (id: string, quantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, quantity);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <ShoppingBag className="w-6 h-6 text-gray-600" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Order Summary</h2>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <Skeleton width={64} height={64} />
                )}
                <div>
                  <p className="font-medium">{item.name || <Skeleton width={100} />}</p>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor={`quantity-${item.id}`}
                      className="text-sm text-gray-500"
                    >
                      Qty:
                    </label>
                    <input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.id,
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label={`Quantity of ${item.name}`}
                    />
                  </div>
                </div>
              </div>
              <p className="font-medium">
                ${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : <Skeleton width={50} />}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(OrderSummary);