
'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser } from '@/hooks/use-user';
import { getFirebaseServices } from '@/firebase/client';
import { getNotifications, markNotificationsAsRead, Notification } from '@/firebase/firestore/users';
import { type Firestore } from 'firebase/firestore';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';


function NotificationItem({ notification, onClick }: { notification: Notification, onClick: () => void }) {
    return (
        <button 
            className={cn(
                "flex items-start gap-3 p-3 text-left w-full hover:bg-accent rounded-md transition-colors",
                !notification.read && "bg-primary/10"
            )}
            onClick={onClick}
        >
            <Avatar className="h-8 w-8">
                <AvatarImage src={notification.fromUserPhotoURL} />
                <AvatarFallback>{getInitials(notification.fromUserName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-sm">
                    <span className="font-semibold">{notification.fromUserName}</span> mentioned you in <span className="font-semibold">#{notification.channelName}</span>
                </p>
                <p className="text-xs text-muted-foreground italic line-clamp-1">
                    "{notification.messageSnippet}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                </p>
            </div>
            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1" />}
        </button>
    )
}

export function NotificationBell() {
    const { user } = useUser();
    const [firestore, setFirestore] = useState<Firestore | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) {
          const { firestore: fs } = getFirebaseServices();
          setFirestore(fs);
        }
    }, [user]);

    useEffect(() => {
        if (user && firestore) {
            setLoading(true);
            const unsubscribe = getNotifications(firestore, user.uid, (data) => {
                setNotifications(data);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user, firestore]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleOpenChange = async (open: boolean) => {
        setPopoverOpen(open);
        if (!open && unreadCount > 0 && user && firestore) {
            // When popover closes, mark all visible as read
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id!);
            await markNotificationsAsRead(firestore, user.uid, unreadIds);
        }
    };
    
    const handleNotificationClick = (notification: Notification) => {
        setPopoverOpen(false);
        // This is a simplification. A real app would navigate to the specific message.
        // For now, we just navigate to the chat page.
        router.push(`/dashboard/chat?channel=${notification.channelId}`);
    }

    return (
        <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                            {unreadCount}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-3 border-b">
                    <h4 className="font-medium text-sm">Notifications</h4>
                </div>
                <ScrollArea className="h-96">
                   {loading ? (
                       <div className="flex items-center justify-center p-8">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                       </div>
                   ) : notifications.length > 0 ? (
                       <div className="p-2 space-y-1">
                           {notifications.map(n => (
                               <NotificationItem key={n.id} notification={n} onClick={() => handleNotificationClick(n)} />
                           ))}
                       </div>
                   ) : (
                       <p className="text-sm text-muted-foreground p-8 text-center">You have no notifications yet.</p>
                   )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
