'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [wRes, txRes] = await Promise.all([
          fetch('/api/wallets'),
          fetch('/api/transactions?limit=200'),
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
    }

    loadData();
  }, []);

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dompet & Rekening</h1>
          <p className="text-xs text-muted-foreground">Kelola rekening bank, e-wallet, dan uang tunai</p>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card className="rounded-2xl bg-gradient-to-br from-primary to-teal-700 text-white shadow-md">
        <CardContent className="p-5 space-y-1">
          <p className="text-xs text-primary-foreground/80 font-medium">Total Saldo di Semua Dompet</p>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isLoading ? '...' : formatRupiah(totalBalance)}
          </h2>
        </CardContent>
      </Card>

      {/* Wallet List */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Memuat dompet...</span>
        </div>
      ) : wallets.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Belum ada dompet.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {wallets.map((w) => (
            <Card key={w.id} className="rounded-2xl border-border/60">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-muted/60">{w.icon || '💳'}</span>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{w.name}</h3>
                    <p className="text-[11px] text-muted-foreground uppercase">{w.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-foreground">{formatRupiah(w.balance || 0)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
