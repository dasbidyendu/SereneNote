
'use client';
import { doc, getDoc, setDoc, Firestore, updateDoc, arrayUnion, arrayRemove, collection, getDocs, DocumentData, WithFieldValue, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { registerListener } from '../listeners';

export interface UserProfile extends DocumentData {
  id?: string;
  name: string;
  email: string;
  bio?: string;
  photoURL?: string;
  coverImage?: string;
  motto?: string;
  following?: string[];
  followers?: string[];
}

export interface Notification extends DocumentData {
  id?: string;
  type: 'mention';
  fromUserId: string;
  fromUserName: string;
  fromUserPhotoURL?: string;
  channelId: string;
  channelName: string;
  messageId: string;
  messageSnippet?: string;
  createdAt: WithFieldValue<DocumentData>;
  read: boolean;
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
  await setDoc(docRef, data, { merge: true });
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

export async function unfollowUser(db: Firestore, currentUserId: string, targetUserId:string) {
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

export function getNotifications(
    db: Firestore,
    userId: string,
    callback: (notifications: Notification[]) => void
) {
    const notificationsCollection = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() } as Notification);
        });
        callback(notifications);
    });
    
    // Register the listener for cleanup on logout
    registerListener(unsubscribe);

    return unsubscribe;
}

export async function markNotificationsAsRead(db: Firestore, userId: string, notificationIds: string[]) {
    if (notificationIds.length === 0) return;
    
    const batch = writeBatch(db);
    notificationIds.forEach(id => {
        const notificationRef = doc(db, `users/${userId}/notifications/${id}`);
        batch.update(notificationRef, { read: true });
    });

    await batch.commit();
}
