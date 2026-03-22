'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Plane, Sparkles, Tag, Info, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const TYPE_META: Record<
  Notification['type'],
  { icon: React.ReactNode; label: string; color: string }
> = {
  trip_update: {
    icon: <Plane className="w-5 h-5" />,
    label: 'Trip',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  },
  new_feature: {
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Feature',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
  },
  promo: {
    icon: <Tag className="w-5 h-5" />,
    label: 'Offer',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  },
  system: {
    icon: <Info className="w-5 h-5" />,
    label: 'System',
    color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch('/api/notifications');
    if (res.status === 401) {
      router.push('/auth/login');
      return;
    }
    const json = await res.json();
    setNotifications(json.notifications ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchNotifications();
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
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unread = notifications.filter((n) => !n.is_read);
  const unreadCount = unread.length;

  function NotificationCard({ n }: { n: Notification }) {
    const meta = TYPE_META[n.type];
    return (
      <div
        className={`flex gap-4 p-4 rounded-xl border transition-all ${
          n.is_read
            ? 'bg-card border-border'
            : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
        }`}
      >
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}
        >
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{n.title}</p>
              <Badge
                variant="secondary"
                className="text-[9px] uppercase tracking-wider mt-0.5 h-4"
              >
                {meta.label}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{n.body}</p>
          <div className="flex items-center gap-3 mt-3">
            {n.link && (
              <Link href={n.link}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <ExternalLink className="w-3 h-3" />
                  View
                </Button>
              </Link>
            )}
            {!n.is_read && (
              <button
                onClick={() => markRead(n.id)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3" />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">Your updates and alerts</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllRead}
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
            <Badge className="bg-destructive text-white ml-1 text-[10px] px-1.5">
              {unreadCount}
            </Badge>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="unread">
          <TabsList className="mb-6 w-full max-w-xs bg-muted rounded-xl p-1 h-auto">
            <TabsTrigger value="unread" className="flex-1 rounded-lg py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-destructive text-white text-[10px] px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 rounded-lg py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm">
              All
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                {notifications.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-3">
            {unread.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm mt-1">No unread notifications.</p>
              </div>
            ) : (
              unread.map((n) => <NotificationCard key={n.id} n={n} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1">
                  We'll notify you about trip updates and new features.
                </p>
              </div>
            ) : (
              notifications.map((n) => <NotificationCard key={n.id} n={n} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
