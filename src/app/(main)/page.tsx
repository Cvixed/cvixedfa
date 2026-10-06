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
    income: 0,
    expense: 0,
    previousIncome: 0,
    previousExpense: 0,
  });

  const [categoryExpenses, setCategoryExpenses] = useState<{ name: string; value: number; color: string }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [txRes, goalsRes] = await Promise.all([
          fetch('/api/transactions?limit=20'),
          fetch('/api/goals'),
        ]);

        const txData = await txRes.json();
        const goalsData = await goalsRes.json();

        if (txData?.transactions && txData.transactions.length > 0) {
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

          setSummary({
            income: totalInc,
            expense: totalExp,
            previousIncome: 0,
            previousExpense: 0,
          });

          // Group expenses by category
          const expenseMap: Record<string, { value: number; color: string }> = {};
          list
            .filter((t: any) => t.type === 'expense')
            .forEach((t: any) => {
              const name = t.categories?.name || 'Lainnya';
              const color = t.categories?.color || '#0F766E';
              if (!expenseMap[name]) {
                expenseMap[name] = { value: 0, color };
              }
              expenseMap[name].value += Number(t.amount);
            });

          const catList = Object.entries(expenseMap).map(([name, item]) => ({
            name,
            value: item.value,
            color: item.color,
          }));
          setCategoryExpenses(catList);
        } else {
          setRecentTransactions([]);
          setCategoryExpenses([]);
          setSummary({ income: 0, expense: 0, previousIncome: 0, previousExpense: 0 });
        }

        if (goalsData?.goals && goalsData.goals.length > 0) {
          setGoals(goalsData.goals);
        } else {
          setGoals([]);
        }
      } catch (e) {
        setRecentTransactions([]);
        setCategoryExpenses([]);
        setGoals([]);
        setSummary({ income: 0, expense: 0, previousIncome: 0, previousExpense: 0 });
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
