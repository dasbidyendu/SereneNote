'use client';
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
import { moodChartData } from '@/lib/mock-data';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

export default function DashboardPage() {
  const chartConfig = {
    mood: {
      label: 'Mood Score',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

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
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodChartData}>
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
                    cursor={{ strokeDasharray: '3 3' }}
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
                  <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={{r: 4, fill: "var(--color-mood)"}} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
