
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseServices } from '@/firebase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/firebase/firestore/users';
import type { Firestore } from 'firebase/firestore';

export interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const publicPaths = ['/login', '/signup', '/'];

export function UserProvider({ children }: UserProviderProps) {
  const { auth, firestore } = getFirebaseServices();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }
        setLoading(true);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser && firestore) {
        try {
          const userProfile = await getUserProfile(firestore, authUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, firestore]);

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
    <UserContext.Provider value={{ user, profile, loading, setUser, setProfile }}>
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
