'use client';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { useUser } from '@/hooks/use-user';
import { useEffect, useState } from 'react';
import { getAllUserJournalEntries, JournalEntry } from '@/firebase/firestore/journals';
import { getFirebaseServices } from '@/firebase/client';
import { subDays, format, isAfter } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type MoodScore = 1 | 2 | 3 | 4 | 5;
type Mood = 'Sad' | 'Anxious' | 'Calm' | 'Happy' | 'Excited';

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

interface ChartData {
  date: string;
  fullDate: string;
  mood: MoodScore | 0;
  tooltip: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = getFirebaseServices();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      getAllUserJournalEntries(firestore, user.uid)
        .then(entries => {
          const processedData = processJournalEntriesForChart(entries);
          setChartData(processedData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, firestore]);

  const processJournalEntriesForChart = (entries: JournalEntry[]): ChartData[] => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
    const entriesByDate: Record<string, JournalEntry> = {};

    entries.forEach(entry => {
      if (entry.createdAt instanceof Timestamp) {
        const entryDate = entry.createdAt.toDate();
        // Only consider entries from the last 7 days
        if (isAfter(entryDate, subDays(new Date(), 7))) {
           const dateString = format(entryDate, 'yyyy-MM-dd');
           // If multiple entries on the same day, keep the latest one
           if (!entriesByDate[dateString] || entry.createdAt.toMillis() > (entriesByDate[dateString].createdAt as Timestamp).toMillis()) {
               entriesByDate[dateString] = entry;
           }
        }
      }
    });

    return last7Days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const dayAbbr = format(date, 'E');
      const entry = entriesByDate[dateString];

      const moodScore = entry ? moodToScore[entry.mood] : 0; // Default to 0 if no entry
      const tooltip = entry ? entry.mood : 'No Entry';
      
      return {
        date: dayAbbr,
        fullDate: date.toISOString(),
        mood: moodScore,
        tooltip: tooltip,
      };
    });
  };

  const chartConfig = {
    mood: {
      label: 'Mood Score',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      if (payload.fullDate && payload.mood > 0) {
        router.push(`/dashboard/daily-mood?date=${payload.fullDate}`);
      }
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Good Morning, {user?.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="text-muted-foreground">Here is your emotional summary for the week.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Analysis</CardTitle>
          <CardDescription>
            A score of 5 is most positive, and 1 is least positive. Click a point to see the entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-video">
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={chartData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    onClick={handleChartClick}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      type="category"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name, item) => (
                            <div className="flex flex-col">
                              <span>{item.payload.tooltip}</span>
                              <span className="text-muted-foreground text-xs">{value === 0 ? 'No Data' : `Score: ${value}`}</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={{r: 4, fill: "var(--color-mood)", cursor: 'pointer'}} activeDot={{ r: 6, cursor: 'pointer' }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
