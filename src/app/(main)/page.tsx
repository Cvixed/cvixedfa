'use client';

import React, { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { ExpenseDonut } from '@/components/dashboard/expense-donut';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { GoalsProgress } from '@/components/dashboard/goals-progress';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Camera, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    income: 8500000,
    expense: 5200000,
    previousIncome: 7800000,
    previousExpense: 4900000,
  });

  const [categoryExpenses, setCategoryExpenses] = useState([
    { name: 'Makan & Minum', value: 1800000, color: '#F97316' },
    { name: 'Transport', value: 850000, color: '#3B82F6' },
    { name: 'Bensin', value: 650000, color: '#EF4444' },
    { name: 'Belanja', value: 920000, color: '#EC4899' },
    { name: 'Tagihan & Utilitas', value: 580000, color: '#F59E0B' },
    { name: 'Lainnya', value: 400000, color: '#6B7280' },
  ]);

  const [monthlyTrend] = useState([
    { month: 'Mei', income: 7500000, expense: 4800000 },
    { month: 'Jun', income: 8000000, expense: 5100000 },
    { month: 'Jul', income: 7800000, expense: 4900000 },
    { month: 'Agu', income: 8200000, expense: 5300000 },
    { month: 'Sep', income: 7900000, expense: 4700000 },
    { month: 'Okt', income: 8500000, expense: 5200000 },
  ]);

  const [goals, setGoals] = useState([
    {
      id: '1',
      name: 'Pajak Mobil (PKB)',
      icon: '📋',
      color: '#6366F1',
      current_amount: 2400000,
      target_amount: 4000000,
      status: 'on_track',
      target_date: '2025-08-15',
    },
    {
      id: '2',
      name: 'Servis Berkala Mobil',
      icon: '🔧',
      color: '#8B5CF6',
      current_amount: 1500000,
      target_amount: 3000000,
      status: 'behind',
      target_date: '2025-06-01',
    },
    {
      id: '3',
      name: 'Dana Darurat (6x Pengeluaran)',
      icon: '🆘',
      color: '#EF4444',
      current_amount: 15000000,
      target_amount: 31200000,
      status: 'on_track',
    },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: '1',
      type: 'expense',
      amount: 45000,
      date: new Date().toISOString().split('T')[0],
      category_name: 'Makan & Minum',
      category_icon: '🍽️',
      merchant: 'Warteg Bahari',
    },
    {
      id: '2',
      type: 'expense',
      amount: 150000,
      date: new Date().toISOString().split('T')[0],
      category_name: 'Bensin',
      category_icon: '⛽',
      note: 'Pertamax Full Tank',
    },
    {
      id: '3',
      type: 'income',
      amount: 8500000,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      category_name: 'Gaji',
      category_icon: '💰',
      note: 'Gaji Bulanan',
    },
  ]);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [txRes, goalsRes] = await Promise.all([
          fetch('/api/transactions?limit=10'),
          fetch('/api/goals'),
        ]);

        const txData = await txRes.json();
        const goalsData = await goalsRes.json();

        if (txData?.transactions?.length) {
          const list = txData.transactions;
          setRecentTransactions(
            list.slice(0, 5).map((t: any) => ({
              id: t.id,
              type: t.type,
              amount: t.amount,
              date: t.date,
              category_name: t.categories?.name || 'Lainnya',
              category_icon: t.categories?.icon || (t.type === 'income' ? '💰' : '💸'),
              merchant: t.merchant,
              note: t.note,
            }))
          );

          // Calculate total income and expense from list
          const totalInc = list
            .filter((t: any) => t.type === 'income')
            .reduce((s: number, t: any) => s + Number(t.amount), 0);
          const totalExp = list
            .filter((t: any) => t.type === 'expense')
            .reduce((s: number, t: any) => s + Number(t.amount), 0);

          if (totalInc > 0 || totalExp > 0) {
            setSummary((prev) => ({
              ...prev,
              income: totalInc || prev.income,
              expense: totalExp || prev.expense,
            }));
          }
        }

        if (goalsData?.goals?.length) {
          setGoals(goalsData.goals);
        }
      } catch (e) {
        // Fallback to initial sample
      }
    }

    loadLiveData();
  }, []);

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Halo, Keuangan Anda
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            CvixedFA • Ringkasan Keuangan Pribadi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-xl border-border/70 h-9">
            <Link href="/transactions/new?mode=scan">
              <Camera className="w-4 h-4 mr-1.5 text-primary" />
              Scan Struk
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl h-9 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/transactions/new">
              <Plus className="w-4 h-4 mr-1" />
              Catat
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <SummaryCards
        income={summary.income}
        expense={summary.expense}
        previousIncome={summary.previousIncome}
        previousExpense={summary.previousExpense}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpenseDonut data={categoryExpenses} />
        <TrendChart data={monthlyTrend} />
      </div>

      {/* Goals & Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoalsProgress goals={goals} />
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
}
