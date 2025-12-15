'use client';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
}

export async function getUserProfile(db: Firestore, userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
}

export async function setUserProfile(db: Firestore, userId: string, data: Partial<UserProfile>) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, data, { merge: true });
}
