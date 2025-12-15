
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, startOfMonth, getDay, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUserJournalEntries, JournalEntry } from '@/firebase/firestore/journals';
import { CalendarDays, Heart, BookText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { Timestamp } from 'firebase/firestore';

type Mood = 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Excited';

const moodEmojis: Record<Mood, string> = {
    Happy: '😊',
    Calm: '😌',
    Sad: '😢',
    Anxious: '😟',
    Excited: '🎉',
};

export default function DailyMoodPage() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { firestore } = getFirebaseServices();
  const dateParam = searchParams.get('date');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitialDate = () => {
    if (dateParam) {
        const parsedDate = parseISO(dateParam);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [selectedDate, setSelectedDate] = useState<Date | null>(getInitialDate());

  useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      getAllUserJournalEntries(firestore, user.uid)
        .then(fetchedEntries => {
          setEntries(fetchedEntries);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, firestore]);

  const entryMap = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    entries.forEach(entry => {
      if (entry.createdAt instanceof Timestamp) {
        map.set(format(entry.createdAt.toDate(), 'yyyy-MM-dd'), entry);
      }
    });
    return map;
  }, [entries]);


  useEffect(() => {
    const newDate = getInitialDate();
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateParam]);


  const firstDayOfMonth = startOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
  });

  const startingDayIndex = getDay(firstDayOfMonth);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };
  
  const entryForSelectedDay = selectedDate ? entryMap.get(format(selectedDate, 'yyyy-MM-dd')) : undefined;

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
            <Card className="glass">
              <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                     <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft />
                     </Button>
                     <CardTitle className="text-xl font-headline text-center">
                        {format(currentDate, 'MMMM yyyy')}
                     </CardTitle>
                     <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight />
                     </Button>
                  </div>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="grid grid-cols-7 text-center font-bold text-primary-foreground/80 border-t border-primary/20 bg-primary/10">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2 border-b border-r border-primary/20 last:border-r-0">{day}</div>
                     ))}
                  </div>
                  {loading ? (
                     <div className="h-[400px] flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                     </div>
                  ) : (
                    <div className="grid grid-cols-7 h-[400px]">
                      {Array.from({ length: startingDayIndex }).map((_, index) => (
                        <div key={`empty-${index}`} className="border-b border-r border-primary/20" />
                      ))}
                      {daysInMonth.map(day => {
                         const dayString = format(day, 'yyyy-MM-dd');
                         const entry = entryMap.get(dayString);
                         const isSelected = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === dayString : false;
                        return (
                          <div 
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                              "border-b border-r border-primary/20 p-2 text-sm flex flex-col justify-between cursor-pointer transition-colors hover:bg-primary/20",
                              isSelected ? "bg-primary/30 ring-2 ring-primary" : "",
                              (getDay(day) === 6) && "border-r-0"
                            )}
                          >
                              <span className={cn("self-start", isToday(day) && "bg-primary/80 text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center")}>
                                {format(day, 'd')}
                              </span>
                              <div className="self-end text-2xl">
                                {entry ? (
                                    moodEmojis[entry.mood]
                                ) : (
                                  <Heart className="h-6 w-6 text-primary/30" />
                                )}
                              </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
              </CardContent>
            </Card>
        </div>
        
        <Card className="md:col-span-1 glass">
            {selectedDate ? (
                entryForSelectedDay ? (
                    <>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">
                                {format(selectedDate, 'PPP')}
                            </CardTitle>
                            <CardDescription>
                                Your mood was: <span className="font-semibold text-accent">{entryForSelectedDay.mood}</span>
                             </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Separator />
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
                            <p className="text-muted-foreground">{format(selectedDate, 'PPP')}</p>
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
