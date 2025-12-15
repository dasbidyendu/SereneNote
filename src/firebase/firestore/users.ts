
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
  // Always ensure followers and following are arrays, even if they dont exist in `data` or the doc
  await setDoc(docRef, { 
      following: [], 
      followers: [], 
      ...data 
  }, { merge: true });
}

export async function followUser(db: Firestore, currentUserId: string, targetUserId: string) {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  
  // Ensure the fields exist before updating
  await setDoc(currentUserRef, { following: [] }, { merge: true });
  await setDoc(targetUserRef, { followers: [] }, { merge: true });
  
  await updateDoc(currentUserRef, {
    following: arrayUnion(targetUserId)
  });
  await updateDoc(targetUserRef, {
    followers: arrayUnion(currentUserId)
  });
}

export async function unfollowUser(db: Firestore, currentUserId: string, targetUserId:string) {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  // Ensure the fields exist before updating
  await setDoc(currentUserRef, { following: [] }, { merge: true });
  await setDoc(targetUserRef, { followers: [] }, { merge: true });

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
