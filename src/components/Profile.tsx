import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import firestoreDB from '../utils/firestore';

interface UserProfileData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string; // ISO string
  address: string;
  email: string;
  emailVerified: boolean;
}

const Profile: React.FC = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const { showNotification } = useNotification();
  const { shippingAddress, setShippingAddress } = useCart();
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    address: '',
    email: '',
    emailVerified: false,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.email) {
        try {
          const userData = await firestoreDB.getUserByEmail(user.email);
          if (userData) {
            setProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              gender: userData.gender || '',
              birthDate: userData.birthDate || '',
              address: userData.address || '',
              email: userData.email,
              emailVerified: user.emailVerified,
            });
            setUserProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              gender: userData.gender || '',
              birthDate: userData.birthDate || '',
              address: userData.address || '',
              email: userData.email,
              emailVerified: user.emailVerified,
            });
            setShippingAddress(userData.address || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          showNotification('Failed to load profile.', 'error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user, setUserProfile, setShippingAddress, showNotification]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!profile.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }

    if (!profile.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (!profile.address.trim()) {
      errors.address = 'Address is required.';
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
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (user && user.email) {
      // Form validation
      if (!validateForm()) {
        showNotification('Please fix the errors in the form.', 'error');
        return;
      }

      try {
        // Update User Profile
        await firestoreDB.updateUserProfile(user.email, {
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          birthDate: profile.birthDate,
          address: profile.address,
        });

        // Bi-directional synchronization: Update Cart's shippingAddress
        await firestoreDB.updateCart(user.email, {
          shippingAddress: profile.address,
        });

        // Update local CartContext's shippingAddress
        setShippingAddress(profile.address);

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-lg bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>

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

        {profile.emailVerified || !user?.providerData.some(p => p.providerId === 'password') ? (
          <div>
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
                  <p>{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                  <p>{profile.address}</p>
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
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">First Name<span className="text-red-500">*</span>:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    className={`shadow appearance-none border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs italic mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">Last Name<span className="text-red-500">*</span>:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    className={`shadow appearance-none border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs italic mt-1">{formErrors.lastName}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">Gender:</label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthDate">Birth Date:</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={profile.birthDate}
                    onChange={handleChange}
                    className={`shadow appearance-none border ${formErrors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  />
                  {formErrors.birthDate && (
                    <p className="text-red-500 text-xs italic mt-1">{formErrors.birthDate}</p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address<span className="text-red-500">*</span>:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className={`shadow appearance-none border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="Enter your address"
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs italic mt-1">{formErrors.address}</p>
                  )}
                </div>
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
        ) : null}
      </div>
    </div>
  );
};

export default Profile;