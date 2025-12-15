
'use client';

import { useEffect, useState, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Timestamp, arrayRemove, arrayUnion, increment } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, getUserProfile } from '@/firebase/firestore/users';
import { UserProfile } from '@/firebase/firestore/users';
import { useToast } from '@/hooks/use-toast';

export default function CommunityPage() {
  const { firestore } = getFirebaseServices();
  const { user } = useUser();
  const { toast } = useToast();
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (firestore) {
      setLoading(true);
      getPublicJournalEntries(firestore)
        .then(entries => {
          setAllEntries(entries);
          setFilteredEntries(entries);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [firestore]);

  useEffect(() => {
    if (user && firestore) {
      getUserProfile(firestore, user.uid).then(setUserProfile);
    }
  }, [user, firestore]);

  // Fuzzy Search Logic
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEntries(allEntries);
      return;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = allEntries.filter(entry => {
      const titleMatch = entry.title.toLowerCase().includes(lowercasedTerm);
      const contentMatch = entry.content.toLowerCase().includes(lowercasedTerm);
      const authorMatch = entry.authorName.toLowerCase().includes(lowercasedTerm);
      return titleMatch || contentMatch || authorMatch;
    });
    setFilteredEntries(results);
  }, [searchTerm, allEntries]);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    if (firestore && entry.id) {
      // Increment read count
      updateJournalEntry(firestore, entry.id, { readCount: increment(1) });
      // Optimistically update the UI
      setAllEntries(prev => prev.map(e => e.id === entry.id ? {...e, readCount: (e.readCount || 0) + 1} : e));
    }
  };

  const handleCloseDialog = () => {
    setSelectedEntry(null);
  };

  const handleHeartClick = async () => {
    if (!selectedEntry || !user || !firestore || !selectedEntry.id) return;
    
    const entryId = selectedEntry.id;
    const userId = user.uid;

    const isLiked = selectedEntry.likes?.includes(userId);
    const newLikes = isLiked ? arrayRemove(userId) : arrayUnion(userId);
    const newLikeCount = isLiked ? increment(-1) : increment(1);

    // Optimistically update the UI
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
    
    setAllEntries(prev => prev.map(e => e.id === entryId ? {
      ...e,
      likes: isLiked ? (e.likes || []).filter(id => id !== userId) : [...(e.likes || []), userId],
      likeCount: (e.likeCount || 0) + (isLiked ? -1 : 1)
    } : e));

    // Update Firestore
    await updateJournalEntry(firestore, entryId, {
      likes: newLikes,
      likeCount: newLikeCount,
    });
  };
  
  const handleFollow = async (authorId: string) => {
    if (!user || !firestore) return;
    await followUser(firestore, user.uid, authorId);
    setUserProfile(prev => prev ? {...prev, following: [...(prev.following || []), authorId]} : null);
    toast({ title: 'User Followed' });
  };
  
  const handleUnfollow = async (authorId: string) => {
    if (!user || !firestore) return;
    await unfollowUser(firestore, user.uid, authorId);
    setUserProfile(prev => prev ? {...prev, following: (prev.following || []).filter(id => id !== authorId)} : null);
     toast({ title: 'User Unfollowed' });
  };
  
  const isFollowing = (authorId: string) => userProfile?.following?.includes(authorId);

  return (
    <PageShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">Community Space</h1>
            <p className="text-muted-foreground">Connect and share with others on their journey.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search journals, content, or users..."
            className="pl-9 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map(entry => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onSelect={handleSelectEntry}
              showAuthor={true}
              user={user}
              isFollowing={isFollowing(entry.authorId)}
              onFollowToggle={() => isFollowing(entry.authorId) ? handleUnfollow(entry.authorId) : handleFollow(entry.authorId)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <p className="text-lg font-medium text-muted-foreground">
            {searchTerm ? 'No results found.' : 'No public journals yet.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Try a different search term.' : 'Be the first to share your journey!'}
          </p>
        </div>
      )}

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
                | Mood: <span className="font-semibold text-accent">{selectedEntry.mood}</span>
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body py-4">
              {selectedEntry.content}
            </div>
            <DialogFooter className="justify-between sm:justify-between w-full">
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
                    className={`h-5 w-5 ${
                      selectedEntry.likes?.includes(user.uid)
                        ? 'text-red-500 fill-current'
                        : 'text-muted-foreground'
                    }`}
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
