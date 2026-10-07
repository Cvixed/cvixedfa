import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', OWNER_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ goals: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, target_amount, current_amount = 0, target_date, priority = 'medium', icon = '🎯', color = '#10B981' } = body;

    if (!name || !target_amount) {
      return NextResponse.json({ error: 'Nama dan target nominal wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: OWNER_USER_ID,
        name,
        target_amount: Number(target_amount),
        current_amount: Number(current_amount),
        target_date: target_date || null,
        priority: (priority as 'low' | 'medium' | 'high') || 'medium',
        icon,
        color,
        status: 'active',
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, goal: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, add_amount, current_amount } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch existing goal
    const { data: existing, error: fetchErr } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Goal tidak ditemukan' }, { status: 404 });
    }

    const existingGoal = existing as any;
    const newAmount = add_amount
      ? Number(existingGoal.current_amount || 0) + Number(add_amount)
      : Number(current_amount);

    const { data, error } = await (supabase.from('goals') as any)
      .update({
        current_amount: newAmount,
        status: newAmount >= Number(existingGoal.target_amount) ? 'completed' : 'active',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, goal: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
