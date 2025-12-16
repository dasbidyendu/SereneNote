
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Users, Image as ImageIcon } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useEffect, useRef, useState } from 'react';
import { getFirebaseServices } from '@/firebase/client';
import { setUserProfile, UserProfile, getUserProfile } from '@/firebase/firestore/users';
import { Separator } from '@/components/ui/separator';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import Image from 'next/image';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  motto: z.string().max(50).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const getAvatarStorageKey = (uid: string) => `serene-note-avatar-${uid}`;
const getCoverStorageKey = (uid: string) => `serene-note-cover-${uid}`;

export function ProfileForm() {
  const { toast } = useToast();
  const { user, profile, loading, setProfile } = useUser();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const { auth: a, firestore: fs } = getFirebaseServices();
      if(a && fs) {
        setAuth(a);
        setFirestore(fs);
      }
      
      // Load images from local storage on mount
      const storedAvatar = localStorage.getItem(getAvatarStorageKey(user.uid));
      const storedCover = localStorage.getItem(getCoverStorageKey(user.uid));
      if (storedAvatar) setAvatarPreview(storedAvatar);
      if (storedCover) setCoverPreview(storedCover);
    }
  }, [user]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      motto: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (user && profile) {
      form.reset({
        name: profile.name || user.displayName || '',
        email: user.email || '',
        bio: profile.bio || '',
        motto: profile.motto || '',
      });
      // Prioritize local storage images, then fallback to profile
      if (!avatarPreview) setAvatarPreview(profile.photoURL || null);
      if (!coverPreview) setCoverPreview(profile.coverImage || null);
    }
  }, [user, profile, form, avatarPreview, coverPreview]);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!auth?.currentUser || !firestore) return;
    setIsSaving(true);

    try {
      // Fetch the existing profile to preserve followers/following
      const existingProfile = await getUserProfile(firestore, auth.currentUser.uid);

      const updatedProfileData: Partial<UserProfile> = {
        name: data.name,
        email: data.email,
        bio: data.bio,
        motto: data.motto,
        // Preserve existing social graph
        followers: existingProfile?.followers || [],
        following: existingProfile?.following || [],
      };
      
      // The image URLs are now saved to localStorage, but we also save them to Firestore
      // so they can be seen by other users.
      if (avatarPreview) updatedProfileData.photoURL = avatarPreview;
      if (coverPreview) updatedProfileData.coverImage = coverPreview;
      
      await setUserProfile(firestore, auth.currentUser.uid, updatedProfileData);
      
      // Update the user context with the new profile data
      setProfile(prev => ({ 
          ...prev, 
          ...updatedProfileData,
      } as UserProfile));
      
      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully saved.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

 const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: 'avatar' | 'cover'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user || !firestore) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const storageKey = imageType === 'avatar' ? getAvatarStorageKey(user.uid) : getCoverStorageKey(user.uid);
        localStorage.setItem(storageKey, dataUrl);
        if(imageType === 'avatar') {
            setAvatarPreview(dataUrl);
        } else {
            setCoverPreview(dataUrl);
        }
        
        toast({ title: 'Image Updated!', description: 'Your new image has been set.'});

        // Also save this to Firestore immediately
        const dataToUpdate: Partial<UserProfile> = {};
        if (imageType === 'avatar') {
            dataToUpdate.photoURL = dataUrl;
        } else {
            dataToUpdate.coverImage = dataUrl;
        }
        await setUserProfile(firestore, user.uid, dataToUpdate);

      } catch (e) {
        console.error("Error saving image to localStorage", e);
        toast({
            variant: "destructive",
            title: "Image too large",
            description: "Could not save image. It may be too large for browser storage."
        })
      }
    };
  };

  if (loading || !profile) {
    return <Card><CardContent className="p-6 flex items-center justify-center h-96"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></CardContent></Card>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Cover Image Section */}
            <div className="relative h-48 bg-muted group">
              {coverPreview && (
                <Image
                  src={coverPreview}
                  alt="Cover image"
                  fill
                  style={{objectFit: 'cover'}}
                  className="rounded-t-lg"
                />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverInputRef.current?.click()}
                  className="bg-white/80 hover:bg-white text-black"
                >
                  <ImageIcon className="mr-2 h-4 w-4" /> Change Cover
                </Button>
              </div>
              <input 
                type="file" 
                ref={coverInputRef} 
                onChange={(e) => handleImageFileChange(e, 'cover')} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            {/* Avatar and Stats Section */}
            <div className="relative px-6 flex items-end -mt-12">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-background cursor-pointer group/avatar" onClick={() => avatarInputRef.current?.click()}>
                    <AvatarImage src={avatarPreview || ''} data-ai-hint="person portrait" />
                    <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </Avatar>
                  <input type="file" ref={avatarInputRef} onChange={(e) => handleImageFileChange(e, 'avatar')} accept="image/*" className="hidden" />
                </div>
                 <div className="flex-1 flex justify-start gap-6 text-center sm:text-left pb-1 ml-4">
                  <div className="flex flex-col items-center">
                     <span className="text-2xl font-bold">{profile?.followers?.length || 0}</span>
                     <span className="text-sm text-muted-foreground">Followers</span>
                  </div>
                   <div className="flex flex-col items-center">
                     <span className="text-2xl font-bold">{profile?.following?.length || 0}</span>
                     <span className="text-sm text-muted-foreground">Following</span>
                  </div>
                </div>
            </div>
            
            <Separator className="mt-6"/>

            {/* Form Fields Section */}
            <div className="p-6 space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motto</FormLabel>
                      <FormControl>
                        <Input placeholder="A short, catchy phrase about you" {...field} />
                      </FormControl>
                       <FormDescription>Your personal motto, shown on your community card.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} readOnly disabled />
                      </FormControl>
                      <FormDescription>Your email address cannot be changed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about yourself"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of yourself to be displayed on your public profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
