import React from 'react';
import { Key, Shield } from 'lucide-react';

const Security = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Change Password</h4>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Update Password
            </button>
          </form>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-500 mb-4">
            Add an extra layer of security to your account
          </p>
          <button className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Enable 2FA
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Login History</h4>
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-medium">Last login: San Francisco, CA</p>
              <p className="text-gray-500">March 15, 2024 at 2:30 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;