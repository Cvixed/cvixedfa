import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, vehicle_services(*)')
      .eq('user_id', OWNER_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase get vehicles error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicles: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      plate_number,
      type,
      year,
      current_odometer,
      tax_due_date,
      insurance_due_date,
      service_interval_km,
      service_interval_months,
      last_service_date,
      last_service_odometer,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama kendaraan wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: OWNER_USER_ID,
        name: name.trim(),
        plate_number: plate_number?.trim() || null,
        type: type || 'car',
        year: year ? Number(year) : null,
        current_odometer: Number(current_odometer) || 0,
        tax_due_date: tax_due_date || null,
        insurance_due_date: insurance_due_date || null,
        service_interval_km: Number(service_interval_km) || 10000,
        service_interval_months: Number(service_interval_months) || 6,
        last_service_date: last_service_date || null,
        last_service_odometer: Number(last_service_odometer) || 0,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert vehicle error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vehicle: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('vehicles')
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
