import React from 'react';
import { MapPin, Plus } from 'lucide-react';

const ShippingAddresses = () => {
  const addresses = [
    {
      id: 1,
      name: 'Home',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Work',
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      isDefault: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="p-4 border rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium">
                  {address.name}
                  {address.isDefault && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {address.street}, {address.city}, {address.state} {address.zip}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="text-sm text-gray-600 hover:text-gray-700">Edit</button>
              <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <button className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 w-full justify-center">
        <Plus className="w-4 h-4" />
        Add New Address
      </button>
    </div>
  );
};

export default ShippingAddresses;