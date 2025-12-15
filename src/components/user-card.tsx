
'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type UserProfile } from '@/firebase/firestore/users';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, UserCheck } from 'lucide-react';

interface UserCardProps {
  profile: UserProfile;
  isFollowing?: boolean;
  onFollowToggle: () => void;
  className?: string;
}

export function UserCard({ 
  profile,
  isFollowing,
  onFollowToggle, 
  className, 
}: UserCardProps) {

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onFollowToggle();
  };

  return (
    <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-full"
    >
      <Card 
        className={cn(
            'h-full bg-card/60 backdrop-blur-sm transition-shadow duration-300 ease-in-out border-border/20 flex flex-col',
            className
        )}
      >
        <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.photoURL} data-ai-hint="person portrait" />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <CardTitle className="font-headline text-lg truncate">{profile.name}</CardTitle>
                    <CardDescription className="truncate">{profile.email}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio || 'No bio yet.'}</p>
        </CardContent>
        <CardFooter>
            <Button size="sm" variant="outline" onClick={handleFollowClick} className="w-full">
                {isFollowing ? (
                    <UserCheck className="h-4 w-4 mr-1 text-primary" />
                ) : (
                    <UserPlus className="h-4 w-4 mr-1" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
