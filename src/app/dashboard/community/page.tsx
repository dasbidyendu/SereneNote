import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { journalEntries, JournalEntry } from '@/lib/mock-data';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function CommunityJournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={entry.author.avatarUrl} data-ai-hint="person portrait" />
            <AvatarFallback>{entry.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{entry.author.name}</CardTitle>
            <CardDescription>{new Date(entry.createdAt).toLocaleDateString()}</CardDescription>
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
  const publicEntries = journalEntries.filter(entry => entry.isPublic);

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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publicEntries.map(entry => (
          <CommunityJournalCard key={entry.id} entry={entry} />
        ))}
      </div>
    </PageShell>
  );
}
