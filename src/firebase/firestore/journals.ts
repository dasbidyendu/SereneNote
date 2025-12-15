
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
  doc,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  likeCount?: number;
  readCount?: number;
  likes?: string[];
}

export async function addJournalEntry(db: Firestore, entry: WithFieldValue<Omit<JournalEntry, 'id'>>) {
  const journalData = {
    ...entry,
    likeCount: 0,
    readCount: 0,
    likes: [],
  };

  const journalCollection = collection(db, 'journalEntries');
  
  // Do not await, chain .catch for error handling
  addDoc(journalCollection, journalData)
    .catch(async (serverError) => {
      console.error("Error adding document: ", serverError);
      const permissionError = new FirestorePermissionError({
        path: journalCollection.path,
        operation: 'create',
        requestResourceData: journalData,
        userId: journalData.authorId,
      });
      errorEmitter.emit('permission-error', permissionError);
      // We still throw to allow the UI to handle the failed state
      throw new Error('Failed to add journal entry');
    });
}

export async function updateJournalEntry(db: Firestore, entryId: string, data: DocumentData) {
  const entryRef = doc(db, 'journalEntries', entryId);
  await updateDoc(entryRef, data);
}

export async function getJournalEntries(db: Firestore, userId: string, isPublic: boolean): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];
  const q = query(
    collection(db, 'journalEntries'),
    where('authorId', '==', userId),
    where('isPublic', '==', isPublic)
  );

  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });
    
    // Sort entries by date on the client side (descending)
    entries.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });

    return entries;
  } catch (error) {
    console.error("Error getting documents: ", error);
    const permissionError = new FirestorePermissionError({
      path: `journalEntries`,
      operation: 'list',
      userId: userId,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw new Error('Failed to get journal entries');
  }
}

export async function getAllUserJournalEntries(db: Firestore, userId: string): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];
  const q = query(
    collection(db, 'journalEntries'),
    where('authorId', '==', userId)
  );

  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });
    
    entries.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });

    return entries;
  } catch (error) {
    console.error("Error getting documents: ", error);
    const permissionError = new FirestorePermissionError({
      path: `journalEntries`,
      operation: 'list',
      userId: userId,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw new Error('Failed to get all journal entries');
  }
}


export async function getPublicJournalEntries(db: Firestore): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];
  const q = query(
    collection(db, 'journalEntries'),
    where('isPublic', '==', true)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
  });

  // Sort entries by date on the client side (descending)
  entries.sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
    return dateB - dateA;
  });

  return entries;
}
