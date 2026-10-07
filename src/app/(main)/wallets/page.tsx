'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Wallet, Loader2, Trash2, X, Check, Landmark, Smartphone, Banknote, CreditCard } from 'lucide-react';
import { formatCurrencyInput, formatRupiah, parseRupiah } from '@/lib/utils/currency';
import { toast } from 'sonner';

const WALLET_TYPES = [
  { value: 'bank', label: 'Bank', icon: '🏦', defaultIcon: '🏦' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱', defaultIcon: '📱' },
  { value: 'cash', label: 'Tunai', icon: '💵', defaultIcon: '💵' },
  { value: 'other', label: 'Lainnya', icon: '💳', defaultIcon: '💳' },
];

const ICON_PRESETS = ['🏦', '📱', '💵', '💳', '🪙', '💎', '💰', '💼', '🛒'];

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏦');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [wRes, txRes] = await Promise.all([
        fetch('/api/wallets'),
        fetch('/api/transactions?limit=500'),
      ]);

      const wData = await wRes.json();
      const txData = await txRes.json();

      const baseWallets = wData?.wallets || [];
      const allTx = txData?.transactions || [];

      // Compute current balance for each wallet:
      // initial_balance + income - expense
      const computed = baseWallets.map((w: any) => {
        let currentBalance = Number(w.initial_balance || 0);

        allTx.forEach((tx: any) => {
          if (tx.wallet_id === w.id) {
            if (tx.type === 'income') {
              currentBalance += Number(tx.amount || 0);
            } else if (tx.type === 'expense') {
              currentBalance -= Number(tx.amount || 0);
            }
          }
        });

        return {
          ...w,
          balance: currentBalance,
        };
      });

      setWallets(computed);
    } catch (err) {
      console.error('Failed to load wallets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTypeChange = (type: string) => {
    setWalletType(type);
    const found = WALLET_TYPES.find((t) => t.value === type);
    if (found) {
      setSelectedIcon(found.defaultIcon);
    }
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName.trim()) {
      toast.error('Masukkan nama dompet');
      return;
    }

    setIsSubmitting(true);
    try {
      const balanceNum = parseRupiah(initialBalance);
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: walletName.trim(),
          type: walletType,
          initial_balance: balanceNum,
          icon: selectedIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan dompet');
      }

      toast.success('Dompet baru berhasil ditambahkan!');
      setIsDialogOpen(false);
      setWalletName('');
      setInitialBalance('');
      setWalletType('bank');
      setSelectedIcon('🏦');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan dompet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWallet = async (id: string, name: string) => {
    if (!confirm(`Hapus dompet "${name}"? Data transaksi yang terhubung tetap tersimpan.`)) return;

    try {
      const res = await fetch(`/api/wallets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Dompet "${name}" berhasil dihapus`);
        setWallets((prev) => prev.filter((w) => w.id !== id));
      } else {
        toast.error('Gagal menghapus dompet');
      }
    } catch {
      toast.error('Gagal menghapus dompet');
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  return (
    <div className="space-y-5 pb-12 max-w-2xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Dompet & Rekening
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola rekening bank, e-wallet, dan uang tunai
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(!isDialogOpen)}
          size="sm"
          className="rounded-xl h-10 px-4 font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Dompet
        </Button>
      </div>

      {/* Add Wallet Form Modal / Collapse */}
      {isDialogOpen && (
        <Card className="rounded-2xl border-primary/30 shadow-md bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 pb-2 border-b border-border/60">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="p-1 rounded-lg bg-primary/10 text-primary">
                <Wallet className="w-4 h-4" />
              </span>
              Tambah Dompet / Rekening Baru
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleCreateWallet} className="p-4 space-y-4">
            {/* Tipe Dompet */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Tipe Rekening</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WALLET_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTypeChange(t.value)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      walletType === t.value
                        ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                        : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Dompet */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Nama Dompet / Bank</Label>
              <Input
                placeholder="Mis. BCA Digital, Bank Mandiri, GoPay, Dompet Saku"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="rounded-xl h-10"
                required
              />
            </div>

            {/* Saldo Awal */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Saldo Awal (Opsional)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(formatCurrencyInput(e.target.value))}
                  className="pl-11 rounded-xl h-10 font-semibold"
                />
              </div>
            </div>

            {/* Icon Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Pilih Ikon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_PRESETS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                      selectedIcon === ic
                        ? 'border-primary bg-primary/15 scale-105 shadow-2xs'
                        : 'border-border/60 hover:bg-muted/50'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 px-4 text-xs font-semibold"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl h-10 px-5 text-xs font-semibold shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Dompet'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Total Balance Card */}
      <Card className="rounded-2xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white shadow-md border-0 overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <CardContent className="p-6 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-teal-100 text-xs font-medium">
            <span>Total Saldo di Semua Dompet</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              {wallets.length} Dompet Aktif
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isLoading ? '...' : formatRupiah(totalBalance)}
          </h2>
        </CardContent>
      </Card>

      {/* Wallet List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daftar Rekening & Dompet
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center text-muted-foreground items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Memuat dompet...</span>
          </div>
        ) : wallets.length === 0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">Belum ada dompet tersimpan</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Klik tombol &ldquo;Tambah Dompet&rdquo; di atas untuk mencatat rekening bank atau e-wallet Anda.
            </p>
          </Card>
        ) : (
          wallets.map((w) => (
            <Card
              key={w.id}
              className="rounded-2xl border-border/60 hover:border-border transition-all overflow-hidden shadow-2xs group"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-2xl p-2.5 rounded-2xl bg-muted/60 shrink-0 shadow-2xs">
                    {w.icon || '💳'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate">{w.name}</h3>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {w.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                    {formatRupiah(w.balance || 0)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-rose-600 opacity-50 hover:opacity-100 rounded-lg transition-opacity"
                    onClick={() => handleDeleteWallet(w.id, w.name)}
                    title="Hapus dompet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
