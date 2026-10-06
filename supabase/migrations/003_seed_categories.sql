-- 003_seed_categories.sql

-- Function to seed default categories
CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
    (p_user_id, 'Gaji', 'income', '💰', '#4ade80', true, 1),
    (p_user_id, 'Freelance', 'income', '💻', '#60a5fa', true, 2),
    (p_user_id, 'Bonus', 'income', '🎁', '#f472b6', true, 3),
    (p_user_id, 'Hadiah', 'income', '🎊', '#c084fc', true, 4),
    (p_user_id, 'Investasi', 'income', '📈', '#fbbf24', true, 5),
    (p_user_id, 'Lainnya', 'income', '💵', '#9ca3af', true, 6);

  -- Expense categories
  INSERT INTO public.categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
    (p_user_id, 'Makan & Minum', 'expense', '🍔', '#f87171', true, 1),
    (p_user_id, 'Transport', 'expense', '🚗', '#fb923c', true, 2),
    (p_user_id, 'Bensin', 'expense', '⛽', '#facc15', true, 3),
    (p_user_id, 'Servis & Perawatan Mobil', 'expense', '🔧', '#a3e635', true, 4),
    (p_user_id, 'Pajak & Asuransi Kendaraan', 'expense', '📄', '#4ade80', true, 5),
    (p_user_id, 'Belanja', 'expense', '🛍️', '#2dd4bf', true, 6),
    (p_user_id, 'Tagihan & Utilitas', 'expense', '🧾', '#38bdf8', true, 7),
    (p_user_id, 'Kesehatan', 'expense', '💊', '#818cf8', true, 8),
    (p_user_id, 'Hiburan & Hangout', 'expense', '🎬', '#c084fc', true, 9),
    (p_user_id, 'Pendidikan', 'expense', '📚', '#fb7185', true, 10),
    (p_user_id, 'Langganan', 'expense', '🔄', '#e879f9', true, 11),
    (p_user_id, 'Lainnya', 'expense', '💸', '#9ca3af', true, 12);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify handle_new_user to call the seed function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''));
  
  -- Seed default categories
  PERFORM seed_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
