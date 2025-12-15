'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

interface AnalysisData {
  entry: {
    journalEntry: string;
    mood: string;
  };
  suggestions: string;
}

export default function CbtAnalysisPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('cbtAnalysis');
    if (data) {
      setAnalysis(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <PageShell className="items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </PageShell>
    );
  }

  if (!analysis) {
    return (
      <PageShell className="items-center justify-center text-center">
        <h2 className="text-2xl font-bold">No Analysis Found</h2>
        <p className="text-muted-foreground">
          It looks like you haven't created a journal entry yet.
        </p>
        <Button onClick={() => router.push('/dashboard/new-entry')} className="mt-4">
          Create a New Entry
        </Button>
      </PageShell>
    );
  }

  return (
    <div 
      className="relative flex-1 bg-cover bg-center"
      style={{ backgroundImage: "url('/download(1).jpg')" }}
    >
      <div className="absolute inset-0 bg-background/80 -z-10" />
      <PageShell>
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
          <div className="flex items-center gap-4 mb-4">
            <Wand2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-headline">Your CBT Analysis</h1>
              <p className="text-muted-foreground">
                Here are some AI-powered suggestions based on your journal entry.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="font-headline">A Moment of Reflection</span>
                  </CardTitle>
                  <CardDescription>
                    Gentle suggestions based on your entry.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body">
                     {analysis.suggestions}
                   </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                   <CardTitle className="font-headline text-xl">Your Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold">Your Mood</p>
                      <p className="text-muted-foreground">{analysis.entry.mood}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold">Your Thoughts</p>
                      <p className="text-muted-foreground text-sm italic line-clamp-6">"{analysis.entry.journalEntry}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </PageShell>
    </div>
  );
}
