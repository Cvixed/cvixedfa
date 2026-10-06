'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { ChevronRight, Receipt, Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

interface RecentTransactionItem {
  id: string;
  type: string;
  amount: number;
  date: string;
  category_name: string;
  category_icon?: string;
  note?: string;
  merchant?: string;
}

interface RecentTransactionsProps {
  transactions: RecentTransactionItem[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary">
              <Link href="/transactions/new">
                <Plus className="w-3.5 h-3.5 mr-1" /> Catat
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Receipt className="w-8 h-8" />}
            title="Belum ada transaksi"
            description="Mulai mencatat pengeluaran atau scan struk belanja Anda."
            action={{ label: 'Catat Transaksi', href: '/transactions/new' }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/transactions">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          const isTransfer = tx.type === 'transfer';

          return (
            <Link
              key={tx.id}
              href={`/transactions/${tx.id}`}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl p-2 rounded-xl bg-muted/60 shrink-0">
                  {tx.category_icon || (isIncome ? '💰' : isTransfer ? '🔄' : '💸')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {tx.merchant || tx.note || tx.category_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {tx.category_name} • {formatDateRelative(tx.date)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <p
                  className={`text-sm font-bold tracking-tight ${
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isTransfer
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-foreground'
                  }`}
                >
                  {isIncome ? '+' : isTransfer ? '' : '-'}
                  {formatRupiah(tx.amount)}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
