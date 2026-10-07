import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicle_id, date, odometer, service_type, cost, note, record_as_expense } = body;

    if (!vehicle_id || !service_type) {
      return NextResponse.json({ error: 'Kendaraan dan jenis servis wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Insert vehicle service
    const { data: serviceRecord, error: serviceError } = await supabase
      .from('vehicle_services')
      .insert({
        user_id: OWNER_USER_ID,
        vehicle_id,
        date: date || new Date().toISOString().split('T')[0],
        odometer: odometer ? Number(odometer) : null,
        service_type,
        cost: cost ? Number(cost) : 0,
        note: note || null,
      } as any)
      .select()
      .single();

    if (serviceError) {
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    // 2. Update vehicle's last_service_date and last_service_odometer
    const updatePayload: Record<string, any> = {
      last_service_date: date || new Date().toISOString().split('T')[0],
    };

    if (odometer && Number(odometer) > 0) {
      updatePayload.last_service_odometer = Number(odometer);
      updatePayload.current_odometer = Number(odometer);
    }

    await (supabase.from('vehicles') as any)
      .update(updatePayload)
      .eq('id', vehicle_id);

    // 3. Optional: automatically create expense transaction if requested and cost > 0
    if (record_as_expense && cost && Number(cost) > 0) {
      // Find category for vehicle service
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', '%Servis%')
        .limit(1)
        .maybeSingle() as { data: { id: string } | null };

      // Find primary wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle() as { data: { id: string } | null };

      await (supabase.from('transactions') as any).insert({
        user_id: OWNER_USER_ID,
        type: 'expense',
        amount: Number(cost),
        date: date || new Date().toISOString().split('T')[0],
        category_id: category?.id || null,
        wallet_id: wallet?.id || null,
        merchant: 'Bengkel / Servis Kendaraan',
        note: `${service_type}${note ? ` - ${note}` : ''}`,
      });
    }

    return NextResponse.json({ success: true, service: serviceRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
