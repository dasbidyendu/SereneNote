'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { addJournalEntry } from '@/firebase/firestore/journals';
import { serverTimestamp } from 'firebase/firestore';

const moods = ['Happy', 'Calm', 'Sad', 'Anxious', 'Excited'] as const;

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  journalEntry: z.string().min(10, {
    message: 'Journal entry must be at least 10 characters.',
  }),
  mood: z.enum(moods),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function JournalForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = getFirebaseServices();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      journalEntry: '',
      mood: 'Calm',
      isPublic: false,
    },
  });

  async function onSubmit(values: FormValues) {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    setIsLoading(true);

    try {
      await addJournalEntry(firestore, {
        title: values.title,
        content: values.journalEntry,
        mood: values.mood,
        isPublic: values.isPublic,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Entry Saved',
        description: 'Your journal entry has been successfully saved.',
      });

      form.reset();
      
      // Redirect to the appropriate journal list
      router.push(values.isPublic ? '/dashboard/public-journals' : '/dashboard/private-journals');

    } catch (error) {
      // Error is now handled by the global error emitter, but we can catch it here if we need to stop loading state
      console.error('Failed to save journal entry:', error);
       toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your journal entry. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="A title for your thoughts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="journalEntry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Thoughts</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell me about your day..."
                      className="resize-none min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select Your Mood</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      {moods.map((mood) => (
                        <FormItem key={mood} className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={mood} id={mood} />
                          </FormControl>
                          <Label htmlFor={mood} className="font-normal">
                            {mood}
                          </Label>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Make Journal Public</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Allow others in the community to see this entry.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Entry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
