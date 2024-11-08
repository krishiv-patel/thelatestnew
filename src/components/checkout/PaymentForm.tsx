import React from 'react';
import { CreditCard, DollarSign } from 'lucide-react';

interface PaymentFormProps {
  paymentMethod: 'cod' | 'online';
  setPaymentMethod: (method: 'cod' | 'online') => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold">Payment Method</h2>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="radio"
          id="cod"
          name="paymentMethod"
          value="cod"
          checked={paymentMethod === 'cod'}
          onChange={() => setPaymentMethod('cod')}
          className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
        />
        <label htmlFor="cod" className="block text-sm font-medium text-gray-700">
          Cash on Delivery (COD)
        </label>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="radio"
          id="online"
          name="paymentMethod"
          value="online"
          checked={paymentMethod === 'online'}
          onChange={() => setPaymentMethod('online')}
          className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
        />
        <label htmlFor="online" className="block text-sm font-medium text-gray-700">
          Online Payment
        </label>
      </div>
    </div>
  );
};

export default PaymentForm;