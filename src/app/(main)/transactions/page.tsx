'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import { Plus, Camera, Search, Filter, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const initialFallback = [
    {
      id: '1',
      type: 'expense',
      amount: 45000,
      date: new Date().toISOString().split('T')[0],
      category_name: 'Makan & Minum',
      category_icon: '🍽️',
      merchant: 'Warteg Bahari',
      wallet: 'GoPay',
    },
    {
      id: '2',
      type: 'expense',
      amount: 150000,
      date: new Date().toISOString().split('T')[0],
      category_name: 'Bensin',
      category_icon: '⛽',
      note: 'Pertamax Full Tank',
      wallet: 'BCA',
    },
    {
      id: '3',
      type: 'income',
      amount: 8500000,
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      category_name: 'Gaji',
      category_icon: '💰',
      note: 'Gaji Bulanan',
      wallet: 'BCA',
    },
    {
      id: '4',
      type: 'expense',
      amount: 250000,
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      category_name: 'Hiburan & Hangout',
      category_icon: '🎉',
      merchant: 'Kopi Kenangan Rest Area',
      wallet: 'Tunai',
    },
  ];

  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        if (data && data.transactions && data.transactions.length > 0) {
          setTransactions(
            data.transactions.map((tx: any) => ({
              id: tx.id,
              type: tx.type,
              amount: tx.amount,
              date: tx.date,
              category_name: tx.categories?.name || 'Lainnya',
              category_icon: tx.categories?.icon || (tx.type === 'income' ? '💰' : '💸'),
              merchant: tx.merchant,
              note: tx.note,
              wallet: tx.wallets?.name || 'Dompet',
            }))
          );
        } else {
          setTransactions(initialFallback);
        }
      } catch {
        setTransactions(initialFallback);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === '' ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.category_name && tx.category_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Daftar Transaksi
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Semua catatan arus kas pemasukan dan pengeluaran
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-xl h-9">
            <Link href="/transactions/new?mode=scan">
              <Camera className="w-4 h-4 mr-1 text-primary" />
              Scan
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl h-9">
            <Link href="/transactions/new">
              <Plus className="w-4 h-4 mr-1" />
              Catat
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi, merchant, catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl h-10 bg-card border-border/70"
          />
        </div>
        <div className="flex rounded-xl bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              filterType === 'all' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              filterType === 'expense' ? 'bg-rose-500 text-white shadow-2xs font-bold' : 'text-muted-foreground'
            }`}
          >
            Keluar
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              filterType === 'income' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-muted-foreground'
            }`}
          >
            Masuk
          </button>
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Memuat transaksi...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Tidak ada transaksi yang cocok.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <Card
                key={tx.id}
                className="rounded-2xl border-border/60 hover:border-border transition-all overflow-hidden"
              >
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-2xl p-2 rounded-xl bg-muted/60 shrink-0">
                      {tx.category_icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {tx.merchant || tx.note || tx.category_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{tx.category_name}</span>
                        {tx.wallet && (
                          <>
                            <span>•</span>
                            <span>{tx.wallet}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDateShort(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="flex items-center justify-end gap-1">
                      {isIncome ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span
                        className={`text-sm font-bold tracking-tight ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
