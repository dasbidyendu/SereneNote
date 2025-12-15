import { PageShell } from '@/components/page-shell';
import { JournalForm } from './journal-form';

export default function NewEntryPage() {
  return (
    <div 
      className="relative flex-1 bg-cover bg-center"
      style={{ backgroundImage: "url('/download(1).jpg')" }}
    >
      <div className="absolute inset-0 bg-background/70 -z-10" />
      <PageShell className="bg-transparent">
        <h1 className="text-3xl font-bold font-headline text-shadow-lg">New Journal Entry</h1>
        <JournalForm />
      </PageShell>
    </div>
  );
}
