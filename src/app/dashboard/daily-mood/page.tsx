'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { PageShell } from '@/components/page-shell';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { journalEntries } from '@/lib/mock-data';
import { CalendarDays, Smile, Frown, Meh, HeartPulse, Sparkles, BookText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type Mood = 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Excited';

const moodIcons: Record<Mood, React.ReactNode> = {
    Happy: <Smile className="h-10 w-10 text-yellow-500" />,
    Calm: <HeartPulse className="h-10 w-10 text-blue-500" />,
    Sad: <Frown className="h-10 w-10 text-gray-500" />,
    Anxious: <Meh className="h-10 w-10 text-purple-500" />,
    Excited: <Sparkles className="h-10 w-10 text-pink-500" />,
};

const entryDates = journalEntries.map(entry => new Date(entry.createdAt).setHours(0,0,0,0));

export default function DailyMoodPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDayString = date ? format(date, 'yyyy-MM-dd') : '';
  const entryForSelectedDay = journalEntries.find(
    entry => format(new Date(entry.createdAt), 'yyyy-MM-dd') === selectedDayString
  );

  return (
    <PageShell>
      <div className="flex items-center gap-4">
        <CalendarDays className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Daily Mood Calendar</h1>
          <p className="text-muted-foreground">Review your mood and journal entries for any given day.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-4 bg-card"
              modifiers={{
                entryDay: entryDates.map(d => new Date(d))
              }}
              modifiersStyles={{
                entryDay: { color: 'hsl(var(--primary))', fontWeight: 'bold' }
              }}
            />
        </div>
        
        <Card className="md:col-span-1">
            {date ? (
                entryForSelectedDay ? (
                    <>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">
                                {format(date, 'PPP')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center gap-4">
                            {moodIcons[entryForSelectedDay.mood]}
                            <p className="text-2xl font-bold font-headline">{entryForSelectedDay.mood}</p>
                            <Separator className="my-2" />
                            <div className="text-left w-full">
                                <h4 className="font-semibold mb-2">{entryForSelectedDay.title}</h4>
                                <p className="text-muted-foreground text-sm italic">
                                    "{entryForSelectedDay.content}"
                                </p>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[280px]">
                        <div className="text-center">
                            <p className="text-muted-foreground">{format(date, 'PPP')}</p>
                            <BookText className="h-12 w-12 text-muted-foreground mx-auto my-4" />
                            <p className="mt-2 text-lg">No entry recorded for this day.</p>
                        </div>
                    </CardContent>
                )
            ) : (
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[280px]">
                  <p>Select a day to see your entry.</p>
                </CardContent>
            )}
        </Card>
      </div>
    </PageShell>
  );
}
