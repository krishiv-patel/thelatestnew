import React from 'react';
import { Leaf, Clock, Timer, Palette, Heart, Shield, Zap, Award } from 'lucide-react';

const features = [
  {
    name: '100% Organic',
    description: 'All our fruits and vegetables are fresh, organic, and locally sourced. We don\'t use genetically modified produce. Good for your health, and the environment, and it tastes better too!',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Year-Round Service',
    description: 'We know you need a healthy boost of juices, so we don\'t take holidays. Our staff is always at your service with fresh juices.',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Custom Orders',
    description: 'We don\'t limit your creativity. Besides the listed items, you can also mix and match items from our menu. Isn\'t that cool and creative?',
    icon: Palette,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    name: 'Health Benefits',
    description: 'Our juices are packed with essential vitamins, minerals, and antioxidants to boost your immune system and overall health.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    name: 'Quality Assured',
    description: 'We follow strict quality control measures to ensure every juice meets our high standards of excellence.',
    icon: Shield,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    name: 'Energy Boost',
    description: 'Natural energy boost without caffeine or artificial stimulants. Perfect for your active lifestyle.',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 bg-white sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Discover Our Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome to Krishiv
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            An organic juice bar offering 100% pure and fresh juices to our customers. We understand how challenging 
            it has become to find unadulterated juices these days. Let us handle that for you; we're good at it, we promise.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative group">
                <div className={`absolute -inset-1 rounded-lg bg-gradient-to-r from-green-600 to-${feature.color.split('-')[1]}-600 opacity-0 group-hover:opacity-25 transition-opacity blur`} />
                <div className="relative p-6 bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 hover:shadow-lg transition-shadow">
                  <div className={`rounded-lg ${feature.bgColor} p-2 w-10 h-10 flex items-center justify-center`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <dt className="mt-4 font-semibold text-gray-900">{feature.name}</dt>
                  <dd className="mt-2 text-sm leading-7 text-gray-600">{feature.description}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

