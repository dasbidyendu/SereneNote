
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseServices } from '@/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const publicPaths = ['/login', '/signup', '/'];

export function UserProvider({ children }: UserProviderProps) {
  const { auth } = getFirebaseServices();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // auth will be null on the server, so we only run this on the client.
    if (!auth) {
      setLoading(false); // On server, not loading and no user.
      if (!publicPaths.includes(pathname)) {
        // If on a protected route on server, we can't know user state, so we might need a different strategy
        // For now, this will prevent a redirect loop on the server.
      }
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, pathname]);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicPaths.includes(pathname);
    
    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  if (loading && !publicPaths.includes(pathname)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
