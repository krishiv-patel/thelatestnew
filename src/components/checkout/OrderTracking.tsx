import React from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

interface TrackingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'upcoming';
  date: string;
}

const steps: TrackingStep[] = [
  {
    title: 'Order Placed',
    description: 'Your order has been confirmed',
    icon: Package,
    status: 'completed',
    date: '2024-03-10 10:00 AM',
  },
  {
    title: 'Processing',
    description: 'Your order is being prepared',
    icon: Package,
    status: 'current',
    date: '2024-03-10 11:30 AM',
  },
  {
    title: 'Out for Delivery',
    description: 'Your order is on its way',
    icon: Truck,
    status: 'upcoming',
    date: 'Estimated: 2024-03-11',
  },
  {
    title: 'Delivered',
    description: 'Package has been delivered',
    icon: CheckCircle,
    status: 'upcoming',
    date: 'Estimated: 2024-03-11',
  },
];

export default function OrderTracking() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Order Tracking</h2>
      <div className="relative">
        {steps.map((step, stepIdx) => (
          <div key={step.title} className="relative pb-8">
            {stepIdx !== steps.length - 1 && (
              <div
                className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                }`}
                aria-hidden="true"
              />
            )}
            <div className="relative flex items-start group">
              <span
                className="flex h-9 items-center"
                aria-hidden="true"
              >
                <span
                  className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full ${
                    step.status === 'completed'
                      ? 'bg-green-600'
                      : step.status === 'current'
                      ? 'border-2 border-green-600 bg-white'
                      : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  <step.icon
                    className={`w-5 h-5 ${
                      step.status === 'completed'
                        ? 'text-white'
                        : step.status === 'current'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </span>
              <div className="ml-4 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {step.title}
                </div>
                <p className="text-sm text-gray-500">{step.description}</p>
                <p className="text-xs text-gray-400 mt-1">{step.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}