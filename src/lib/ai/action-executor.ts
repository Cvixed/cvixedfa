import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';
import { formatRupiah } from '@/lib/utils/currency';
import type {
  AiAction,
  ExecutedActionResult,
  CreateTransactionData,
  CreateGoalData,
  CreateBudgetData,
  CreateWalletData,
  CreateVehicleData,
  CreateVehicleServiceData,
  CreateDebtData,
} from './types';

/**
 * Resolves or auto-creates a wallet for transactions.
 */
async function resolveWallet(supabase: any, requestedWalletName?: string | null) {
  // 1. Try to find requested wallet by name
  if (requestedWalletName && requestedWalletName.trim()) {
    const cleanName = requestedWalletName.trim();
    const { data: matchedWallet } = await supabase
      .from('wallets')
      .select('id, name')
      .ilike('name', `%${cleanName}%`)
      .limit(1)
      .maybeSingle();

    if (matchedWallet) {
      return matchedWallet.id;
    }

    // Auto-create named wallet (e.g., ShopeePayLater, GoPay, BCA)
    const isPaylater = cleanName.toLowerCase().includes('paylater') || cleanName.toLowerCase().includes('kredit');
    const isEwallet = cleanName.toLowerCase().includes('pay') || cleanName.toLowerCase().includes('ovo') || cleanName.toLowerCase().includes('dana');
    const isBank = cleanName.toLowerCase().includes('bank') || cleanName.toLowerCase().includes('bca') || cleanName.toLowerCase().includes('mandiri') || cleanName.toLowerCase().includes('bri') || cleanName.toLowerCase().includes('bni');

    const walletType = isPaylater ? 'other' : isEwallet ? 'ewallet' : isBank ? 'bank' : 'cash';
    const walletIcon = isPaylater ? '💳' : isEwallet ? '📱' : isBank ? '🏦' : '💵';

    const { data: newWallet } = await (supabase.from('wallets') as any)
      .insert({
        user_id: OWNER_USER_ID,
        name: cleanName,
        type: walletType,
        initial_balance: 0,
        icon: walletIcon,
        color: '#0F766E',
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (newWallet) {
      return newWallet.id;
    }
  }

  // 2. Fallback to first existing wallet
  const { data: firstWallet } = await supabase
    .from('wallets')
    .select('id')
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstWallet?.id) {
    return firstWallet.id;
  }

  // 3. If wallets table is completely empty, create default wallet
  const { data: defaultWallet } = await (supabase.from('wallets') as any)
    .insert({
      user_id: OWNER_USER_ID,
      name: 'Dompet Utama',
      type: 'cash',
      initial_balance: 0,
      icon: '💵',
      color: '#0F766E',
      is_active: true,
    })
    .select()
    .single();

  return defaultWallet?.id || null;
}

/**
 * Resolves category ID based on name.
 */
async function resolveCategory(supabase: any, requestedName?: string | null, type: 'income' | 'expense' = 'expense') {
  if (requestedName && requestedName.trim()) {
    const cleanName = requestedName.trim();

    // 1. Exact match
    const { data: exact } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', cleanName)
      .limit(1)
      .maybeSingle();
    if (exact) return exact;

    // 2. Partial match
    const { data: partial } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', `%${cleanName}%`)
      .limit(1)
      .maybeSingle();
    if (partial) return partial;
  }

  // Fallback to "Lainnya" or first category of matching type
  const { data: fallback } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', type)
    .ilike('name', '%Lainnya%')
    .limit(1)
    .maybeSingle();

  if (fallback) return fallback;

  const { data: anyCat } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', type)
    .limit(1)
    .maybeSingle();

  return anyCat || null;
}

/**
 * Executes an array of parsed AI actions against Supabase directly.
 */
export async function executeAiActions(actions: AiAction[]): Promise<ExecutedActionResult[]> {
  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  const supabase = createAdminClient();
  const results: ExecutedActionResult[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'create_transaction': {
          const d: CreateTransactionData = action.data || {};
          const txType = (d.transaction_type || d.type || 'expense') as 'income' | 'expense' | 'transfer';
          const amount = Math.abs(Math.round(Number(d.amount) || 0));

          if (amount <= 0) {
            results.push({
              success: false,
              type: action.type,
              category: 'transaction',
              title: 'Transaksi Gagal',
              detail: 'Nominal transaksi harus lebih dari 0',
              error: 'Invalid amount',
            });
            break;
          }

          const cat = await resolveCategory(supabase, d.category_name, txType === 'income' ? 'income' : 'expense');
          const walletId = await resolveWallet(supabase, d.wallet_name);

          const { data: tx, error } = await (supabase.from('transactions') as any)
            .insert({
              user_id: OWNER_USER_ID,
              type: txType,
              amount,
              date: d.date || todayStr,
              category_id: cat?.id || null,
              wallet_id: walletId,
              merchant: d.merchant || null,
              note: d.note || `${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${cat?.name || ''}`,
            })
            .select()
            .single();

          if (error) throw error;

          results.push({
            success: true,
            type: action.type,
            category: 'transaction',
            title: txType === 'income' ? 'Pemasukan Dicatat' : 'Pengeluaran Dicatat',
            detail: `${d.note || cat?.name || 'Transaksi'} — ${formatRupiah(amount)}`,
            amount,
            badge: cat?.name || 'Umum',
            href: '/transactions',
            record: tx,
          });
          break;
        }

        case 'create_goal': {
          const d: CreateGoalData = action.data || {};
          const goalName = d.name || d.goal_name || 'Target Tabungan';
          const targetAmount = Math.abs(Math.round(Number(d.target_amount) || 0));

          if (targetAmount <= 0) {
            results.push({
              success: false,
              type: action.type,
              category: 'goal',
              title: 'Goal Gagal',
              detail: 'Target nominal harus lebih dari 0',
              error: 'Invalid target amount',
            });
            break;
          }

          // Pick dynamic icon based on keywords
          let icon = d.icon || '🎯';
          const lowerName = goalName.toLowerCase();
          if (lowerName.includes('ironman') || lowerName.includes('robot') || lowerName.includes('figurine') || lowerName.includes('action figure')) {
            icon = '🤖';
          } else if (lowerName.includes('motor') || lowerName.includes('mobil') || lowerName.includes('kendaraan')) {
            icon = '🚗';
          } else if (lowerName.includes('hp') || lowerName.includes('iphone') || lowerName.includes('laptop') || lowerName.includes('gadget')) {
            icon = '📱';
          } else if (lowerName.includes('liburan') || lowerName.includes('trip') || lowerName.includes('pesawat')) {
            icon = '✈️';
          } else if (lowerName.includes('darurat')) {
            icon = '🆘';
          } else if (lowerName.includes('nikah') || lowerName.includes('wedding')) {
            icon = '💍';
          }

          const { data: goal, error } = await (supabase.from('goals') as any)
            .insert({
              user_id: OWNER_USER_ID,
              name: goalName,
              target_amount: targetAmount,
              current_amount: Number(d.current_amount) || 0,
              target_date: d.target_date || d.deadline || null,
              icon,
              color: d.color || '#0F766E',
              status: 'active',
              priority: d.priority || 'medium',
            })
            .select()
            .single();

          if (error) throw error;

          results.push({
            success: true,
            type: action.type,
            category: 'goal',
            title: 'Goal Tabungan Baru',
            detail: `${goalName} — Target ${formatRupiah(targetAmount)}`,
            amount: targetAmount,
            badge: icon,
            href: '/goals',
            record: goal,
          });
          break;
        }

        case 'create_budget': {
          const d: CreateBudgetData = action.data || {};
          const amount = Math.abs(Math.round(Number(d.amount) || 0));

          if (amount <= 0) {
            results.push({
              success: false,
              type: action.type,
              category: 'budget',
              title: 'Anggaran Gagal',
              detail: 'Batas anggaran harus lebih dari 0',
              error: 'Invalid budget amount',
            });
            break;
          }

          const cat = await resolveCategory(supabase, d.category_name, 'expense');
          if (!cat?.id) {
            throw new Error(`Kategori ${d.category_name} tidak ditemukan`);
          }

          const month = d.month || currentMonth;
          const year = d.year || currentYear;

          // Check if budget already exists for this category & month
          const { data: existing } = await (supabase.from('budgets') as any)
            .select('id')
            .eq('user_id', OWNER_USER_ID)
            .eq('category_id', cat.id)
            .eq('month', month)
            .eq('year', year)
            .maybeSingle();

          let budgetRecord;
          if (existing?.id) {
            const { data: updated, error } = await (supabase.from('budgets') as any)
              .update({ amount })
              .eq('id', existing.id)
              .select()
              .single();
            if (error) throw error;
            budgetRecord = updated;
          } else {
            const { data: inserted, error } = await (supabase.from('budgets') as any)
              .insert({
                user_id: OWNER_USER_ID,
                category_id: cat.id,
                amount,
                month,
                year,
              })
              .select()
              .single();
            if (error) throw error;
            budgetRecord = inserted;
          }

          results.push({
            success: true,
            type: action.type,
            category: 'budget',
            title: 'Anggaran Diatur',
            detail: `${cat.name} — Batas ${formatRupiah(amount)} / bulan`,
            amount,
            badge: 'Anggaran',
            href: '/budgets',
            record: budgetRecord,
          });
          break;
        }

        case 'create_wallet': {
          const d: CreateWalletData = action.data || {};
          const name = d.name?.trim() || 'Dompet Baru';
          const type = (d.wallet_type || d.type || 'bank') as 'cash' | 'bank' | 'ewallet' | 'other';
          const initialBalance = Number(d.initial_balance) || 0;

          const icon = d.icon || (type === 'bank' ? '🏦' : type === 'ewallet' ? '📱' : type === 'cash' ? '💵' : '💳');
          const color = d.color || '#0F766E';

          const { data: wallet, error } = await (supabase.from('wallets') as any)
            .insert({
              user_id: OWNER_USER_ID,
              name,
              type,
              initial_balance: initialBalance,
              icon,
              color,
              is_active: true,
            })
            .select()
            .single();

          if (error) throw error;

          results.push({
            success: true,
            type: action.type,
            category: 'wallet',
            title: 'Dompet Baru Dibuat',
            detail: `${name} — Saldo Awal ${formatRupiah(initialBalance)}`,
            amount: initialBalance,
            badge: icon,
            href: '/wallets',
            record: wallet,
          });
          break;
        }

        case 'create_vehicle': {
          const d: CreateVehicleData = action.data || {};
          const name = d.name?.trim() || 'Kendaraan Baru';
          const vehicleType = (d.vehicle_type || d.type || 'car') as 'car' | 'motorcycle' | 'other';

          const { data: vehicle, error } = await (supabase.from('vehicles') as any)
            .insert({
              user_id: OWNER_USER_ID,
              name,
              plate_number: d.plate_number?.trim() || null,
              type: vehicleType,
              year: d.year ? Number(d.year) : null,
              current_odometer: Number(d.odometer || d.current_odometer) || 0,
              tax_due_date: d.tax_due_date || null,
            })
            .select()
            .single();

          if (error) throw error;

          results.push({
            success: true,
            type: action.type,
            category: 'vehicle',
            title: 'Kendaraan Ditambahkan',
            detail: `${name} ${d.plate_number ? `(${d.plate_number})` : ''}`,
            badge: vehicleType === 'car' ? 'Mobil 🚗' : 'Motor 🏍️',
            href: '/vehicles',
            record: vehicle,
          });
          break;
        }

        case 'create_vehicle_service': {
          const d: CreateVehicleServiceData = action.data || {};
          const serviceType = d.service_type?.trim() || 'Servis Berkala';
          const cost = Math.abs(Math.round(Number(d.cost) || 0));

          // 1. Find vehicle
          let vehicleId: string | null = null;
          if (d.vehicle_name) {
            const { data: matched } = (await supabase
              .from('vehicles')
              .select('id')
              .ilike('name', `%${d.vehicle_name.trim()}%`)
              .limit(1)
              .maybeSingle()) as any;
            if (matched?.id) vehicleId = matched.id;
          }

          if (!vehicleId) {
            const { data: firstVehicle } = (await supabase
              .from('vehicles')
              .select('id')
              .limit(1)
              .maybeSingle()) as any;

            if (firstVehicle?.id) {
              vehicleId = firstVehicle.id;
            } else {
              // Create default vehicle if none exists
              const { data: newVeh } = await (supabase.from('vehicles') as any)
                .insert({
                  user_id: OWNER_USER_ID,
                  name: d.vehicle_name || 'Kendaraan Utama',
                  type: 'car',
                  current_odometer: Number(d.odometer) || 0,
                })
                .select()
                .single();
              vehicleId = newVeh?.id;
            }
          }

          // 2. Insert service record
          const { data: serviceRecord, error } = await (supabase.from('vehicle_services') as any)
            .insert({
              user_id: OWNER_USER_ID,
              vehicle_id: vehicleId,
              date: d.date || todayStr,
              odometer: d.odometer ? Number(d.odometer) : null,
              service_type: serviceType,
              cost,
              note: d.note || null,
            })
            .select()
            .single();

          if (error) throw error;

          // 3. Update vehicle odometer & service date
          if (vehicleId) {
            const updatePayload: Record<string, any> = { last_service_date: d.date || todayStr };
            if (d.odometer && Number(d.odometer) > 0) {
              updatePayload.last_service_odometer = Number(d.odometer);
              updatePayload.current_odometer = Number(d.odometer);
            }
            await (supabase.from('vehicles') as any).update(updatePayload).eq('id', vehicleId);
          }

          // 4. Record expense transaction if cost > 0
          if (cost > 0) {
            const cat = await resolveCategory(supabase, 'Servis & Perawatan Mobil', 'expense');
            const walletId = await resolveWallet(supabase);
            await (supabase.from('transactions') as any).insert({
              user_id: OWNER_USER_ID,
              type: 'expense',
              amount: cost,
              date: d.date || todayStr,
              category_id: cat?.id || null,
              wallet_id: walletId,
              merchant: 'Bengkel / Servis Kendaraan',
              note: serviceType,
            });
          }

          results.push({
            success: true,
            type: action.type,
            category: 'vehicle_service',
            title: 'Servis Kendaraan Dicatat',
            detail: `${serviceType} — ${formatRupiah(cost)}`,
            amount: cost,
            badge: '🔧 Servis',
            href: '/vehicles',
            record: serviceRecord,
          });
          break;
        }

        case 'create_debt': {
          const d: CreateDebtData = action.data || {};
          const debtName = d.name?.trim() || 'Tagihan PayLater';
          const amount = Math.abs(Math.round(Number(d.amount) || 0));

          if (amount <= 0) break;

          const { data: debt, error } = await (supabase.from('debts') as any)
            .insert({
              user_id: OWNER_USER_ID,
              name: debtName,
              type: 'debt',
              total_amount: amount,
              remaining_amount: amount,
              person_name: d.person_name || d.creditor_name || null,
              due_date: d.due_date || null,
              direction: 'owed_by_me',
              note: d.note || null,
            })
            .select()
            .single();

          if (error) throw error;

          results.push({
            success: true,
            type: action.type,
            category: 'debt',
            title: 'Kewajiban / PayLater Dicatat',
            detail: `${debtName} — ${formatRupiah(amount)}`,
            amount,
            badge: '💳 PayLater',
            record: debt,
          });
          break;
        }

        default:
          console.warn('Unknown AI Action type:', (action as any).type);
      }
    } catch (err: any) {
      console.error(`Error executing action ${action.type}:`, err);
      results.push({
        success: false,
        type: action.type,
        category: 'transaction',
        title: `Gagal mencatat ${action.type}`,
        detail: err.message || 'Terjadi kesalahan sistem',
        error: err.message,
      });
    }
  }

  return results;
}
