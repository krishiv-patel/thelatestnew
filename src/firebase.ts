// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getFunctions } from 'firebase/functions';

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

// Initialize Auth with custom settings
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize providers with custom scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.addScope('user.read');
microsoftProvider.setCustomParameters({
    prompt: 'select_account'
});

// Initialize Firestore with custom settings
export const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

export const functions = getFunctions(app);

export default app;