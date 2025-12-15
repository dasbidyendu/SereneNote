import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { journalEntries, JournalEntry } from '@/lib/mock-data';
import { Globe } from 'lucide-react';

function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
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

export default function PublicJournalsPage() {
  const publicEntries = journalEntries.filter(entry => entry.isPublic && entry.author.name === 'Jane Smith');

  return (
    <PageShell>
       <div className="flex items-center gap-4">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Public Journals</h1>
          <p className="text-muted-foreground">These are your entries visible to the community.</p>
        </div>
      </div>
      {publicEntries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicEntries.map(entry => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <p className="text-lg font-medium text-muted-foreground">You have no public journals yet.</p>
          <p className="text-sm text-muted-foreground">Create a new entry and make it public to share it.</p>
        </div>
      )}
    </PageShell>
  );
}
