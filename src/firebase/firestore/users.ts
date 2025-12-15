
'use client';
import { doc, getDoc, setDoc, Firestore, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
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
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
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

export async function getAllUsers(db: Firestore): Promise<UserProfile[]> {
    const users: UserProfile[] = [];
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    return users;
}
