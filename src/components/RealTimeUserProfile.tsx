import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

const RealTimeUserProfile: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.email.toLowerCase()), (docSnap) => {
        if (docSnap.exists()) {
          setEmail(docSnap.get("email"));
        }
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <div>
      <h2>Real-Time User Profile</h2>
      <p>Email: {email}</p>
      {/* Other real-time user info */}
    </div>
  );
};

export default RealTimeUserProfile; 