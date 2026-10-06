import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', OWNER_USER_ID)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase get wallets error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wallets: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, icon, color, initial_balance } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Nama dan tipe dompet wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: OWNER_USER_ID,
        name: name.trim(),
        type,
        icon: icon || '💳',
        color: color || '#0F766E',
        initial_balance: Number(initial_balance) || 0,
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert wallet error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, wallet: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
