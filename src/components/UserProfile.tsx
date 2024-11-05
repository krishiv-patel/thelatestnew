import React, { useEffect, useState } from 'react';
import { getUserEmail } from '../utils/firestoreUtils';
import { auth } from '../firebase';

const UserProfile: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const fetchEmail = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEmail = await getUserEmail(user.uid);
        if (userEmail) {
          setEmail(userEmail);
        }
      }
    };

    fetchEmail();
  }, []);

  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {email}</p>
      {/* Other user info */}
    </div>
  );
};

export default UserProfile; 