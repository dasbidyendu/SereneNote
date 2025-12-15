
'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type UserProfile } from '@/firebase/firestore/users';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, UserCheck, Users, Quote } from 'lucide-react';
import Image from 'next/image';

interface UserCardProps {
  profile: UserProfile;
  isFollowing?: boolean;
  onFollowToggle: () => void;
  className?: string;
  onSelect?: (profile: UserProfile) => void;
}

export function UserCard({ 
  profile,
  isFollowing,
  onFollowToggle, 
  className,
  onSelect
}: UserCardProps) {

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onFollowToggle();
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(profile);
    }
  }

  return (
    <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn("h-full", onSelect && "cursor-pointer")}
        onClick={handleCardClick}
    >
      <Card 
        className={cn(
            'h-full bg-card/60 backdrop-blur-sm transition-shadow duration-300 ease-in-out border-border/20 flex flex-col overflow-hidden',
            className
        )}
      >
        <div className="relative h-24 bg-muted">
            {profile.coverImage && (
                <Image src={profile.coverImage} alt={`${profile.name}'s cover image`} layout="fill" objectFit="cover" />
            )}
            <div className="absolute -bottom-8 left-4">
                 <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage src={profile.photoURL} data-ai-hint="person portrait" />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
            </div>
        </div>
        <CardHeader className="pt-10">
            <CardTitle className="font-headline text-lg truncate">{profile.name}</CardTitle>
            {profile.motto && (
                <CardDescription className="flex items-center gap-2 text-xs italic">
                    <Quote className="w-3 h-3"/>
                    {profile.motto}
                </CardDescription>
            )}
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">{profile.bio || 'No bio yet.'}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Users className="h-4 w-4" />
             <span>{profile.followers?.length || 0} Followers</span>
          </div>
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
