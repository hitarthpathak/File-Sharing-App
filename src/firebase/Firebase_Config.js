import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebase_config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebase_config);

export const auth_instance = getAuth(app);
export const db_instance = getFirestore(app);
export const storage_instance = getStorage(app);

if (location.hostname === "localhost") {
    connectAuthEmulator(auth_instance, "http://localhost:9099");
    connectFirestoreEmulator(db_instance, "localhost", 8080);
    connectStorageEmulator(storage_instance, "localhost", 9199);
};

export default { app, auth_instance, db_instance, storage_instance };