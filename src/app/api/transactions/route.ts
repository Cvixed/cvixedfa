import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Using explicit foreign key relationship for wallets to prevent PostgREST ambiguity (PGRST201)
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name, icon, color), wallets:wallets!transactions_wallet_id_fkey(name, type)')
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
    const { type, amount, date, category_id, category_name, wallet_id, merchant, note, tags } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: 'Tipe dan nominal transaksi wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Resolve category_id if only category_name was provided
    let resolvedCategoryId = category_id || null;
    if (!resolvedCategoryId && category_name) {
      const { data: cat } = (await supabase
        .from('categories')
        .select('id')
        .ilike('name', category_name.trim())
        .limit(1)
        .maybeSingle()) as { data: { id: string } | null };

      if (cat?.id) {
        resolvedCategoryId = cat.id;
      }
    }

    // 2. Resolve wallet_id (fallback to first active wallet if not provided)
    let resolvedWalletId = wallet_id || null;
    if (!resolvedWalletId) {
      const { data: firstWallet } = (await supabase
        .from('wallets')
        .select('id')
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle()) as { data: { id: string } | null };

      if (firstWallet?.id) {
        resolvedWalletId = firstWallet.id;
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: OWNER_USER_ID,
        type: type as 'income' | 'expense' | 'transfer',
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        category_id: resolvedCategoryId,
        wallet_id: resolvedWalletId,
        merchant: merchant || null,
        note: note || null,
        tags: tags || [],
      } as any)
      .select('*, categories(name, icon, color), wallets:wallets!transactions_wallet_id_fkey(name, type)')
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('transactions')
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
