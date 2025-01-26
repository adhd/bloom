import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore/lite';
import { EnergyEntry } from './types';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper functions for Firestore operations
export async function saveEntry(entry: Omit<EnergyEntry, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'entries'), entry);
    return { ...entry, id: docRef.id };
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
}

export async function getEntries(): Promise<EnergyEntry[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'entries'));
    return querySnapshot.docs.map(doc => ({
      ...(doc.data() as Omit<EnergyEntry, 'id'>),
      id: doc.id
    }));
  } catch (error) {
    console.error('Error getting entries:', error);
    throw error;
  }
}

export async function updateEntry(id: string, data: Partial<EnergyEntry>) {
  try {
    const docRef = doc(db, 'entries', id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
}

export const deleteEntry = async (entryId: string) => {
  const docRef = doc(db, 'entries', entryId);
  await deleteDoc(docRef);
};

export { db }; 