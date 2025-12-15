'use client';

import { useState, useEffect } from 'react';
import { PageShell } from '@/components/page-shell';
import { JournalEntry, getJournalEntries } from '@/firebase/firestore/journals';
import { Globe, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { JournalCard } from '@/components/journal-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';


export default function PublicJournalsPage() {
  const { user } = useUser();
  const { firestore } = getFirebaseServices();
  const { toast } = useToast();
  const [publicEntries, setPublicEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (user && firestore) {
      const fetchEntries = async () => {
        setLoading(true);
        try {
          const entries = await getJournalEntries(firestore, user.uid, true);
          setPublicEntries(entries);
        } catch (error: any) {
          console.error("Failed to fetch public journals:", error);
          toast({
            variant: "destructive",
            title: "Failed to load journals",
            description: "There was an issue fetching public journal entries.",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchEntries();
    }
  }, [user, firestore, toast]);

  const handleCloseDialog = () => {
    setSelectedEntry(null);
  };

  return (
    <PageShell>
       <div className="flex items-center gap-4">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Public Journals</h1>
          <p className="text-muted-foreground">These are your entries visible to the community.</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : publicEntries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicEntries.map(entry => (
            <JournalCard key={entry.id} entry={entry} onSelect={setSelectedEntry} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <p className="text-lg font-medium text-muted-foreground">You have no public journals yet.</p>
          <p className="text-sm text-muted-foreground">Create a new entry and make it public to share it.</p>
        </div>
      )}
      <Dialog open={!!selectedEntry} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        {selectedEntry && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                {selectedEntry.createdAt instanceof Timestamp ? selectedEntry.createdAt.toDate().toLocaleDateString() : 'Just now'} | Mood: <span className="font-semibold text-accent">{selectedEntry.mood}</span>
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
