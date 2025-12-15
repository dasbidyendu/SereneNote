
'use client';
import {
  collection,
  addDoc,
  query,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  Firestore,
  DocumentData,
  WithFieldValue,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { User } from 'firebase/auth';

export interface Channel {
  id?: string;
  name: string;
  description?: string;
  creatorId: string;
  createdAt: Timestamp | object;
}

export interface ChatMessage extends DocumentData {
  id?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: Timestamp | object;
}

export async function createChannel(db: Firestore, user: User, channelData: { name: string, description?: string }) {
    const channel: WithFieldValue<Omit<Channel, 'id'>> = {
      ...channelData,
      creatorId: user.uid,
      createdAt: serverTimestamp(),
    };

    const channelsCollection = collection(db, 'channels');

    return addDoc(channelsCollection, channel)
      .catch(async (serverError) => {
        console.error("Error creating channel: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: channelsCollection.path,
          operation: 'create',
          requestResourceData: channel,
          userId: user.uid,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error('Failed to create channel.');
      });
}

export async function getChannels(db: Firestore): Promise<Channel[]> {
  const channelsCollection = collection(db, 'channels');
  const q = query(channelsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const channels: Channel[] = [];
  querySnapshot.forEach((doc) => {
    channels.push({ id: doc.id, ...doc.data() } as Channel);
  });
  return channels;
}

export function getMessages(
    db: Firestore,
    channelId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    const messagesCollection = collection(db, 'channels', channelId, 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'), limit(50));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    }, (error) => {
        console.error("Error listening to messages: ", error);
        const permissionError = new FirestorePermissionError({
            path: `channels/${channelId}/messages`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  
    return unsubscribe;
}

export async function sendMessage(db: Firestore, user: User, channelId: string, content: string) {
    if (!content.trim()) return;

    const message: WithFieldValue<Omit<ChatMessage, 'id'>> = {
        content: content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
    };

    const messagesCollection = collection(db, 'channels', channelId, 'messages');

    return addDoc(messagesCollection, message)
      .catch(async (serverError) => {
        console.error("Error sending message: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: messagesCollection.path,
          operation: 'create',
          requestResourceData: message,
          userId: user.uid,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error('Failed to send message.');
      });
}
