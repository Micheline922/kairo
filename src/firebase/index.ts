'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore'

function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  // NOTE: Emulator connection logic has been removed to ensure
  // the app connects to production Firebase services when deployed.
  // For local development with emulators, developers should
  // temporarily uncomment and configure the connection logic below.

  /*
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const firestoreHost = 'localhost';
    const firestorePort = 8080;
    const authHost = 'localhost';
    const authPort = 9099;
    
    console.log(`Connecting to Firestore emulator at http://${firestoreHost}:${firestorePort}`);
    connectFirestoreEmulator(firestore, firestoreHost, firestorePort);

    console.log(`Connecting to Auth emulator at http://${authHost}:${authPort}`);
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
  }
  */

  return {
    firebaseApp,
    auth,
    firestore
  };
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
