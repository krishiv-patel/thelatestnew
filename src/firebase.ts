// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBehswGm4DJazvZr76fEk-ykGlhw-kiBMk",
    authDomain: "smoothie-test-53729.firebaseapp.com",
    databaseURL: "https://smoothie-test-53729-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smoothie-test-53729",
    storageBucket: "smoothie-test-53729.appspot.com",
    messagingSenderId: "470130981302",
    appId: "1:470130981302:web:6ba77ce82dcebd7bace917",
    measurementId: "G-TB7787HSVC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;