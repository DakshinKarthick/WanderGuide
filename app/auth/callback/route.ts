// app/auth/callback/route.ts — OAuth callback handler (code exchange)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Create a welcome notification for first-time users
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (count === 0) {
            await supabase.from('notifications').insert([
              {
                user_id: user.id,
                type: 'system',
                title: 'Welcome to WanderGuide! 🎉',
                body: 'Start exploring destinations, plan your dream trip across India, and share your travel experiences.',
                link: '/locations',
              },
              {
                user_id: user.id,
                type: 'new_feature',
                title: 'Plan Multi-Stop Trips',
                body: 'Use our Trip Planner to add multiple destinations, set dates, and get budget estimates for your journey.',
                link: '/locations?tab=planner',
              },
            ]);
          }
        }
      } catch {
        // Non-critical — don't block the redirect if notification insertion fails
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
