import { Address } from "./address";

export interface UserProfileData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  address: Address;
  email: string;
  emailVerified: boolean;
  photoURL?: string;
  preferences: {
    notifications: boolean;           // Email Notifications
    smsNotifications: boolean;        // SMS Notifications
    marketingPreferences: boolean;    // Marketing Preferences
    theme: string;
  };
} 