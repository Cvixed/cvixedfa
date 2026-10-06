'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { calculateSavingsRate } from '@/lib/utils/calculations';

interface SummaryCardsProps {
  income: number;
  expense: number;
  previousIncome?: number;
  previousExpense?: number;
}

export function SummaryCards({ income, expense, previousIncome, previousExpense }: SummaryCardsProps) {
  const balance = income - expense;
  const savingsRate = calculateSavingsRate(income, expense);

  const incomeGrowth = previousIncome && previousIncome > 0
    ? Math.round(((income - previousIncome) / previousIncome) * 100)
    : null;

  const expenseGrowth = previousExpense && previousExpense > 0
    ? Math.round(((expense - previousExpense) / previousExpense) * 100)
    : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Pemasukan */}
      <Card className="rounded-2xl border-border/60 shadow-sm bg-gradient-to-br from-card to-emerald-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1.5">
            <span>Pemasukan</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold tracking-tight text-foreground">
            {formatRupiah(income)}
          </div>
          {incomeGrowth !== null && (
            <p className="text-[11px] text-muted-foreground mt-1">
              <span className={incomeGrowth >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                {incomeGrowth >= 0 ? `+${incomeGrowth}%` : `${incomeGrowth}%`}
              </span>{' '}
              vs bln lalu
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pengeluaran */}
      <Card className="rounded-2xl border-border/60 shadow-sm bg-gradient-to-br from-card to-rose-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1.5">
            <span>Pengeluaran</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold tracking-tight text-foreground">
            {formatRupiah(expense)}
          </div>
          {expenseGrowth !== null && (
            <p className="text-[11px] text-muted-foreground mt-1">
              <span className={expenseGrowth <= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                {expenseGrowth >= 0 ? `+${expenseGrowth}%` : `${expenseGrowth}%`}
              </span>{' '}
              vs bln lalu
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sisa / Saldo Bersih */}
      <Card className="rounded-2xl border-border/60 shadow-sm bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1.5">
            <span>Sisa Saldo</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className={`text-lg md:text-xl font-bold tracking-tight ${balance >= 0 ? 'text-foreground' : 'text-rose-600'}`}>
            {formatRupiah(balance)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Arus kas bersih
          </p>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card className="rounded-2xl border-border/60 shadow-sm bg-gradient-to-br from-card to-teal-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1.5">
            <span>Savings Rate</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold tracking-tight text-foreground">
            {savingsRate}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {savingsRate >= 20 ? 'Target tercapai (≥20%)' : 'Di bawah target (20%)'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
