import React from 'react';
import { useLocation } from 'react-router-dom';
import CheckoutSteps from './CheckoutSteps';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

const steps = [
  { id: 'contact', name: 'Contact', icon: ShieldCheck },
  { id: 'delivery', name: 'Delivery', icon: Truck },
  { id: 'payment', name: 'Payment', icon: CreditCard },
];

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentStep = location.pathname.split('/').pop() || 'contact';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <CheckoutSteps steps={steps} currentStep={currentStep} />
          
          {/* Main Content */}
          <div className="mt-8 bg-white shadow-sm rounded-lg p-6">
            {children}
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center text-sm text-gray-500">
              <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
              Secure Checkout - Your data is protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}