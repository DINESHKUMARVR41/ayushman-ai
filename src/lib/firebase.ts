/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Default configuration fallback
const firebaseConfig = {
  apiKey: "AIzaSyDNCNpL4tP1hObJDtk6UjL8vPB74Kgr8RM",
  authDomain: "kingly-sunbeam-g77bw.firebaseapp.com",
  projectId: "kingly-sunbeam-g77bw",
  storageBucket: "kingly-sunbeam-g77bw.firebasestorage.app",
  messagingSenderId: "475446772716",
  appId: "1:475446772716:web:0f268417e2f92b9714b6c9"
};

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Enable Firestore offline persistence for a genuine offline-first experience
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed-precondition (multiple tabs open)');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence unimplemented in this browser');
    }
  });
}

export default app;
