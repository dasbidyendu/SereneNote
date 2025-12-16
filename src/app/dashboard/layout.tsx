
"use client";

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  PlusSquare,
  Lock,
  Globe,
  Users,
  User,
  CalendarDays,
  LogOut,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from '@/components/notification-bell';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/new-entry', icon: PlusSquare, label: 'New Entry' },
  { href: '/dashboard/cbt-analysis', icon: BrainCircuit, label: 'CBT Toolkit' },
  { href: '/dashboard/daily-mood', icon: CalendarDays, label: 'Daily Mood' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Community Chat' },
  { href: '/dashboard/private-journals', icon: Lock, label: 'Private Journals' },
  { href: '/dashboard/public-journals', icon: Globe, label: 'Public Journals' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
      if (user) {
        // We need to re-check local storage here because the profile in useUser might be stale
        // if the image was changed on the profile page without a full reload.
        const localAvatar = localStorage.getItem(`serene-note-avatar-${user.uid}`);
        setAvatarUrl(localAvatar || profile?.photoURL || null);
      }
  }, [user, profile, pathname]); // Rerun on pathname change to catch navigation from profile page

  const handleLogout = async () => {
    const { auth } = getFirebaseServices();
    try {
      if (auth) {
        await signOut(auth);
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
        });
        router.push('/login');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out.',
      });
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="flex items-center justify-between">
          <Logo />
          <div className="group-data-[collapsible=icon]:hidden">
            <NotificationBell />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => router.push(item.href)}
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <Separator className="my-2 bg-sidebar-border" />
           <div 
             className="flex items-center gap-3 w-full p-2 rounded-md cursor-pointer hover:bg-sidebar-accent"
             onClick={() => router.push('/dashboard/profile')}
           >
            <Avatar>
              <AvatarImage src={avatarUrl || ''} data-ai-hint="person portrait" />
              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate text-sidebar-foreground">{user?.displayName || 'User'}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
           </div>
           <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
             <LogOut className="mr-2 h-4 w-4"/>
             <span>Logout</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="md:hidden flex items-center justify-between p-2 border-b">
           <SidebarTrigger />
           <Logo />
           <NotificationBell />
        </div>
        <div className="flex-1 bg-[url('/download(1).jpg')] bg-cover bg-center">
          <div className="h-full w-full bg-background/80">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
