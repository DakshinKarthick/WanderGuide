'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Map, Plane, Info, LogOut, User as UserIcon, Menu, X, MessageSquareDot, Compass } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import Image from 'next/image';

const navLinks = [
  { href: '/locations', label: 'Explore', icon: Compass },
  { href: '/trip-planning', label: 'Plan Trip', icon: Plane },
  { href: '/reviews', label: 'Reviews', icon: MessageSquareDot },
  { href: '/about', label: 'About', icon: Info },
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  const username = user?.email?.split('@')[0] ?? 'Account';

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[hsl(222,30%,9%)]/90 backdrop-blur-md shadow-sm border-b border-border/50'
            : 'bg-white dark:bg-[hsl(222,30%,9%)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="WanderGuide home"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow relative">
              <Image src="/logo.png" alt="WanderGuide Logo" fill className="object-cover" sizes="32px" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Wander<span className="text-primary">Guide</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationBell />
                <Link href="/trip-planning">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="max-w-[100px] truncate">{username}</span>
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex text-muted-foreground hover:text-destructive gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only">Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-brand-gradient hover:opacity-90 text-white font-medium shadow-sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
              <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/trip-planning">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <UserIcon className="w-4 h-4" />
                        {username}
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full bg-brand-gradient text-white">Get started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
