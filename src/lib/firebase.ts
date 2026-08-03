import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DocumentData } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface SavedTransaction {
  id: string;
  userId?: string;
  data: DocumentData;
  createdAt: string;
  updatedAt: string;
  totalRolls: number;
  totalYards: number;
  grandTotal: number;
}

const COLLECTION_NAME = 'transactions';

/**
 * Save or Update a transaction in Firestore with userId tag
 */
export async function saveTransactionToDb(
  docData: DocumentData,
  userId: string,
  existingId?: string
): Promise<string> {
  const transactionsRef = collection(db, COLLECTION_NAME);
  const now = new Date().toISOString();

  // Compute summary stats
  const totalRolls = docData.items.reduce((acc, item) => acc + item.rolls.length, 0);
  const totalYards = docData.items.reduce(
    (acc, item) => acc + item.rolls.reduce((sum, r) => sum + r, 0),
    0
  );
  const grandTotal = docData.items.reduce((acc, item) => {
    const itemYard = item.rolls.reduce((sum, r) => sum + r, 0);
    const itemGross = itemYard * item.hargaSatuan;
    return acc + itemGross * (1 - item.diskonPersen / 100);
  }, 0);

  const payload = {
    docData,
    userId: userId || 'anonymous',
    totalRolls,
    totalYards,
    grandTotal,
    updatedAt: now,
  };

  if (existingId) {
    const docRef = doc(db, COLLECTION_NAME, existingId);
    await setDoc(docRef, payload, { merge: true });
    return existingId;
  } else {
    const newDocRef = await addDoc(transactionsRef, {
      ...payload,
      createdAt: now,
    });
    return newDocRef.id;
  }
}

/**
 * Query Firestore to check if a transaction exists by Invoice / Surat Jalan code or Document ID
 */
export async function verifyPublicTransaction(code: string): Promise<SavedTransaction | null> {
  if (!code || !code.trim()) return null;
  const cleanCode = code.trim().toLowerCase();
  try {
    const transactionsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(transactionsRef);
    for (const docSnap of snapshot.docs) {
      const dData = docSnap.data();
      const docData = dData.docData as DocumentData;
      if (!docData) continue;
      const invMatch = docData.noInvoice && docData.noInvoice.trim().toLowerCase() === cleanCode;
      const sjMatch = docData.noSuratJalan && docData.noSuratJalan.trim().toLowerCase() === cleanCode;
      const idMatch = docSnap.id.toLowerCase() === cleanCode;

      if (invMatch || sjMatch || idMatch) {
        return {
          id: docSnap.id,
          userId: dData.userId || '',
          data: docData,
          createdAt: dData.createdAt || new Date().toISOString(),
          updatedAt: dData.updatedAt || new Date().toISOString(),
          totalRolls: dData.totalRolls || 0,
          totalYards: dData.totalYards || 0,
          grandTotal: dData.grandTotal || 0,
        };
      }
    }
  } catch (err) {
    console.error('Error verifying public transaction:', err);
  }
  return null;
}

/**
 * Delete a transaction document from Firestore
 */
export async function deleteTransactionFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Subscribe to real-time updates of user-specific transactions from Firestore
 */
export function subscribeTransactions(
  userId: string,
  onUpdate: (transactions: SavedTransaction[]) => void,
  onError?: (err: Error) => void
) {
  const transactionsRef = collection(db, COLLECTION_NAME);
  const q = query(transactionsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SavedTransaction[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId || '',
            data: data.docData as DocumentData,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            totalRolls: data.totalRolls || 0,
            totalYards: data.totalYards || 0,
            grandTotal: data.grandTotal || 0,
          };
        })
        // Isolate transactions per user account
        .filter((t) => !userId || !t.userId || t.userId === userId);

      onUpdate(list);
    },
    (error) => {
      console.error('Error fetching transactions from Firestore:', error);
      if (onError) onError(error);
    }
  );
}
