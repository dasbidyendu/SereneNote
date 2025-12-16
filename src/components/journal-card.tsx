
'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type JournalEntry } from '@/firebase/firestore/journals';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, UserCheck, Eye, Heart } from 'lucide-react';
import type { User } from 'firebase/auth';

interface JournalCardProps {
  entry: JournalEntry;
  onSelect: (entry: JournalEntry) => void;
  className?: string;
  showAuthor?: boolean;
  user?: User | null;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
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
  

export function JournalCard({ 
  entry, 
  onSelect, 
  className, 
  showAuthor = false,
  user,
  isFollowing,
  onFollowToggle 
}: JournalCardProps) {

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    onFollowToggle?.();
  };

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
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={entry.authorPhotoURL} data-ai-hint="person portrait" />
                  <AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{entry.authorName}</span>
              </div>
              {user && user.uid !== entry.authorId && onFollowToggle && (
                <Button size="sm" variant="ghost" onClick={handleFollowClick}>
                  {isFollowing ? (
                     <UserCheck className="h-4 w-4 mr-1 text-primary" />
                  ) : (
                     <UserPlus className="h-4 w-4 mr-1" />
                  )}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
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
        <CardFooter className="justify-between">
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full border', moodColors[entry.mood] || 'bg-secondary')}>
            {entry.mood}
          </span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {entry.likeCount || 0}
             </div>
             <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {entry.readCount || 0}
             </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
