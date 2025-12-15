'use client';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { moodChartData } from '@/lib/mock-data';
import { ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardPage() {
  const chartConfig = {
    mood: {
      label: 'Mood Score',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Good Morning, Jane</h1>
          <p className="text-muted-foreground">Here is your emotional summary for the week.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Analysis</CardTitle>
          <CardDescription>
            A score of 5 is most positive, and 1 is least positive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 5]}
                />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col">
                           <span>{item.payload.tooltip}</span>
                           <span className="text-muted-foreground text-xs">Score: {value}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="mood" fill="var(--color-mood)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
