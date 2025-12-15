
'use client';
import { doc, getDoc, setDoc, Firestore, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  photoURL?: string;
  following?: string[];
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
  // Ensure 'following' is initialized if not present
  const initialData = {
    ...data,
    following: data.following || [],
  };
  await setDoc(docRef, initialData, { merge: true });
}

export async function followUser(db: Firestore, currentUserId: string, targetUserId: string) {
  const userRef = doc(db, 'users', currentUserId);
  await updateDoc(userRef, {
    following: arrayUnion(targetUserId)
  });
}

export async function unfollowUser(db: Firestore, currentUserId: string, targetUserId: string) {
  const userRef = doc(db, 'users', currentUserId);
  await updateDoc(userRef, {
    following: arrayRemove(targetUserId)
  });
}
