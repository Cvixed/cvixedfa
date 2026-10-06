import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name, icon, color), wallets(name, type)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase get transactions error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transactions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount, date, category_id, wallet_id, merchant, note, tags } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: 'Tipe dan nominal transaksi wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: OWNER_USER_ID,
        type: type as 'income' | 'expense' | 'transfer',
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        category_id: category_id || null,
        wallet_id: wallet_id || null,
        merchant: merchant || null,
        note: note || null,
        tags: tags || [],
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert transaction error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
