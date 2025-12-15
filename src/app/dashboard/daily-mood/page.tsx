'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { PageShell } from '@/components/page-shell';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { dailyMoods } from '@/lib/mock-data';
import { CalendarDays, Smile, Frown, Meh, HeartPulse, Sparkles } from 'lucide-react';

type Mood = 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Excited';

const moodIcons: Record<Mood, React.ReactNode> = {
    Happy: <Smile className="h-12 w-12 text-yellow-500" />,
    Calm: <HeartPulse className="h-12 w-12 text-blue-500" />,
    Sad: <Frown className="h-12 w-12 text-gray-500" />,
    Anxious: <Meh className="h-12 w-12 text-purple-500" />,
    Excited: <Sparkles className="h-12 w-12 text-pink-500" />,
};

type DailyMoods = {
    [key: string]: { mood: Mood };
};

const typedDailyMoods: DailyMoods = dailyMoods;

export default function DailyMoodPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDay = date ? format(date, 'yyyy-MM-dd') : '';
  const moodForSelectedDay = typedDailyMoods[selectedDay];

  return (
    <PageShell>
      <div className="flex items-center gap-4">
        <CalendarDays className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Daily Mood Calendar</h1>
          <p className="text-muted-foreground">Review your mood for any given day.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-0"
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full',
                table: 'w-full',
                head_row: 'w-full',
                row: 'w-full',
              }}
              modifiers={{
                moodDay: Object.keys(typedDailyMoods).map(day => new Date(day))
              }}
              modifiersStyles={{
                moodDay: { color: 'hsl(var(--primary))', fontWeight: 'bold' }
              }}
            />
        </Card>
        
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
            {date ? (
                moodForSelectedDay ? (
                    <div className="text-center">
                        <p className="text-muted-foreground">{format(date, 'PPP')}</p>
                        <div className="my-4">{moodIcons[moodForSelectedDay.mood]}</div>
                        <p className="text-2xl font-bold font-headline">{moodForSelectedDay.mood}</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-muted-foreground">{format(date, 'PPP')}</p>
                        <p className="mt-4 text-lg">No mood recorded for this day.</p>
                    </div>
                )
            ) : (
                <p>Select a day to see your mood.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
