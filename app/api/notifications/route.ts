import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notifications  — returns up to 50 notifications for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unread_count = (data ?? []).filter((n) => !n.is_read).length;
  return NextResponse.json({ notifications: data ?? [], unread_count });
}

// PATCH /api/notifications  — mark one or all notifications as read
// Body: { id: string } | { all: true }
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id);

  if (body.all) {
    query = query.eq('is_read', false);
  } else if (body.id) {
    query = query.eq('id', body.id);
  } else {
    return NextResponse.json({ error: 'Provide id or all:true' }, { status: 400 });
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
