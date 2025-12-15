'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type JournalEntry } from '@/firebase/firestore/journals';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface JournalCardProps {
  entry: JournalEntry;
  onSelect: (entry: JournalEntry) => void;
  className?: string;
  showAuthor?: boolean;
}

const moodColors: Record<string, string> = {
  Happy: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  Calm: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  Sad: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/30',
  Anxious: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  Excited: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
};

const moodGlow: Record<string, string> = {
    Happy: 'hover:shadow-[0_8px_30px_rgb(250,204,21,0.2)]',
    Calm: 'hover:shadow-[0_8px_30px_rgb(96,165,250,0.2)]',
    Sad: 'hover:shadow-[0_8px_30px_rgb(129,140,248,0.2)]',
    Anxious: 'hover:shadow-[0_8px_30px_rgb(192,132,252,0.2)]',
    Excited: 'hover:shadow-[0_8px_30px_rgb(244,114,182,0.2)]',
  };
  

export function JournalCard({ entry, onSelect, className, showAuthor = false }: JournalCardProps) {
  return (
    <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="cursor-pointer h-full"
        onClick={() => onSelect(entry)}
    >
      <Card 
        className={cn(
            'h-full bg-card/60 backdrop-blur-sm transition-shadow duration-300 ease-in-out border-border/20 flex flex-col',
            moodGlow[entry.mood],
            className
        )}
      >
        <CardHeader>
          {showAuthor && entry.authorName && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={entry.authorPhotoURL} data-ai-hint="person portrait" />
                <AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{entry.authorName}</span>
            </div>
          )}
          <CardTitle className="font-headline text-lg line-clamp-2">{entry.title}</CardTitle>
          <CardDescription>
            {entry.createdAt instanceof Timestamp ? entry.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'}) : 'Just now'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-4">{entry.content}</p>
        </CardContent>
        <CardFooter>
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full border', moodColors[entry.mood] || 'bg-secondary')}>
            {entry.mood}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
