import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Zap, Clock } from 'lucide-react';

const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery within 2-3 business days',
    price: 49,
    icon: Truck,
    estimatedDays: '2-3',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Next day delivery for orders placed before 2 PM',
    price: 99,
    icon: Zap,
    estimatedDays: '1',
  },
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    description: 'Available for select locations within city limits',
    price: 149,
    icon: Clock,
    estimatedDays: '0',
  },
];

export default function DeliveryMethod() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = React.useState(deliveryOptions[0].id);

  const handleContinue = () => {
    // Save delivery method to context/storage
    navigate('/checkout/payment');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Delivery Method</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the most convenient delivery option for you
        </p>
      </div>

      <div className="space-y-4">
        {deliveryOptions.map((option) => (
          <div
            key={option.id}
            className={`relative rounded-lg border ${
              selectedMethod === option.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            } p-4 cursor-pointer hover:border-green-400 transition-colors`}
            onClick={() => setSelectedMethod(option.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <option.icon
                  className={`h-6 w-6 ${
                    selectedMethod === option.id ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{option.name}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    ₹{option.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div
                className={`h-5 w-5 rounded-full border ${
                  selectedMethod === option.id
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                } flex items-center justify-center`}
              >
                {selectedMethod === option.id && (
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/checkout/contact')}
          className="text-sm font-medium text-green-600 hover:text-green-500"
        >
          Back to Contact Info
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center justify-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}