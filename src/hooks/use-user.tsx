
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
        if (typeof window === 'undefined') {
            setLoading(false); // On server, not loading and no user.
            return;
        }
        // This case can happen briefly on client before auth is initialized
        setLoading(true);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicPaths.includes(pathname);
    
    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && isPublic) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  const isPublic = publicPaths.includes(pathname);
  const shouldShowLoader = loading && !isPublic;
  const shouldRenderChildren = !loading || isPublic;


  return (
    <UserContext.Provider value={{ user, setUser: setUser as Dispatch<SetStateAction<User | null>> }}>
      {shouldShowLoader && (
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      {shouldRenderChildren && children}
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
