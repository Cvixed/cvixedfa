// Default expense categories with icons (emoji) and colors
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Makan & Minum', icon: '🍽️', color: '#F97316' },
  { name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { name: 'Bensin', icon: '⛽', color: '#EF4444' },
  { name: 'Servis & Perawatan Mobil', icon: '🔧', color: '#8B5CF6' },
  { name: 'Pajak & Asuransi Kendaraan', icon: '📋', color: '#6366F1' },
  { name: 'Belanja', icon: '🛍️', color: '#EC4899' },
  { name: 'Tagihan & Utilitas', icon: '💡', color: '#F59E0B' },
  { name: 'Kesehatan', icon: '🏥', color: '#10B981' },
  { name: 'Hiburan & Hangout', icon: '🎉', color: '#06B6D4' },
  { name: 'Pendidikan', icon: '📚', color: '#8B5CF6' },
  { name: 'Langganan', icon: '📱', color: '#6366F1' },
  { name: 'Lainnya', icon: '📌', color: '#6B7280' },
] as const;

// Default income categories
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Gaji', icon: '💰', color: '#10B981' },
  { name: 'Freelance', icon: '💻', color: '#3B82F6' },
  { name: 'Bonus', icon: '🎁', color: '#F59E0B' },
  { name: 'Hadiah', icon: '🎀', color: '#EC4899' },
  { name: 'Investasi', icon: '📈', color: '#8B5CF6' },
  { name: 'Lainnya', icon: '📌', color: '#6B7280' },
] as const;

// Goal templates
export const GOAL_TEMPLATES = [
  { key: 'bensin', name: 'Bensin Bulanan', icon: '⛽', color: '#EF4444', recurrence: 'monthly' as const },
  { key: 'servis', name: 'Servis Berkala Mobil', icon: '🔧', color: '#8B5CF6', recurrence: 'semi_annual' as const },
  { key: 'pajak', name: 'Pajak Kendaraan (PKB/STNK)', icon: '📋', color: '#6366F1', recurrence: 'annual' as const },
  { key: 'asuransi', name: 'Asuransi Kendaraan', icon: '🛡️', color: '#3B82F6', recurrence: 'annual' as const },
  { key: 'hangout', name: 'Hangout / Hiburan', icon: '🎉', color: '#06B6D4', recurrence: 'monthly' as const },
  { key: 'darurat', name: 'Dana Darurat', icon: '🆘', color: '#EF4444', recurrence: undefined },
  { key: 'liburan', name: 'Liburan', icon: '✈️', color: '#F59E0B', recurrence: undefined },
  { key: 'gadget', name: 'Gadget', icon: '📱', color: '#6366F1', recurrence: undefined },
] as const;

// Wallet types
export const WALLET_TYPES = [
  { value: 'cash', label: 'Tunai', icon: '💵' },
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱' },
  { value: 'other', label: 'Lainnya', icon: '💳' },
] as const;

export interface NavItem {
  href: string;
  label: string;
  iconName: 'Home' | 'Receipt' | 'PlusCircle' | 'Target' | 'Bot';
  isAction?: boolean;
}

// Navigation items
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'Beranda', iconName: 'Home', isAction: false },
  { href: '/transactions', label: 'Transaksi', iconName: 'Receipt', isAction: false },
  { href: '/transactions/new', label: 'Tambah', iconName: 'PlusCircle', isAction: true },
  { href: '/goals', label: 'Goals', iconName: 'Target', isAction: false },
  { href: '/advisor', label: 'Advisor', iconName: 'Bot', isAction: false },
];

// Suggested prompts for AI advisor
export const SUGGESTED_PROMPTS = [
  'Berapa dana darurat yang ideal buat saya?',
  'Bagaimana alokasi gaji bulan ini?',
  'Kenapa pengeluaran saya naik bulan ini?',
  'Saran investasi untuk pemula?',
  'Bagaimana cara menabung lebih efektif?',
  'Analisis keuangan saya bulan ini',
] as const;
