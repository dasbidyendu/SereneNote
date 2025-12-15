'use client';

import { useEffect, useState, useRef } from 'react';
import { PageShell } from '@/components/page-shell';
import {
  getPublicJournalEntries,
  JournalEntry,
  updateJournalEntry,
} from '@/firebase/firestore/journals';
import { Users, Search, Loader2, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getFirebaseServices } from '@/firebase/client';
import { JournalCard } from '@/components/journal-card';
import { UserCard } from '@/components/user-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timestamp, arrayRemove, arrayUnion, increment } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, getUserProfile, getAllUsers, UserProfile } from '@/firebase/firestore/users';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CommunityPage() {
  const { firestore } = getFirebaseServices();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [followedUsers, setFollowedUsers] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (firestore) {
      setLoading(true);
      Promise.all([
        getPublicJournalEntries(firestore),
        getAllUsers(firestore)
      ]).then(([entries, users]) => {
          const sortedEntries = entries.sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
          });
          setAllEntries(sortedEntries);
          setFilteredEntries(sortedEntries);
          setAllUsers(users);
          setFilteredUsers([]);
          setLoading(false);
        })
        .catch((error) => {
            console.error("Failed to fetch initial data:", error);
            setLoading(false)
        });
    }
  }, [firestore]);

  useEffect(() => {
    if (user && firestore) {
      getUserProfile(firestore, user.uid).then(setUserProfile);
    }
  }, [user, firestore]);
  
  useEffect(() => {
    if (userProfile && allUsers.length > 0) {
      const followed = allUsers.filter(u => userProfile.following?.includes(u.id!));
      setFollowedUsers(followed);
    }
  }, [userProfile, allUsers]);

  // Fuzzy Search Logic
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    
    if (!lowercasedTerm) {
      setFilteredEntries(allEntries);
      setFilteredUsers([]);
      return;
    }

    const entryResults = allEntries.filter(entry => 
      entry.title.toLowerCase().includes(lowercasedTerm) ||
      entry.content.toLowerCase().includes(lowercasedTerm) ||
      entry.authorName.toLowerCase().includes(lowercasedTerm)
    );
    
    let userResults: UserProfile[] = [];
    if (user) {
        userResults = allUsers.filter(u => {
            if (u.id === user.uid) return false;
            const nameMatch = u.name.toLowerCase().includes(lowercasedTerm);
            const bioMatch = u.bio ? u.bio.toLowerCase().includes(lowercasedTerm) : false;
            return nameMatch || bioMatch;
        });
    }
    setFilteredEntries(entryResults);
    setFilteredUsers(userResults);

  }, [searchTerm, allEntries, allUsers, user]);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    if (firestore && entry.id) {
      updateJournalEntry(firestore, entry.id, { readCount: increment(1) });
      setAllEntries(prev => prev.map(e => e.id === entry.id ? {...e, readCount: (e.readCount || 0) + 1} : e));
    }
  };

  const handleCloseDialog = () => setSelectedEntry(null);

  const handleHeartClick = async () => {
    if (!selectedEntry || !user || !firestore || !selectedEntry.id) return;
    
    const entryId = selectedEntry.id;
    const userId = user.uid;
    const isLiked = selectedEntry.likes?.includes(userId);
    const newLikes = isLiked ? arrayRemove(userId) : arrayUnion(userId);
    const newLikeCount = isLiked ? increment(-1) : increment(1);

    // Optimistic update for the dialog
    setSelectedEntry(prev => {
      if (!prev) return null;
      const currentLikes = prev.likes || [];
      const updatedLikes = isLiked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId];
      return {
        ...prev,
        likes: updatedLikes,
        likeCount: (prev.likeCount || 0) + (isLiked ? -1 : 1),
      };
    });
    
    // Optimistic update for the card in the feed
    setAllEntries(prev => prev.map(e => {
        if (e.id !== entryId) return e;
        const currentLikes = e.likes || [];
        const updatedLikes = isLiked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId];
        return {
            ...e,
            likes: updatedLikes,
            likeCount: (e.likeCount || 0) + (isLiked ? -1 : 1),
        };
    }));

    await updateJournalEntry(firestore, entryId, {
      likes: newLikes,
      likeCount: newLikeCount,
    });
  };
  
  const handleFollowToggle = async (targetUserId: string) => {
    if (!user || !firestore) return;
    const currentlyFollowing = isFollowing(targetUserId);

    // Optimistic update
    setUserProfile(prev => {
      if (!prev) return null;
      const currentFollowing = prev.following || [];
      const newFollowing = currentlyFollowing 
        ? currentFollowing.filter(id => id !== targetUserId)
        : [...currentFollowing, targetUserId];
      return { ...prev, following: newFollowing };
    });
    
    if (currentlyFollowing) {
      await unfollowUser(firestore, user.uid, targetUserId);
      toast({ title: 'User Unfollowed' });
    } else {
      await followUser(firestore, user.uid, targetUserId);
      toast({ title: 'User Followed' });
    }
  };
  
  const isFollowing = (authorId: string) => userProfile?.following?.includes(authorId);

  const showSearchResults = isSearchFocused && searchTerm.length > 0;
  const hasResults = filteredUsers.length > 0 || filteredEntries.length > 0;

  return (
    <PageShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">Community Space</h1>
            <p className="text-muted-foreground">Connect and share with others on their journey.</p>
          </div>
        </div>
        <div className="relative z-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search journals or users..."
            className="pl-9 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
        </div>
      </div>

      <AnimatePresence>
        {showSearchResults && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => {
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-28 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl z-50"
            >
              <Card className="max-h-[70vh] flex flex-col">
                <CardHeader>
                  <CardTitle>Search Results for "{searchTerm}"</CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <ScrollArea className="h-[55vh]">
                    {hasResults ? (
                       <div className="space-y-6 p-1">
                        {filteredUsers.length > 0 && (
                          <div className="space-y-4">
                            <h2 className="text-xl font-bold font-headline px-2">Users</h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {filteredUsers.map(profile => (
                                <UserCard
                                  key={profile.id}
                                  profile={profile}
                                  isFollowing={isFollowing(profile.id!)}
                                  onFollowToggle={() => handleFollowToggle(profile.id!)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {filteredEntries.length > 0 && (
                           <div className="space-y-4">
                             <h2 className="text-xl font-bold font-headline px-2">Journals</h2>
                             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredEntries.map(entry => (
                                    <JournalCard
                                      key={entry.id}
                                      entry={entry}
                                      onSelect={handleSelectEntry}
                                      showAuthor={true}
                                      user={user}
                                      isFollowing={isFollowing(entry.authorId)}
                                      onFollowToggle={() => handleFollowToggle(entry.authorId)}
                                    />
                                ))}
                             </div>
                           </div>
                        )}
                       </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                        <p className="text-lg font-medium text-muted-foreground">No results found.</p>
                        <p className="text-sm text-muted-foreground">Try a different search term.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={cn("transition-opacity", showSearchResults && 'pointer-events-none opacity-0')}>
        <Tabs defaultValue="feed">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : allEntries.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allEntries.map(entry => (
                      <JournalCard
                      key={entry.id}
                      entry={entry}
                      onSelect={handleSelectEntry}
                      showAuthor={true}
                      user={user}
                      isFollowing={isFollowing(entry.authorId)}
                      onFollowToggle={() => handleFollowToggle(entry.authorId)}
                      />
                  ))}
              </div>
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64 mt-6">
                  <p className="text-lg font-medium text-muted-foreground">No public journals yet.</p>
                  <p className="text-sm text-muted-foreground">Be the first to share your journey!</p>
                </div>
              )
            }
          </TabsContent>
          <TabsContent value="following" className="mt-6">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : followedUsers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {followedUsers.map(profile => (
                      <UserCard
                        key={profile.id}
                        profile={profile}
                        isFollowing={isFollowing(profile.id!)}
                        onFollowToggle={() => handleFollowToggle(profile.id!)}
                      />
                  ))}
                </div>
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64 mt-6">
                  <p className="text-lg font-medium text-muted-foreground">You are not following anyone yet.</p>
                  <p className="text-sm text-muted-foreground">Find users to follow in the community feed or via search.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={isOpen => !isOpen && handleCloseDialog()}>
        {selectedEntry && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                By {selectedEntry.authorName} on{' '}
                {selectedEntry.createdAt instanceof Timestamp
                  ? selectedEntry.createdAt.toDate().toLocaleDateString()
                  : 'Just now'}{' '}
                | Mood: <span className="font-semibold text-accent-foreground">{selectedEntry.mood}</span>
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body py-4">
                {selectedEntry.content}
              </div>
            </ScrollArea>
            <DialogFooter className="justify-between sm:justify-between w-full border-t pt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                   <Heart className="h-4 w-4" /> {selectedEntry.likeCount || 0}
                </div>
                <div className="flex items-center gap-1">
                  <span>Reads: {selectedEntry.readCount || 0}</span>
                </div>
              </div>
              {user && user.uid !== selectedEntry.authorId && (
                <Button variant="ghost" onClick={handleHeartClick} size="icon">
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      selectedEntry.likes?.includes(user.uid)
                        ? 'text-red-500 fill-current'
                        : 'text-muted-foreground'
                    )}
                  />
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </PageShell>
  );
}

    