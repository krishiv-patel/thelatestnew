import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "smoothie-test-53729.firebaseapp.com",
  projectId: "smoothie-test-53729",
  storageBucket: "smoothie-test-53729.appspot.com",
  messagingSenderId: "470130981302",
  appId: "1:470130981302:web:6ba77ce82dcebd7bace917",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateUsers = async () => {
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);

  for (const userDoc of usersSnapshot.docs) {
    const data = userDoc.data();
    const email = data.email.toLowerCase();
    const newUserRef = doc(db, 'users', email);

    // Check if new document already exists to avoid duplicates
    const newUserSnap = await getDoc(newUserRef);
    if (!newUserSnap.exists()) {
      await setDoc(newUserRef, data);
      console.log(`Migrated user: ${email}`);
      // Optionally, delete the old document
      await deleteDoc(userDoc.ref);
      console.log(`Deleted old document: ${userDoc.id}`);
    } else {
      console.log(`Document for ${email} already exists. Skipping.`);
    }
  }
};

migrateUsers()
  .then(() => {
    console.log("Migration completed successfully.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
