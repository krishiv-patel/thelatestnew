import { writeBatch, doc, getDoc, setDoc, getFirestore, collection, query, orderBy, limit, startAfter, getDocs, DocumentSnapshot, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';

/**
 * Batch writes multiple documents.
 * @param dataArray Array of data objects to be written.
 */
export const batchWriteDocuments = async (dataArray: Array<{id: string, data: any}>) => {
  const batch = writeBatch(db);
  
  dataArray.forEach(item => {
    const docRef = doc(db, "collectionName", item.id);
    batch.set(docRef, item.data);
  });

  await batch.commit();
  console.log("Batch write completed.");
};

/**
 * Updates user data only if changes are detected.
 * @param uid User's UID.
 * @param newData New data to update.
 */
export const updateUserIfChanged = async (uid: string, newData: any) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const currentData = userSnap.data();
    // Compare existing data with newData
    if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
      await setDoc(userRef, newData, { merge: true });
      console.log("User data updated.");
    } else {
      console.log("No changes detected. Write skipped.");
    }
  } else {
    await setDoc(userRef, newData);
    console.log("User document created.");
  }
};

/**
 * Fetches only the email field of a user.
 * @param uid User's UID.
 * @returns User's email or null.
 */
export const getUserEmail = async (uid: string): Promise<string | null> => {
  const userRef = doc(getFirestore(), "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.get("email");
  }
  return null;
};

/**
 * Fetches a paginated list of users.
 * @param lastDoc The last document from the previous fetch for pagination.
 * @returns An object containing the fetched documents and the last document reference.
 */
export const fetchUsersPaginated = async (lastDoc: DocumentSnapshot | null = null) => {
  let q;
  if (lastDoc) {
    q = query(
      collection(db, "users"),
      orderBy("createdAt"),
      startAfter(lastDoc),
      limit(20)
    );
  } else {
    q = query(
      collection(db, "users"),
      orderBy("createdAt"),
      limit(20)
    );
  }

  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(doc => doc.data());
  const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

  return { users, lastDoc: newLastDoc };
};

/**
 * Deletes a user document.
 * @param uid User's UID.
 */
export const deleteUserDocument = async (uid: string) => {
  try {
    await deleteDoc(doc(db, "users", uid));
    console.log("User document deleted.");
  } catch (error) {
    console.error("Error deleting user document:", error);
  }
};