
'use client';
import { doc, getDoc, setDoc, Firestore, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  bio?: string;
  photoURL?: string;
  following?: string[];
  followers?: string[];
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
  // Ensure 'following' and 'followers' are initialized if not present
  const initialData = {
    ...data,
    following: data.following || [],
    followers: data.followers || [],
  };
  await setDoc(docRef, initialData, { merge: true });
}

export async function followUser(db: Firestore, currentUserId: string, targetUserId: string) {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  
  await updateDoc(currentUserRef, {
    following: arrayUnion(targetUserId)
  });
  await updateDoc(targetUserRef, {
    followers: arrayUnion(currentUserId)
  });
}

export async function unfollowUser(db: Firestore, currentUserId: string, targetUserId: string) {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  await updateDoc(currentUserRef, {
    following: arrayRemove(targetUserId)
  });
  await updateDoc(targetUserRef, {
    followers: arrayRemove(currentUserId)
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
