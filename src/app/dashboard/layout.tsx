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
  Wand2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/new-entry', icon: PlusSquare, label: 'New Entry' },
  { href: '/dashboard/cbt-analysis', icon: Wand2, label: 'CBT Analysis' },
  { href: '/dashboard/daily-mood', icon: CalendarDays, label: 'Daily Mood' },
  { href: '/dashboard/private-journals', icon: Lock, label: 'Private Journals' },
  { href: '/dashboard/public-journals', icon: Globe, label: 'Public Journals' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => router.push(item.href)}
                  isActive={pathname === item.href}
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
              <AvatarImage src="https://picsum.photos/seed/avatar_me/100/100" data-ai-hint="person portrait" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate text-sidebar-foreground">Jane Smith</span>
                <span className="text-xs text-muted-foreground truncate">jane.smith@example.com</span>
            </div>
           </div>
           <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => router.push('/login')}>
             <LogOut className="mr-2 h-4 w-4"/>
             <span>Logout</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="md:hidden flex items-center justify-between p-2 border-b">
           <SidebarTrigger />
           <Logo />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
