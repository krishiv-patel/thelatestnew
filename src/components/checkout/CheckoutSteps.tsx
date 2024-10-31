import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: string;
}

export default function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center">
        {steps.map((step, stepIdx) => {
          const isActive = step.id === currentStep;
          const isPast = steps.findIndex(s => s.id === currentStep) > stepIdx;

          return (
            <li
              key={step.name}
              className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}
            >
              {isPast ? (
                <Link
                  to={`/checkout/${step.id}`}
                  className="group flex items-center"
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-600 group-hover:bg-green-800">
                      <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </Link>
              ) : isActive ? (
                <div className="flex items-center" aria-current="step">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-green-600">
                      <step.icon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-green-600">
                      {step.name}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                      <step.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {step.name}
                    </span>
                  </span>
                </div>
              )}

              {stepIdx !== steps.length - 1 && (
                <div
                  className={`absolute top-0 right-0 hidden h-full w-5 md:block ${
                    isPast ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}