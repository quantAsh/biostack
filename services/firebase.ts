import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { log } from '../stores/logStore';

type FirebaseApp = firebase.app.App;

let app: FirebaseApp;
let auth!: firebase.auth.Auth;
let db!: firebase.firestore.Firestore;

export const isFirebaseEnabled = false;
let firebaseConfig;

if (isFirebaseEnabled) {
  try {
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG!);
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    auth = firebase.auth();
    db = firebase.firestore();
    log('SUCCESS', 'Firebase initialized successfully.');
  } catch (e) {
    log('ERROR', 'Firebase initialization failed.', { error: e instanceof Error ? e.message : String(e) });
    console.error("Could not parse FIREBASE_CONFIG or initialize Firebase. App will run in offline mode.", e);
  }
} else {
    log('WARN', 'Firebase config not found. App running in offline mode.');
    console.warn(
    "Firebase config not found in environment variables. App will run in offline mode. Community and user features will be disabled."
  );
}

export { auth, db };