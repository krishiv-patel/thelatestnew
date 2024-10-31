import React, { useEffect, useState } from 'react';
import { fetchUserProfile } from '../api/userProfile';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
}

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setError('User not authenticated.');
      return;
    }

    const getProfile = async () => {
      try {
        const userProfile = await fetchUserProfile(uid);
        setProfile(userProfile as UserProfile);
      } catch (err) {
        setError('Unable to load profile information.');
        console.error(err);
      }
    };

    getProfile();
  }, [user]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
      <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
      <p><strong>Role:</strong> {profile.role}</p>
    </div>
  );
};

export default Profile; 