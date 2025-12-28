'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Note: You can't use process.env.NEXT_PUBLIC_... here because this is not a Next.js file.
    // We are deliberately not using NEXT_PUBLIC_... because we don't want to expose these to the client.
    const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || 'localhost';
    const firestorePort = parseInt(process.env.FIRESTORE_EMULATOR_PORT || '8080', 10);
    const authHost = process.env.AUTH_EMULATOR_HOST || 'localhost';
    const authPort = parseInt(process.env.AUTH_EMULATOR_PORT || '9099', 10);
    
    console.log(`Connecting to Firestore emulator at http://${firestoreHost}:${firestorePort}`);
    connectFirestoreEmulator(firestore, firestoreHost, firestorePort);

    console.log(`Connecting to Auth emulator at http://${authHost}:${authPort}`);
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
  }

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