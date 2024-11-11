import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { firestoreDB } from '../utils/firestore'; // Ensure correct import
import { Package, MapPin, Settings, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderHistory from './profile/OrderHistory';
import ShippingAddresses from './profile/ShippingAddresses';
import Preferences from './profile/Preferences';
import Security from './profile/Security';
import { storage } from '../firebase'; // Import Firebase Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Address } from '../types/address'; // Import Address interface
import { format } from 'date-fns';

interface UserProfileData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string; // ISO string
  address: Address;
  email: string;
  emailVerified: boolean;
  photoURL?: string; // Add photoURL
  preferences: {
    notifications: boolean;
    smsNotifications: boolean;
    marketingPreferences: boolean;
    theme: string;
  };
}

// Example for Form Field Component
const FormField: React.FC<{
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  children?: React.ReactNode; // Allow children for select options
  }> = ({ label, id, type, value, onChange, error, children }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
      {label}
    </label>
    {type === 'select' ? (
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md border ${
          error ? 'border-red-500' : 'border-gray-300'
        } p-2 shadow-sm focus:border-green-500 focus:ring-green-500`}
      >
        {/* Options */}
        {children}
      </select>
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md border ${
          error ? 'border-red-500' : 'border-gray-300'
        } p-2 shadow-sm focus:border-green-500 focus:ring-green-500`}
      />
    )}
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
  </div>
);
const Profile: React.FC = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const { showNotification } = useNotification();
  const { shippingAddress, setShippingAddress } = useCart();
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    address: {
      fullName: '',
      streetAddress: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
    },
    email: '',
    emailVerified: false,
    photoURL: '', // Initialize photoURL
    preferences: {
      notifications: true,
      smsNotifications: false,
      marketingPreferences: false,
      theme: "light",
    },
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [lastLogin, setLastLogin] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState<boolean>(false); // State to manage upload status

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.email) {
        try {
          const userData = await firestoreDB.getUserByEmail(user.email);
          console.log('Fetched User Data:', userData); // Add this line for debugging

          if (userData) {
            setProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              gender: userData.gender || '',
              birthDate: userData.birthDate || '',
              address: userData.address || {
                fullName: '',
                streetAddress: '',
                apartment: '',
                city: '',
                state: '',
                zipCode: '',
                phone: '',
              },
              email: userData.email,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL || userData.photoURL || '',
              preferences: userData.preferences || {
                notifications: true,
                smsNotifications: false,
                marketingPreferences: false,
                theme: "light",
              },
            });
            setUserProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              gender: userData.gender || '',
              birthDate: userData.birthDate || '',
              address: userData.address || {
                fullName: '',
                streetAddress: '',
                apartment: '',
                city: '',
                state: '',
                zipCode: '',
                phone: '',
              },
              email: userData.email,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL || userData.photoURL || '',
              preferences: userData.preferences || {
                notifications: true,
                smsNotifications: false,
                marketingPreferences: false,
                theme: "light",
              },
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          showNotification('Failed to load profile.', 'error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!profile.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }

    if (!profile.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (!profile.address.streetAddress?.trim()) {
      errors.streetAddress = 'Street address is required.';
    }

    if (!profile.address.city?.trim()) {
      errors.city = 'City is required.';
    }

    if (!profile.address.state?.trim()) {
      errors.state = 'State is required.';
    }

    if (!profile.address.zipCode?.trim()) {
      errors.zipCode = 'Zip code is required.';
    }

    if (!profile.address.phone?.trim()) {
      errors.phone = 'Phone number is required.';
    }

    if (profile.birthDate) {
      const selectedDate = new Date(profile.birthDate);
      const today = new Date();
      if (selectedDate > today) {
        errors.birthDate = 'Birth date cannot be in the future.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        showNotification('Verification email resent.', 'success');
      } catch (error: any) {
        console.error('Error resending verification email:', error);
        showNotification('Failed to resend verification email.', 'error');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // List of address-related field names
    const addressFields = ['fullName', 'streetAddress', 'apartment', 'city', 'state', 'zipCode', 'phone'];

    if (addressFields.includes(name)) {
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `profilePhotos/${user?.uid}/${file.name}`);
      setUploading(true);
      try {
        // Upload the file
        await uploadBytes(storageRef, file);
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        // Update the user's photoURL in Firebase Auth
        await auth.currentUser?.updateProfile({
          photoURL: downloadURL,
        });
        // Update Firestore user profile
        await firestoreDB.updateUserProfile(user.email, {
          photoURL: downloadURL,
        });
        // Update local profile state
        setProfile((prev) => ({
          ...prev,
          photoURL: downloadURL,
        }));
        setUserProfile((prev) => ({
          ...prev,
          photoURL: downloadURL,
        }));
        showNotification('Profile photo updated successfully.', 'success');
      } catch (error) {
        console.error('Error uploading profile photo:', error);
        showNotification('Failed to upload profile photo.', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (user && user.email) {
      // Form validation
      if (!validateForm()) {
        showNotification('Please fix the errors in the form.', 'error');
        return;
      }

      try {
        // Update User Profile in Firestore
        await firestoreDB.updateUserProfile(user.email, {
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          birthDate: profile.birthDate,
          address: profile.address, // Address object
          // photoURL is handled separately
        });

        // Bi-directional synchronization: Update Cart's shippingAddress
        await firestoreDB.updateCart(user.email, {
          shippingAddress: profile.address, // Address object
        });

        // Update local CartContext's shippingAddress
        setShippingAddress(profile.address);

        // Update other states if needed
        setEmail(profile.email);
        setName(`${profile.firstName} ${profile.lastName}`);
        showNotification('Profile updated successfully.', 'success');
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-16">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'shipping', label: 'Shipping Addresses', icon: MapPin },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16" // Added pt-16 for top padding
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          My Account
        </motion.h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden backdrop-blur-sm bg-white/80"
            >
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>
          </nav>

          {/* Main Content */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 backdrop-blur-sm bg-white/80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {activeTab === 'personal' && (
                    <div>
                      {/* Email Verification Notice */}
                      {!profile.emailVerified && user?.providerData.some(p => p.providerId === 'password') && (
                        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                          <p>Your email is not verified.</p>
                          <button
                            onClick={resendVerification}
                            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                          >
                            Resend Verification Email
                          </button>
                        </div>
                      )}
                      {!isEditing ? (
                        <div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name:</label>
                            <p>{profile.firstName} {profile.lastName}</p>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Gender:</label>
                            <p>{profile.gender}</p>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Birth Date:</label>
                            <p>
                              {profile.birthDate
                                ? format(new Date(profile.birthDate), 'dd MMMM yyyy')
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                            <p>{profile.address.streetAddress}</p>
                          </div>
                          <div className="text-center">
                            <button
                              onClick={() => setIsEditing(true)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                              Edit Profile
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <FormField
                            label="First Name"
                            id="firstName"
                            type="text"
                            value={profile.firstName}
                            onChange={handleChange}
                            error={formErrors.firstName}
                          />
                          <FormField
                            label="Last Name"
                            id="lastName"
                            type="text"
                            value={profile.lastName}
                            onChange={handleChange}
                            error={formErrors.lastName}
                          />
                          <FormField
                            label="Gender"
                            id="gender"
                            type="select"
                            value={profile.gender}
                            onChange={handleChange}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </FormField>
                          <FormField
                            label="Birth Date"
                            id="birthDate"
                            type="date"
                            value={profile.birthDate}
                            onChange={handleChange}
                            error={formErrors.birthDate}
                          />
                          <FormField
                            label="Street Address"
                            id="streetAddress"
                            type="text"
                            value={profile.address.streetAddress}
                            onChange={handleChange}
                            error={formErrors.streetAddress}
                          />
                          <FormField
                            label="Full Name"
                            id="fullName"
                            type="text"
                            value={profile.address.fullName}
                            onChange={handleChange}
                            error={formErrors.fullName}
                          />
                          <FormField
                            label="Apartment"
                            id="apartment"
                            type="text"
                            value={profile.address.apartment}
                            onChange={handleChange}
                            error={formErrors.apartment}
                          />
                          <FormField
                            label="City"
                            id="city"
                            type="text"
                            value={profile.address.city}
                            onChange={handleChange}
                            error={formErrors.city}
                          />
                          <FormField
                            label="State"
                            id="state"
                            type="text"
                            value={profile.address.state}
                            onChange={handleChange}
                            error={formErrors.state}
                          />
                          <FormField
                            label="ZIP Code"
                            id="zipCode"
                            type="text"
                            value={profile.address.zipCode}
                            onChange={handleChange}
                            error={formErrors.zipCode}
                          />
                          <FormField
                            label="Phone"
                            id="phone"
                            type="tel"
                            value={profile.address.phone}
                            onChange={handleChange}
                            error={formErrors.phone}
                          />
                          <div className="flex justify-between">
                            <button
                              onClick={handleSave}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setFormErrors({});
                              }}
                              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render other tabs */}
                  {activeTab === 'orders' && <OrderHistory />}
                  {activeTab === 'shipping' && <ShippingAddresses />}
                  {activeTab === 'preferences' && <Preferences />}
                  {activeTab === 'security' && <Security />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
