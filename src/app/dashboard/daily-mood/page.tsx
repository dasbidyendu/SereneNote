
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, startOfMonth, getDay, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUserJournalEntries, JournalEntry } from '@/firebase/firestore/journals';
import { CalendarDays, BookText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { Timestamp, type Firestore } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';

type Mood = 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Excited';
type MoodScore = 1 | 2 | 3 | 4 | 5;

const moodToScore: Record<Mood, MoodScore> = {
  'Sad': 1,
  'Anxious': 2,
  'Calm': 3,
  'Happy': 4,
  'Excited': 5,
};

const scoreToMood: Record<MoodScore, Mood> = {
  1: 'Sad',
  2: 'Anxious',
  3: 'Calm',
  4: 'Happy',
  5: 'Excited',
};

const moodEmojis: Record<Mood, string> = {
    Happy: '😊',
    Calm: '😌',
    Sad: '😢',
    Anxious: '😟',
    Excited: '🎉',
};

interface DayData {
    entries: JournalEntry[];
    averageMood: Mood;
}

export default function DailyMoodPage() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [firestore, setFirestore] = useState<Firestore | null>(null);
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
    if (user) {
      const { firestore: fs } = getFirebaseServices();
      setFirestore(fs);
    }
  }, [user]);

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
    const map = new Map<string, DayData>();
    const entriesByDay = new Map<string, JournalEntry[]>();

    // Group entries by day
    entries.forEach(entry => {
      if (entry.createdAt instanceof Timestamp) {
        const dayString = format(entry.createdAt.toDate(), 'yyyy-MM-dd');
        if (!entriesByDay.has(dayString)) {
          entriesByDay.set(dayString, []);
        }
        entriesByDay.get(dayString)?.push(entry);
      }
    });

    // Calculate average mood for each day
    entriesByDay.forEach((dayEntries, dayString) => {
      const totalScore = dayEntries.reduce((acc, entry) => acc + moodToScore[entry.mood], 0);
      const averageScore = Math.round(totalScore / dayEntries.length) as MoodScore;
      const averageMood = scoreToMood[averageScore];
      
      map.set(dayString, {
        entries: dayEntries,
        averageMood: averageMood,
      });
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
  
  const dayDataForSelectedDay = selectedDate ? entryMap.get(format(selectedDate, 'yyyy-MM-dd')) : undefined;

  return (
    <PageShell>
      <div className="flex items-center gap-4 mb-4">
        <CalendarDays className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Daily Mood Calendar</h1>
          <p className="text-muted-foreground">Review your average mood and all journal entries for any given day.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 items-start h-[calc(100vh-12rem)]">
        <div className="md:col-span-2">
            <Card className="glass h-full flex flex-col">
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
              <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="grid grid-cols-7 text-center font-bold text-sm text-muted-foreground border-t">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2 border-b border-r last:border-r-0">{day}</div>
                     ))}
                  </div>
                  {loading ? (
                     <div className="flex-grow flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                     </div>
                  ) : (
                    <div className="grid grid-cols-7 flex-grow">
                      {Array.from({ length: startingDayIndex }).map((_, index) => (
                        <div key={`empty-${index}`} className="border-b border-r" />
                      ))}
                      {daysInMonth.map(day => {
                         const dayString = format(day, 'yyyy-MM-dd');
                         const dayData = entryMap.get(dayString);
                         const isSelected = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === dayString : false;
                        return (
                          <div 
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                              "border-b border-r p-2 text-sm flex flex-col justify-between cursor-pointer transition-colors hover:bg-muted/50",
                              isSelected ? "bg-primary/20 ring-2 ring-primary z-10" : "",
                              (getDay(day) % 7 === 6) && "border-r-0"
                            )}
                          >
                              <span className={cn(
                                  "self-start font-semibold", 
                                  isToday(day) && "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center",
                                  isSelected ? "text-primary-foreground" : "text-foreground"
                               )}>
                                {format(day, 'd')}
                              </span>
                              <div className="self-end text-2xl mt-auto pt-2">
                                {dayData ? (
                                    moodEmojis[dayData.averageMood]
                                ) : (
                                  <span className="text-muted-foreground/20 text-base">●</span>
                                )}
                              </div>
                          </div>
                        )
                      })}
                       {/* Fill remaining cells if the month doesn't end on a Saturday */}
                       {Array.from({ length: (7 - (daysInMonth.length + startingDayIndex) % 7) % 7 }).map((_, index) => (
                          <div key={`empty-end-${index}`} className="border-b border-r" />
                       ))}
                    </div>
                  )}
              </CardContent>
            </Card>
        </div>
        
        <Card className="md:col-span-1 glass h-full">
            <ScrollArea className="h-full">
            {selectedDate ? (
                dayDataForSelectedDay ? (
                    <>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">
                                {format(selectedDate, 'PPP')}
                            </CardTitle>
                            <CardDescription>
                                Your average mood was: <span className="font-semibold text-accent-foreground">{dayDataForSelectedDay.averageMood}</span>
                             </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 p-6 pt-0">
                            {dayDataForSelectedDay.entries.map((entry, index) => (
                                <div key={entry.id || index}>
                                    <Separator className="mb-4" />
                                    <div className="text-left w-full">
                                        <h4 className="font-semibold">{entry.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-2">Mood: {entry.mood}</p>
                                        <p className="text-muted-foreground text-sm line-clamp-4">
                                            {entry.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </>
                ) : (
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="text-center">
                            <p className="font-semibold">{format(selectedDate, 'PPP')}</p>
                            <BookText className="h-12 w-12 text-muted-foreground mx-auto my-4" />
                            <p className="mt-2 text-lg text-muted-foreground">No entry recorded for this day.</p>
                        </div>
                    </CardContent>
                )
            ) : (
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">Select a day to see your entries.</p>
                </CardContent>
            )}
            </ScrollArea>
        </Card>
      </div>
    </PageShell>
  );
}

    