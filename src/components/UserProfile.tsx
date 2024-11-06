import React, { useEffect, useState } from 'react';
import { getUserEmail, firestoreDB } from '../utils/firestoreUtils';
import { auth } from '../firebase';

const UserProfile: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [lastLogin, setLastLogin] = useState<Date | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user && user.email) {
        const userData = await firestoreDB.getUserByEmail(user.email);
        if (userData) {
          setEmail(userData.email);
          setName(userData.name);
          setLastLogin(userData.lastLogin.toDate());
          // Fetch other advanced parameters as needed
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {email}</p>
      <p>Name: {name}</p>
      <p>Last Login: {lastLogin ? lastLogin.toLocaleString() : 'N/A'}</p>
      {/* Display other advanced parameters */}
    </div>
  );
};

export default UserProfile; 