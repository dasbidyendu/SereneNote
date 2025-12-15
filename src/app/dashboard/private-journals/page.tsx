'use client';

import { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { journalEntries, JournalEntry } from '@/lib/mock-data';
import { Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

function JournalCard({ entry, onSelect }: { entry: JournalEntry, onSelect: (entry: JournalEntry) => void }) {
  return (
    <Card onClick={() => onSelect(entry)} className="cursor-pointer hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle>{entry.title}</CardTitle>
        <CardDescription>{new Date(entry.createdAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{entry.content}</p>
      </CardContent>
      <CardFooter>
        <span className="text-sm font-medium text-accent">{entry.mood}</span>
      </CardFooter>
    </Card>
  );
}

export default function PrivateJournalsPage() {
  const privateEntries = journalEntries.filter(entry => !entry.isPublic);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleCloseDialog = () => {
    setSelectedEntry(null);
  };

  return (
    <PageShell>
      <div className="flex items-center gap-4">
        <Lock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Private Journals</h1>
          <p className="text-muted-foreground">Your personal space for reflection. Only visible to you.</p>
        </div>
      </div>
      {privateEntries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {privateEntries.map(entry => (
            <JournalCard key={entry.id} entry={entry} onSelect={setSelectedEntry} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <p className="text-lg font-medium text-muted-foreground">You have no private journals yet.</p>
          <p className="text-sm text-muted-foreground">Create a new entry and keep it private to see it here.</p>
        </div>
      )}

      <Dialog open={!!selectedEntry} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        {selectedEntry && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                {new Date(selectedEntry.createdAt).toLocaleDateString()} | Mood: <span className="font-semibold text-accent">{selectedEntry.mood}</span>
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
