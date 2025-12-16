
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
  doc,
  runTransaction,
  arrayUnion,
  increment,
  writeBatch,
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
  members?: string[];
  memberCount?: number;
}

export interface MessagePart {
    type: 'text' | 'mention' | 'journal';
    text?: string;
    mention?: {
      userId: string;
      name: string;
    };
    journal?: {
      id: string;
      title: string;
    }
}

export interface StructuredMessage {
    parts: MessagePart[];
}

export interface ChatMessage extends DocumentData {
  id?: string;
  parts: MessagePart[];
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
      members: [user.uid],
      memberCount: 1,
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
  // Sort by memberCount descending. A composite index may be required.
  const q = query(channelsCollection, orderBy('memberCount', 'desc'));
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
        const data = doc.data();
        // Fallback for old string-based messages
        if (typeof data.content === 'string' && !data.parts) {
          messages.push({ id: doc.id, parts: [{ type: 'text', text: data.content }], ...data } as ChatMessage);
        } else {
          messages.push({ id: doc.id, ...data } as ChatMessage);
        }
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

function createMessageSnippet(parts: MessagePart[]): string {
    return parts.map(part => {
        if (part.type === 'text') return part.text;
        if (part.type === 'mention') return `@${part.mention?.name}`;
        if (part.type === 'journal') return `#${part.journal?.title}`;
        return '';
    }).join('').substring(0, 100);
}

export async function sendMessage(db: Firestore, user: User, channelId: string, structuredMessage: StructuredMessage, channelName: string) {
    if (structuredMessage.parts.length === 0) return;

    const message: WithFieldValue<Omit<ChatMessage, 'id'>> = {
        parts: structuredMessage.parts,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
    };
    
    const channelRef = doc(db, 'channels', channelId);
    const messagesCollection = collection(channelRef, 'messages');
    const messageRef = doc(messagesCollection); // pre-generate ID

    try {
        await runTransaction(db, async (transaction) => {
            const channelDoc = await transaction.get(channelRef);
            if (!channelDoc.exists()) {
                throw new Error("Channel does not exist!");
            }
            
            transaction.set(messageRef, message);

            const channelData = channelDoc.data();
            const members = channelData.members || [];
            
            if (!members.includes(user.uid)) {
                transaction.update(channelRef, {
                    members: arrayUnion(user.uid),
                    memberCount: increment(1)
                });
            }
        });
        
        // After transaction, create notifications
        const batch = writeBatch(db);
        const mentions = structuredMessage.parts.filter(p => p.type === 'mention' && p.mention?.userId);
        
        if (mentions.length > 0) {
            const messageSnippet = createMessageSnippet(structuredMessage.parts);
            for (const part of mentions) {
                const mentionedUserId = part.mention!.userId;
                if (mentionedUserId === user.uid) continue; // No self-notifications

                const notificationRef = doc(collection(db, `users/${mentionedUserId}/notifications`));
                batch.set(notificationRef, {
                    type: 'mention',
                    fromUserId: user.uid,
                    fromUserName: user.displayName || 'Anonymous',
                    fromUserPhotoURL: user.photoURL || '',
                    channelId,
                    channelName,
                    messageId: messageRef.id,
                    messageSnippet,
                    createdAt: serverTimestamp(),
                    read: false,
                });
            }
            await batch.commit();
        }

    } catch (e: any) {
        console.error("Transaction/Notification failed: ", e);
         const permissionError = new FirestorePermissionError({
          path: messagesCollection.path,
          operation: 'create',
          requestResourceData: message,
          userId: user.uid,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error('Failed to send message.');
    }
}
