import { Feather } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold font-headline", className)}>
      <div className="bg-primary/20 p-2 rounded-lg">
        <Feather className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-foreground">SereneNote</span>
    </Link>
  );
}
