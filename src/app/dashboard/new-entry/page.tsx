import { PageShell } from '@/components/page-shell';
import { JournalForm } from './journal-form';
import Image from 'next/image';

export default function NewEntryPage() {
  return (
    <div className="relative flex-1">
       <Image
        src="/download(1).jpg"
        alt="Journal background"
        fill
        className="object-cover opacity-30 -z-10"
        data-ai-hint="background texture"
      />
      <PageShell className="bg-transparent">
        <h1 className="text-3xl font-bold font-headline text-shadow-lg">New Journal Entry</h1>
        <JournalForm />
      </PageShell>
    </div>
  );
}
