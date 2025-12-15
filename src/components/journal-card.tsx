'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { JournalEntry } from '@/firebase/firestore/journals';
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
  Sad: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  Anxious: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  Excited: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
};

const moodGlow: Record<string, string> = {
  Happy: 'hover:shadow-[0_0_20px_theme(colors.yellow.400/40%)]',
  Calm: 'hover:shadow-[0_0_20px_theme(colors.blue.400/40%)]',
  Sad: 'hover:shadow-[0_0_20px_theme(colors.gray.400/40%)]',
  Anxious: 'hover:shadow-[0_0_20px_theme(colors.purple.400/40%)]',
  Excited: 'hover:shadow-[0_0_20px_theme(colors.pink.400/40%)]',
};

export function JournalCard({ entry, onSelect, className, showAuthor = false }: JournalCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative group cursor-pointer h-full',
        moodGlow[entry.mood],
        className
      )}
      onClick={() => onSelect(entry)}
    >
      {/* Shimmering border effect */}
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-75 transition duration-500 blur-lg" />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300" 
           style={{
             mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
             maskComposite: 'exclude',
             WebkitMaskComposite: 'xor',
             padding: '2px',
           }}/>

      <Card className="h-full bg-background/80 backdrop-blur-sm transition-all duration-300 relative z-10 flex flex-col">
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
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', moodColors[entry.mood] || 'bg-secondary')}>
            {entry.mood}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
