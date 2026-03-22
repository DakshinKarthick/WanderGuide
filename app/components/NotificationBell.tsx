'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, Plane, Sparkles, Tag, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'trip_update' | 'new_feature' | 'promo' | 'system';
  title: string;
  body: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  trip_update: <Plane className="w-4 h-4 text-[#6A87E0]" />,
  new_feature: <Sparkles className="w-4 h-4 text-purple-500" />,
  promo:       <Tag className="w-4 h-4 text-orange-400" />,
  system:      <Info className="w-4 h-4 text-gray-400" />,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.notifications ?? []);
      setUnreadCount(json.unread_count ?? 0);
    } catch {
      // silent fail – could be unauthenticated
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  const recent = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 text-white animate-[wiggle_1s_ease-in-out]" />
          ) : (
            <Bell className="w-5 h-5 text-white" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 shadow-xl rounded-xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#6A87E0] dark:bg-[#4A67C0] text-white">
          <span className="font-semibold text-sm">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-white/80 hover:text-white underline"
              >
                Mark all read
              </button>
            )}
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-72">
          {recent.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 transition-colors ${
                    n.is_read
                      ? 'bg-background'
                      : 'bg-[#EEF2FF] dark:bg-[#3A4D80]/30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {TYPE_ICONS[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-1">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="flex-shrink-0 self-start mt-0.5 w-2 h-2 rounded-full bg-[#6A87E0] hover:bg-[#4A67C0]"
                      title="Mark as read"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs text-[#6A87E0] hover:underline font-medium"
          >
            View all notifications →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
