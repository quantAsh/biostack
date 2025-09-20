import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { log } from '../stores/logStore';

type FirebaseApp = firebase.app.App;

let app: FirebaseApp | undefined;
let auth: firebase.auth.Auth | undefined;
let db: firebase.firestore.Firestore | undefined;

// Determine whether Firebase should be enabled.
// If FIRESTORE_EMULATOR_HOST is set, prefer emulator mode.
let firebaseEnabled = false;
let firebaseConfig: any = null;

try {
  // If Vite env contains a Firebase config, enable Firebase
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse((import.meta as any).env.VITE_FIREBASE_CONFIG);
  }
} catch (e) {
  // ignore parse errors; we'll handle below
}

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || (typeof (globalThis as any).__FIRESTORE_EMULATOR_HOST !== 'undefined' ? (globalThis as any).__FIRESTORE_EMULATOR_HOST : undefined);

if (firebaseConfig || emulatorHost) {
  try {
    // When running against the emulator without a real Firebase config,
    // initialize the app with a minimal config (projectId) and avoid
    // calling `firebase.auth()` which validates API keys and will fail
    // in emulator-only environments. This ensures `db` is available.
    const initConfig = firebaseConfig || (emulatorHost ? { projectId: 'demo-project' } : {});
    if (!firebase.apps.length) {
      app = firebase.initializeApp(initConfig);
    } else {
      app = firebase.app();
    }

    // Always initialize Firestore; keep auth initialization only when a real
    // firebaseConfig is provided to avoid auth errors (invalid-api-key) when
    // using the emulator.
    db = firebase.firestore();
    if (firebaseConfig) {
      auth = firebase.auth();
    }

    // If emulator host is present, connect to it
    if (emulatorHost) {
      // FIRESTORE_EMULATOR_HOST format is host:port
      const [host, portStr] = emulatorHost.split(':');
      const port = parseInt(portStr || '8080', 10) || 8080;
      // For compat version, use useEmulator if available
      try {
        // @ts-ignore
        if (typeof (db as any).useEmulator === 'function') {
          // firebase/compat supports useEmulator
          // @ts-ignore
          (db as any).useEmulator(host, port);
        } else {
          // fallback: set settings
          db.settings({ host: `${host}:${port}`, ssl: false } as any);
        }
      } catch (e) {
        console.warn('Could not connect Firestore to emulator via useEmulator. Attempting settings fallback.');
        try { db.settings({ host: `${host}:${port}`, ssl: false } as any); } catch (_) {}
      }
    }

    firebaseEnabled = true;
    log('SUCCESS', 'Firebase initialized successfully.', { emulator: !!emulatorHost });
  } catch (e) {
    log('ERROR', 'Firebase initialization failed.', { error: e instanceof Error ? e.message : String(e) });
    console.error('Could not initialize Firebase. App will run in offline mode.', e);
    firebaseEnabled = false;
  }
} else {
  log('WARN', 'Firebase config not found. App running in offline mode.');
  console.warn(
    'Firebase config not found in environment variables. App will run in offline mode. Community and user features will be disabled.'
  );
}

// Export as a mutable binding so tests can override the runtime value when needed.
export let isFirebaseEnabled = firebaseEnabled;

// Helper to allow tests to toggle firebase enabled state without re-importing the module.
export function setFirebaseEnabled(v: boolean) {
  isFirebaseEnabled = v;
}

// Helper to allow tests to inject a fake Firestore instance.
export function setDb(d: any) {
  db = d;
}
export { auth, db };