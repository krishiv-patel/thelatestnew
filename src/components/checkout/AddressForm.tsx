import React from 'react';
import { MapPin } from 'lucide-react';

interface AddressFormProps {
  address: {
    fullName: string;
    streetAddress: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, errors, onChange }) => {
  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <MapPin className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold">Shipping Address</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="fullName"
            value={address.fullName}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone<span className="text-red-500">*</span></label>
          <input
            type="tel"
            name="phone"
            value={address.phone}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Street Address<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="streetAddress"
            value={address.streetAddress}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.streetAddress ? 'border-red-500' : ''}`}
          />
          {errors.streetAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.streetAddress}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Apartment, suite, etc. (optional)
          </label>
          <input
            type="text"
            name="apartment"
            value={address.apartment}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.city ? 'border-red-500' : ''}`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.state ? 'border-red-500' : ''}`}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ZIP Code<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="zipCode"
            value={address.zipCode}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.zipCode ? 'border-red-500' : ''}`}
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressForm;