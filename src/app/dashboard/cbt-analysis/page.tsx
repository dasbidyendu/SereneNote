'use client';

import { useEffect, useState, useMemo } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, BookOpenCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { getAllUserJournalEntries, JournalEntry } from '@/firebase/firestore/journals';
import { cbtStressAlleviationSuggestions } from '@/ai/flows/cbt-stress-alleviation-suggestions';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnalysisData {
  entry: {
    journalEntry: string;
    mood: string;
    title: string;
  };
  suggestions: string;
}

export default function CbtAnalysisPage() {
  const { user } = useUser();
  const { firestore } = getFirebaseServices();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user && firestore) {
      setLoadingEntries(true);
      getAllUserJournalEntries(firestore, user.uid)
        .then(setEntries)
        .catch(console.error)
        .finally(() => setLoadingEntries(false));
    }
  }, [user, firestore]);

  const handleSelectEntry = async (entry: JournalEntry) => {
    if (selectedEntry?.id === entry.id && analysis) {
      // If the same entry is clicked again, just show its existing analysis
      setSelectedEntry(entry);
      return;
    }
    
    setSelectedEntry(entry);
    setAnalysis(null);
    setIsAnalyzing(true);
    try {
      const result = await cbtStressAlleviationSuggestions({
        journalEntry: entry.content,
        mood: entry.mood,
      });
      setAnalysis({
        entry: {
          journalEntry: entry.content,
          mood: entry.mood,
          title: entry.title,
        },
        suggestions: result.suggestions,
      });
    } catch (error) {
      console.error('Failed to get analysis', error);
      // Optionally show a toast message here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sortedEntries = useMemo(() => {
    return entries.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });
  }, [entries]);

  return (
      <PageShell>
        <div className="flex items-center gap-4 mb-4">
            <Wand2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-headline">Your CBT Analysis</h1>
              <p className="text-muted-foreground">
                Select a journal entry to get AI-powered, CBT-based suggestions.
              </p>
            </div>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          <div className="md:col-span-1 lg:col-span-1 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5" />
                  Your Journal Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {loadingEntries ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : sortedEntries.length > 0 ? (
                    <div className="space-y-2">
                      {sortedEntries.map(entry => (
                        <button 
                          key={entry.id} 
                          onClick={() => handleSelectEntry(entry)}
                          className={cn(
                            "w-full text-left p-3 rounded-md border transition-colors",
                            selectedEntry?.id === entry.id 
                              ? "bg-primary/20 border-primary/50" 
                              : "hover:bg-muted/50 border-transparent"
                          )}
                        >
                          <p className="font-semibold text-sm line-clamp-1">{entry.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.createdAt instanceof Timestamp ? entry.createdAt.toDate().toLocaleDateString() : 'New'} - {entry.mood}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">You have no journal entries to analyze yet.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2 lg:col-span-3 h-full">
             <Card className="h-full">
               <AnimatePresence mode="wait">
                {isAnalyzing ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-full"
                    >
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Brewing insights for you...</p>
                    </motion.div>
                ) : analysis && selectedEntry ? (
                    <motion.div 
                        key="analysis"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid md:grid-cols-3 gap-8 p-6 h-full"
                    >
                         <div className="md:col-span-2 h-full">
                           <h3 className="font-headline text-xl mb-2 flex items-center gap-2">
                             <Sparkles className="h-6 w-6 text-primary" />
                             A Moment of Reflection
                           </h3>
                           <p className="text-sm text-muted-foreground mb-4">Gentle suggestions based on your entry.</p>
                           <ScrollArea className="h-[calc(100%-6rem)] pr-4">
                             <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-body">
                               {analysis.suggestions}
                             </div>
                           </ScrollArea>
                         </div>
                         <div className="md:col-span-1 h-full bg-muted/50 p-4 rounded-lg">
                           <h3 className="font-headline text-lg mb-2">Your Original Entry</h3>
                            <ScrollArea className="h-[calc(100%-3rem)] pr-4">
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-semibold">{analysis.entry.title}</p>
                                  <p className="text-xs text-muted-foreground">Mood: {analysis.entry.mood}</p>
                                </div>
                                <Separator />
                                <div>
                                  <p className="text-sm text-muted-foreground italic">"{analysis.entry.journalEntry}"</p>
                                </div>
                              </div>
                            </ScrollArea>
                         </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                    >
                        <Wand2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h2 className="text-xl font-bold">Ready for Analysis</h2>
                        <p className="text-muted-foreground">
                            Please select a journal entry from the list to begin.
                        </p>
                    </motion.div>
                )}
                </AnimatePresence>
             </Card>
          </div>
        </div>
      </PageShell>
  );
}
