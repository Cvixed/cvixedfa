-- ==============================================================================
-- CvixedFA (Cvixed Financial Advisor) - Complete Supabase Setup
-- Single-Owner Personal Edition (Secured by Google Authenticator)
-- ==============================================================================
-- Jalankan SELURUH skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Helper function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set default owner UUID
DO $$
BEGIN
  -- 2. Create Tables
  
  -- Profiles
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid UNIQUE,
    full_name TEXT DEFAULT 'Pemilik CvixedFA',
    avatar_url TEXT,
    monthly_income BIGINT DEFAULT 8500000,
    dependents INT DEFAULT 0,
    marital_status TEXT DEFAULT 'single',
    risk_tolerance TEXT DEFAULT 'moderate',
    investment_horizon TEXT DEFAULT '5-10 tahun',
    investment_instruments TEXT[] DEFAULT ARRAY['Reksa Dana Pasar Uang', 'Emas', 'SBN Ritel'],
    onboarding_completed BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'system',
    pin_hash TEXT,
    hide_balance BOOLEAN DEFAULT false,
    streak_days INT DEFAULT 1,
    last_record_date DATE DEFAULT CURRENT_DATE,
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Wallets
  CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    initial_balance BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Categories
  CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Transactions
  CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    type TEXT NOT NULL,
    amount BIGINT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    dest_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    note TEXT,
    tags TEXT[] DEFAULT '{}',
    recurring_rule_id UUID,
    merchant TEXT,
    receipt_id UUID,
    is_duplicate_suspect BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Receipts
  CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    raw_ocr_json JSONB,
    status TEXT DEFAULT 'processed',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Budgets
  CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount BIGINT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Goals
  CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    target_amount BIGINT NOT NULL,
    current_amount BIGINT DEFAULT 0,
    target_date DATE,
    priority TEXT DEFAULT 'medium',
    icon TEXT,
    color TEXT,
    status TEXT DEFAULT 'active',
    is_recurring BOOLEAN DEFAULT false,
    recurrence_interval TEXT,
    next_recurrence DATE,
    template_key TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Goal Contributions
  CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    amount BIGINT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Recurring Rules
  CREATE TABLE IF NOT EXISTS public.recurring_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount BIGINT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    note TEXT,
    frequency TEXT NOT NULL,
    day_of_month INT,
    next_due DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Vehicles
  CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    plate_number TEXT,
    type TEXT DEFAULT 'car',
    year INT,
    current_odometer INT DEFAULT 0,
    tax_due_date DATE,
    insurance_due_date DATE,
    service_interval_km INT DEFAULT 10000,
    service_interval_months INT DEFAULT 6,
    last_service_date DATE,
    last_service_odometer INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Vehicle Services
  CREATE TABLE IF NOT EXISTS public.vehicle_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    odometer INT,
    service_type TEXT NOT NULL,
    cost BIGINT DEFAULT 0,
    note TEXT,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Chat Threads
  CREATE TABLE IF NOT EXISTS public.chat_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    title TEXT DEFAULT 'Percakapan Baru',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Chat Messages
  CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    thread_id UUID REFERENCES public.chat_threads(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    function_call JSONB,
    function_result JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Debts
  CREATE TABLE IF NOT EXISTS public.debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    total_amount BIGINT NOT NULL,
    remaining_amount BIGINT NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    due_date DATE,
    person_name TEXT,
    direction TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Assets
  CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    current_value BIGINT DEFAULT 0,
    note TEXT,
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

END $$;

-- 3. Triggers for updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_update_timestamp ON public.%I;', t);
    EXECUTE format('CREATE TRIGGER trg_update_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t);
  END LOOP;
END $$;

-- 4. Seed Initial Data for the Owner
DO $$
DECLARE
  v_owner_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  v_wallet_bca UUID;
  v_wallet_gopay UUID;
  v_wallet_cash UUID;
  v_cat_makan UUID;
  v_cat_bensin UUID;
  v_cat_gaji UUID;
BEGIN
  -- Insert Owner Profile if not exists
  INSERT INTO public.profiles (user_id, full_name, monthly_income)
  VALUES (v_owner_id, 'Pemilik CvixedFA', 8500000)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert Categories if empty
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = v_owner_id) THEN
    -- Income
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
      (v_owner_id, 'Gaji', 'income', '💰', '#10B981', true, 1),
      (v_owner_id, 'Freelance', 'income', '💻', '#3B82F6', true, 2),
      (v_owner_id, 'Bonus', 'income', '🎁', '#F59E0B', true, 3),
      (v_owner_id, 'Hadiah', 'income', '🎀', '#EC4899', true, 4),
      (v_owner_id, 'Investasi', 'income', '📈', '#8B5CF6', true, 5),
      (v_owner_id, 'Lainnya', 'income', '📌', '#6B7280', true, 6);

    -- Expense
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
      (v_owner_id, 'Makan & Minum', 'expense', '🍽️', '#F97316', true, 1),
      (v_owner_id, 'Transport', 'expense', '🚗', '#3B82F6', true, 2),
      (v_owner_id, 'Bensin', 'expense', '⛽', '#EF4444', true, 3),
      (v_owner_id, 'Servis & Perawatan Mobil', 'expense', '🔧', '#8B5CF6', true, 4),
      (v_owner_id, 'Pajak & Asuransi Kendaraan', 'expense', '📋', '#6366F1', true, 5),
      (v_owner_id, 'Belanja', 'expense', '🛍️', '#EC4899', true, 6),
      (v_owner_id, 'Tagihan & Utilitas', 'expense', '💡', '#F59E0B', true, 7),
      (v_owner_id, 'Kesehatan', 'expense', '🏥', '#10B981', true, 8),
      (v_owner_id, 'Hiburan & Hangout', 'expense', '🎉', '#06B6D4', true, 9),
      (v_owner_id, 'Pendidikan', 'expense', '📚', '#8B5CF6', true, 10),
      (v_owner_id, 'Langganan', 'expense', '📱', '#6366F1', true, 11),
      (v_owner_id, 'Lainnya', 'expense', '📌', '#6B7280', true, 12);
  END IF;

  -- Insert Wallets if empty
  IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = v_owner_id) THEN
    INSERT INTO public.wallets (user_id, name, type, icon, color, initial_balance, sort_order) VALUES
      (v_owner_id, 'BCA Utama', 'bank', '🏦', '#3B82F6', 14200000, 1) RETURNING id INTO v_wallet_bca;
    INSERT INTO public.wallets (user_id, name, type, icon, color, initial_balance, sort_order) VALUES
      (v_owner_id, 'GoPay', 'ewallet', '📱', '#06B6D4', 450000, 2) RETURNING id INTO v_wallet_gopay;
    INSERT INTO public.wallets (user_id, name, type, icon, color, initial_balance, sort_order) VALUES
      (v_owner_id, 'Uang Tunai', 'cash', '💵', '#10B981', 650000, 3) RETURNING id INTO v_wallet_cash;
  END IF;

  -- Insert Goals if empty
  IF NOT EXISTS (SELECT 1 FROM public.goals WHERE user_id = v_owner_id) THEN
    INSERT INTO public.goals (user_id, name, target_amount, current_amount, target_date, priority, icon, color, status) VALUES
      (v_owner_id, 'Pajak Kendaraan (PKB)', 4000000, 2400000, (CURRENT_DATE + INTERVAL '10 month')::date, 'high', '📋', '#6366F1', 'active'),
      (v_owner_id, 'Servis Berkala Mobil', 3000000, 1500000, (CURRENT_DATE + INTERVAL '6 month')::date, 'medium', '🔧', '#8B5CF6', 'active'),
      (v_owner_id, 'Dana Darurat (6x Pengeluaran)', 31200000, 15000000, (CURRENT_DATE + INTERVAL '12 month')::date, 'high', '🆘', '#EF4444', 'active');
  END IF;

  -- Insert Starter Transactions if empty
  IF NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = v_owner_id) THEN
    SELECT id INTO v_cat_makan FROM public.categories WHERE name = 'Makan & Minum' AND user_id = v_owner_id LIMIT 1;
    SELECT id INTO v_cat_bensin FROM public.categories WHERE name = 'Bensin' AND user_id = v_owner_id LIMIT 1;
    SELECT id INTO v_cat_gaji FROM public.categories WHERE name = 'Gaji' AND user_id = v_owner_id LIMIT 1;
    SELECT id INTO v_wallet_bca FROM public.wallets WHERE name = 'BCA Utama' AND user_id = v_owner_id LIMIT 1;
    SELECT id INTO v_wallet_gopay FROM public.wallets WHERE name = 'GoPay' AND user_id = v_owner_id LIMIT 1;

    INSERT INTO public.transactions (user_id, type, amount, date, category_id, wallet_id, merchant, note) VALUES
      (v_owner_id, 'expense', 45000, CURRENT_DATE, v_cat_makan, v_wallet_gopay, 'Warteg Bahari', 'Makan siang'),
      (v_owner_id, 'expense', 150000, CURRENT_DATE, v_cat_bensin, v_wallet_bca, 'Pertamina', 'Pertamax full'),
      (v_owner_id, 'income', 8500000, (CURRENT_DATE - INTERVAL '3 day')::date, v_cat_gaji, v_wallet_bca, 'Kantor', 'Gaji bulanan');
  END IF;
END $$;

-- 5. Storage Bucket for Receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Permissive Policies for Supabase
-- Since access is protected by Google Authenticator at application edge,
-- we allow service role and anon client access to public tables.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow full access" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "Allow full access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;

-- Storage policies
DROP POLICY IF EXISTS "Public receipts read" ON storage.objects;
CREATE POLICY "Public receipts read" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Public receipts insert" ON storage.objects;
CREATE POLICY "Public receipts insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- ==============================================================================
-- SETUP SELESAI! Semua tabel, saldo, kategori, dan storage siap dipakai.
-- ==============================================================================
