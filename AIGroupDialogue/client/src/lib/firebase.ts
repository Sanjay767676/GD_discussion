import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if we have all required config
let app: any = null;
let db: any = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase configuration missing, using fallback storage");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db };
export default app;
