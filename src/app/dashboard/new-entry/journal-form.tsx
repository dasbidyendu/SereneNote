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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cbtStressAlleviationSuggestions } from '@/ai/flows/cbt-stress-alleviation-suggestions';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const moods = ['Happy', 'Calm', 'Sad', 'Anxious', 'Excited'] as const;

const formSchema = z.object({
  journalEntry: z.string().min(10, {
    message: 'Journal entry must be at least 10 characters.',
  }),
  mood: z.enum(moods),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function JournalForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      journalEntry: '',
      mood: 'Calm',
      isPublic: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setSuggestions('');
    try {
      const result = await cbtStressAlleviationSuggestions(values);
      if (result.suggestions) {
        setSuggestions(result.suggestions);
        setIsDialogOpen(true);
      }
      toast({
        title: 'Entry Saved',
        description: 'Your journal entry has been saved.',
      });
      form.reset();
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Could not get suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Save Entry & Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline">A Moment of Reflection</span>
            </DialogTitle>
            <DialogDescription>
              Here are some gentle suggestions based on your entry.
            </DialogDescription>
          </DialogHeader>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body">
            {suggestions}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
