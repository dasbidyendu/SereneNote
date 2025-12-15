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
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/new-entry', icon: PlusSquare, label: 'New Entry' },
  { href: '/dashboard/private-journals', icon: Lock, label: 'Private Journals' },
  { href: '/dashboard/public-journals', icon: Globe, label: 'Public Journals' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/daily-mood', icon: CalendarDays, label: 'Daily Mood' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarProvider>
      <Sidebar>
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
           <div className="flex items-center gap-3 w-full">
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/avatar_me/100/100" data-ai-hint="person portrait" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">Jane Smith</span>
                <span className="text-xs text-muted-foreground truncate">jane.smith@example.com</span>
            </div>
           </div>
           <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/login')}>
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
