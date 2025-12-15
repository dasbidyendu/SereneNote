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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      bio: 'Lover of quiet mornings, hot tea, and thoughtful reflection.',
    },
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: 'Profile Updated',
      description: 'Your information has been successfully saved.',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Make changes to your profile here. Click save when you're done.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://picsum.photos/seed/avatar_me/100/100" data-ai-hint="person portrait" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change photo</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Click the camera to upload a new photo.</p>
            </div>
          
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
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
