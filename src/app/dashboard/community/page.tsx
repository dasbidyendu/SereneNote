'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { getPublicJournalEntries, JournalEntry } from '@/firebase/firestore/journals';
import { Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getFirebaseServices } from '@/firebase/client';
import { JournalCard } from '@/components/journal-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

export default function CommunityPage() {
  const { firestore } = getFirebaseServices();
  const [publicEntries, setPublicEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (firestore) {
      setLoading(true);
      getPublicJournalEntries(firestore)
        .then(entries => {
          setPublicEntries(entries);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [firestore]);

  const handleCloseDialog = () => {
    setSelectedEntry(null);
  };

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
          <Input placeholder="Search for users..." className="pl-9 w-full md:w-64" />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : publicEntries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicEntries.map(entry => (
            <JournalCard 
              key={entry.id} 
              entry={entry} 
              onSelect={setSelectedEntry} 
              showAuthor={true} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <p className="text-lg font-medium text-muted-foreground">No public journals yet.</p>
          <p className="text-sm text-muted-foreground">Be the first to share your journey!</p>
        </div>
      )}

      <Dialog open={!!selectedEntry} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        {selectedEntry && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                By {selectedEntry.authorName} on {selectedEntry.createdAt instanceof Timestamp ? selectedEntry.createdAt.toDate().toLocaleDateString() : 'Just now'} | Mood: <span className="font-semibold text-accent">{selectedEntry.mood}</span>
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body py-4">
                {selectedEntry.content}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </PageShell>
  );
}
