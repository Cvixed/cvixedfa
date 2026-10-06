import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight, Wallet } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';

export default function WalletsPage() {
  const wallets = [
    { id: '1', name: 'BCA Utama', type: 'Bank', icon: '🏦', balance: 14200000 },
    { id: '2', name: 'GoPay', type: 'E-Wallet', icon: '📱', balance: 450000 },
    { id: '3', name: 'OVO', type: 'E-Wallet', icon: '📱', balance: 125000 },
    { id: '4', name: 'Dompet Tunai', type: 'Tunai', icon: '💵', balance: 650000 },
  ];

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dompet & Rekening</h1>
          <p className="text-xs text-muted-foreground">Kelola rekening bank, e-wallet, dan uang tunai</p>
        </div>
        <Button size="sm" className="rounded-xl h-9">
          <Plus className="w-4 h-4 mr-1" /> Tambah
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card className="rounded-2xl bg-gradient-to-br from-primary to-teal-700 text-white shadow-md">
        <CardContent className="p-5 space-y-1">
          <p className="text-xs text-primary-foreground/80 font-medium">Total Saldo di Semua Dompet</p>
          <h2 className="text-2xl font-extrabold tracking-tight">{formatRupiah(totalBalance)}</h2>
        </CardContent>
      </Card>

      {/* Wallet List */}
      <div className="space-y-2.5">
        {wallets.map((w) => (
          <Card key={w.id} className="rounded-2xl border-border/60">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-muted/60">{w.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{w.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{w.type}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-foreground">{formatRupiah(w.balance)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
