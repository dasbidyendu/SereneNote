
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { PageShell } from '@/components/page-shell';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, PlusCircle, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Channel,
  ChatMessage,
  createChannel,
  getChannels,
  getMessages,
  sendMessage,
  StructuredMessage,
  MessagePart,
} from '@/firebase/firestore/chat';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp, type Firestore, getDoc } from 'firebase/firestore';
import { ChatInput, MentionData } from '@/components/chat-input';
import { getAllUsers, UserProfile } from '@/firebase/firestore/users';
import { getPublicJournalEntries, JournalEntry, updateJournalEntry } from '@/firebase/firestore/journals';
import { Separator } from '@/components/ui/separator';

const NewChannelSchema = z.object({
  name: z.string().min(3, "Channel name must be at least 3 characters.").max(30, "Channel name cannot exceed 30 characters."),
  description: z.string().max(100, "Description cannot exceed 100 characters.").optional(),
});

type NewChannelFormValues = z.infer<typeof NewChannelSchema>;

export default function CommunityChatPage() {
  const { user, loading: userLoading } = useUser();
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);

  // Data for autocompletion
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allJournals, setAllJournals] = useState<JournalEntry[]>([]);

  // For viewing a journal
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);

  const newChannelForm = useForm<NewChannelFormValues>({
    resolver: zodResolver(NewChannelSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (user) {
      const { firestore: fs } = getFirebaseServices();
      setFirestore(fs);
    }
  }, [user]);

  useEffect(() => {
    if (user && firestore) {
      setLoadingChannels(true);
      Promise.all([
        getChannels(firestore),
        getAllUsers(firestore),
        getPublicJournalEntries(firestore)
      ]).then(([fetchedChannels, fetchedUsers, fetchedJournals]) => {
        setChannels(fetchedChannels);
        setAllUsers(fetchedUsers.filter(u => u.id !== user.uid)); // Exclude self from mentions
        setAllJournals(fetchedJournals);
      }).catch(error => console.error("Error fetching initial chat data:", error))
        .finally(() => setLoadingChannels(false));
    }
  }, [user, firestore]);

  useEffect(() => {
    if (!firestore || !selectedChannel?.id) {
      setMessages([]);
      return;
    }
    const unsubscribe = getMessages(firestore, selectedChannel.id, setMessages);
    return () => unsubscribe();
  }, [firestore, selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateChannel = async (values: NewChannelFormValues) => {
    if (!user || !firestore) return;
    setIsCreatingChannel(true);
    try {
      const newChannelRef = await createChannel(firestore, user, values);
      const newChannel: Channel = {
        id: newChannelRef.id,
        name: values.name,
        description: values.description,
        creatorId: user.uid,
        createdAt: new Date(),
        members: [user.uid],
        memberCount: 1,
      };
      setChannels(prev => [newChannel, ...prev]);
      setSelectedChannel(newChannel);
      setShowNewChannelDialog(false);
      newChannelForm.reset();
      toast({ title: 'Channel Created!', description: `Channel "${values.name}" is now live.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to create channel', description: 'Please try again.' });
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleSendMessage = async (parts: MessagePart[]) => {
    if (!user || !firestore || !selectedChannel?.id || parts.length === 0) return;
    
    try {
        const message: StructuredMessage = { parts };
        await sendMessage(firestore, user, selectedChannel.id, message, selectedChannel.name);
        
        const channel = channels.find(c => c.id === selectedChannel.id);
        if (channel && !channel.members?.includes(user.uid)) {
            const updatedChannels = channels.map(c => 
                c.id === selectedChannel.id 
                ? {
                    ...c, 
                    memberCount: (c.memberCount || 0) + 1, 
                    members: [...(c.members || []), user.uid]
                  } 
                : c
            );
            setChannels(updatedChannels);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Message failed to send' });
    }
  };
  
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';

  const userMentionData: MentionData[] = useMemo(() => allUsers.map(u => ({
    id: u.id!,
    display: u.name,
    photoURL: u.photoURL,
    initials: getInitials(u.name)
  })), [allUsers]);

  const journalMentionData: MentionData[] = useMemo(() => allJournals.map(j => ({
    id: j.id!,
    display: j.title
  })), [allJournals]);

  const handleJournalClick = (journalId: string) => {
    const journal = allJournals.find(j => j.id === journalId);
    if (journal) {
      setSelectedJournal(journal);
      if (firestore && journal.id) {
        // Increment read count when viewed
        updateJournalEntry(firestore, journal.id, { readCount: (journal.readCount || 0) + 1 });
      }
    }
  };

  if (userLoading) {
      return (
          <PageShell>
              <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          </PageShell>
      )
  }

  return (
    <PageShell>
      <div className="flex items-center gap-4 mb-4">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Community Chat</h1>
          <p className="text-muted-foreground">
            Connect and chat with other users in real-time. Use @ to mention users and # to link journals.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
        <div className="md:col-span-1 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="font-headline text-xl">Channels</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowNewChannelDialog(true)}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-2 flex-grow overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {loadingChannels ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : channels.length > 0 ? (
                  <div className="space-y-2">
                    {channels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={cn(
                          "w-full text-left p-3 rounded-md border transition-colors",
                          selectedChannel?.id === channel.id
                            ? "bg-primary/20 border-primary/50"
                            : "hover:bg-muted/50 border-transparent"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm"># {channel.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {channel.memberCount || 0}
                          </div>
                        </div>
                        {channel.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{channel.description}</p>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-4 text-center">No channels yet. Create one!</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 h-full">
          <Card className="h-full flex flex-col">
            {selectedChannel ? (
              <>
                <CardHeader className="p-4 border-b">
                  <h2 className="font-bold text-lg font-headline"># {selectedChannel.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedChannel.description || 'Welcome to the channel!'}</p>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-y-auto">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                          {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex items-start gap-3", msg.authorId === user?.uid && "justify-end")}>
                              {msg.authorId !== user?.uid && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.authorPhotoURL} />
                                  <AvatarFallback>{getInitials(msg.authorName)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg overflow-hidden break-words", msg.authorId === user?.uid ? "bg-primary/90 text-primary-foreground" : "bg-muted")}>
                                <p className="text-sm whitespace-pre-wrap">
                                    {msg.parts?.map((part, index) => {
                                        if (part.type === 'text') {
                                            return <span key={index}>{part.text}</span>;
                                        }
                                        if (part.type === 'mention' && part.mention) {
                                            return <strong key={index} className="bg-primary/30 px-1 py-0.5 rounded">@{part.mention.name}</strong>
                                        }
                                        if (part.type === 'journal' && part.journal) {
                                            return <button key={index} onClick={() => handleJournalClick(part.journal!.id)} className="font-semibold text-accent-foreground hover:underline bg-accent/20 px-1 py-0.5 rounded">#{part.journal.title}</button>
                                        }
                                        return null;
                                    })}
                                </p>
                                <p className={cn("text-xs mt-1", msg.authorId === user?.uid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                  {msg.createdAt instanceof Timestamp ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'sending...'}
                                </p>
                              </div>
                              {msg.authorId === user?.uid && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.photoURL || ''} />
                                  <AvatarFallback>{getInitials(user.displayName || '')}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-2 border-t">
                  <ChatInput
                    userMentionData={userMentionData}
                    journalMentionData={journalMentionData}
                    onSendMessage={handleSendMessage}
                    disabled={!user}
                  />
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-bold font-headline">Welcome to the Community Chat</h2>
                <p className="text-muted-foreground max-w-sm">
                  Select a channel to view the conversation, or create a new one to get started. Your first message in a channel makes you a member.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Channel</DialogTitle>
            <DialogDescription>Start a new conversation for the community.</DialogDescription>
          </DialogHeader>
          <Form {...newChannelForm}>
            <form onSubmit={newChannelForm.handleSubmit(handleCreateChannel)} className="space-y-4">
              <FormField
                control={newChannelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., general" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newChannelForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="What is this channel about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setShowNewChannelDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreatingChannel}>
                  {isCreatingChannel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Channel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedJournal} onOpenChange={(isOpen) => !isOpen && setSelectedJournal(null)}>
        {selectedJournal && (
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{selectedJournal.title}</DialogTitle>
                <DialogDescription>
                    By {selectedJournal.authorName} on{' '}
                    {selectedJournal.createdAt instanceof Timestamp
                    ? selectedJournal.createdAt.toDate().toLocaleDateString()
                    : 'Just now'}{' '}
                    | Mood: <span className="font-semibold text-accent-foreground">{selectedJournal.mood}</span>
                </DialogDescription>
                </DialogHeader>
                <Separator />
                <ScrollArea className="max-h-[60vh] pr-4">
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body py-4">
                    {selectedJournal.content}
                </div>
                </ScrollArea>
            </DialogContent>
        )}
      </Dialog>
    </PageShell>
  );

    