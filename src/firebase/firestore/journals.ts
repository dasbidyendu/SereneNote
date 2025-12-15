'use client';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Firestore,
  DocumentData,
  WithFieldValue,
  Timestamp,
} from 'firebase/firestore';

export interface JournalEntry extends DocumentData {
  id?: string;
  title: string;
  content: string;
  mood: 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Excited';
  isPublic: boolean;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  createdAt: Timestamp | object;
}

export async function addJournalEntry(db: Firestore, entry: WithFieldValue<Omit<JournalEntry, 'id'>>) {
  try {
    const docRef = await addDoc(collection(db, 'journalEntries'), entry);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add journal entry');
  }
}

export async function getJournalEntries(db: Firestore, userId: string, isPublic: boolean): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];
  const q = query(
    collection(db, 'journalEntries'),
    where('authorId', '==', userId),
    where('isPublic', '==', isPublic),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
  });

  return entries;
}

export async function getPublicJournalEntries(db: Firestore): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];
  const q = query(
    collection(db, 'journalEntries'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
  });

  return entries;
}
