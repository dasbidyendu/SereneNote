import { SignupForm } from './signup-form';
import { Logo } from '@/components/logo';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
       <div className="absolute top-8 left-8">
        <Logo />
       </div>
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background -z-10"
      />
      <SignupForm />
    </div>
  );
}
