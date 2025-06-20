import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Your Firebase configuration
// You'll need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

// Check if we have the minimum required config
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.projectId && 
                      firebaseConfig.authDomain;

// Initialize Firebase only on client side and if not already initialized
let app;
if (typeof window !== 'undefined' && !getApps().length && hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else if (getApps().length) {
  app = getApps()[0];
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = typeof window !== 'undefined' && app ? getAuth(app) : null;
export const googleProvider = typeof window !== 'undefined' ? new GoogleAuthProvider() : null;

// Authentication functions
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not initialized. Please check your environment variables.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  if (!auth) {
    throw new Error('Firebase not initialized. Please check your environment variables.');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Return a no-op function if Firebase is not initialized
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
}; 