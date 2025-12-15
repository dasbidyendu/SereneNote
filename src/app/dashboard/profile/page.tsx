import { PageShell } from '@/components/page-shell';
import { User } from 'lucide-react';
import { ProfileForm } from './profile-form';

export default function ProfilePage() {
  return (
    <PageShell>
      <div className="flex items-center gap-4">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        </div>
      </div>
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </PageShell>
  );
}
