'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPublicJournalEntries, JournalEntry } from '@/firebase/firestore/journals';
import { Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFirebaseServices } from '@/firebase/client';
import { Timestamp } from 'firebase/firestore';

function CommunityJournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={entry.authorPhotoURL} data-ai-hint="person portrait" />
            <AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{entry.authorName}</CardTitle>
            <CardDescription>
              {entry.createdAt instanceof Timestamp ? entry.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">{entry.title}</h3>
        <p className="text-muted-foreground line-clamp-4">{entry.content}</p>
      </CardContent>
      <CardFooter>
        <span className="text-sm font-medium text-accent">{entry.mood}</span>
      </CardFooter>
    </Card>
  );
}

export default function CommunityPage() {
  const { firestore } = getFirebaseServices();
  const [publicEntries, setPublicEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
            <CommunityJournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <p className="text-lg font-medium text-muted-foreground">No public journals yet.</p>
          <p className="text-sm text-muted-foreground">Be the first to share your journey!</p>
        </div>
      )}
    </PageShell>
  );
}
