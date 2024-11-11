import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import firestoreDB from '../../utils/firestore';

const Preferences: React.FC = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const { showNotification } = useNotification();

  const handleToggle = async (preference: keyof UserProfileData['preferences'], currentValue: boolean) => {
    if (user && user.email) {
      try {
        const updatedPreferences = {
          ...userProfile.preferences,
          [preference]: !currentValue,
        };

        await firestoreDB.updateUserProfile(user.email, {
          preferences: updatedPreferences,
        });

        setUserProfile({
          ...userProfile,
          preferences: updatedPreferences,
        });

        showNotification(`${preference} updated successfully.`, 'success');
      } catch (error) {
        console.error('Error updating preference:', error);
        showNotification(`Failed to update ${preference}.`, 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Email Notifications</h4>
          <p className="text-sm text-gray-500">Receive order updates and promotions</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={userProfile.preferences.notifications}
            onChange={() => handleToggle('notifications', userProfile.preferences.notifications)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">SMS Notifications</h4>
          <p className="text-sm text-gray-500">Get delivery updates via text</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={userProfile.preferences.smsNotifications}
            onChange={() => handleToggle('smsNotifications', userProfile.preferences.smsNotifications)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Marketing Preferences</h4>
          <p className="text-sm text-gray-500">Receive special offers and updates</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={userProfile.preferences.marketingPreferences}
            onChange={() => handleToggle('marketingPreferences', userProfile.preferences.marketingPreferences)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};

export default Preferences;