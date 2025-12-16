import { PageShell } from '@/components/page-shell';
import { JournalForm } from './journal-form';

export default function NewEntryPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold font-headline text-shadow-lg">New Journal Entry</h1>
      <JournalForm />
    </PageShell>
  );
}
