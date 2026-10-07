'use client';

import React, { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { ExpenseDonut } from '@/components/dashboard/expense-donut';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { GoalsProgress } from '@/components/dashboard/goals-progress';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  Camera,
  Plus,
  Wallet,
  Car,
  FileText,
  Bot,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';

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
  const [wallets, setWallets] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLiveData() {
      try {
        setIsLoading(true);
        const [txRes, goalsRes, walletsRes, vehiclesRes] = await Promise.all([
          fetch('/api/transactions?limit=50'),
          fetch('/api/goals'),
          fetch('/api/wallets'),
          fetch('/api/vehicles'),
        ]);

        const txData = await txRes.json();
        const goalsData = await goalsRes.json();
        const walletsData = await walletsRes.json();
        const vehiclesData = await vehiclesRes.json();

        const list = txData?.transactions || [];

        // 1. Transactions & Summary
        if (list.length > 0) {
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

          // Expenses by category
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

          // Monthly trend (6 months)
          const monthsMap: Record<string, { income: number; expense: number; sortKey: string }> = {};
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

          list.forEach((tx: any) => {
            const d = new Date(tx.date);
            const label = `${monthNames[d.getMonth()]}`;
            const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (!monthsMap[label]) {
              monthsMap[label] = { income: 0, expense: 0, sortKey };
            }
            if (tx.type === 'income') {
              monthsMap[label].income += Number(tx.amount || 0);
            } else if (tx.type === 'expense') {
              monthsMap[label].expense += Number(tx.amount || 0);
            }
          });

          const trendList = Object.entries(monthsMap)
            .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
            .slice(-6)
            .map(([month, val]) => ({
              month,
              income: val.income,
              expense: val.expense,
            }));
          setMonthlyTrend(trendList);
        } else {
          setRecentTransactions([]);
          setCategoryExpenses([]);
          setMonthlyTrend([]);
          setSummary({ income: 0, expense: 0, previousIncome: 0, previousExpense: 0 });
        }

        // 2. Goals
        if (goalsData?.goals) {
          setGoals(goalsData.goals);
        }

        // 3. Wallets with real calculated balance
        if (walletsData?.wallets) {
          const computedWallets = walletsData.wallets.map((w: any) => {
            let balance = Number(w.initial_balance || 0);
            list.forEach((t: any) => {
              if (t.wallet_id === w.id) {
                if (t.type === 'income') balance += Number(t.amount || 0);
                else if (t.type === 'expense') balance -= Number(t.amount || 0);
              }
            });
            return { ...w, balance };
          });
          setWallets(computedWallets);
        }

        // 4. Vehicles
        if (vehiclesData?.vehicles) {
          setVehicles(vehiclesData.vehicles);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveData();
  }, []);

  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  // Closest vehicle tax reminder
  const nextTaxVehicle = vehicles
    .filter((v) => Boolean(v.tax_due_date))
    .sort((a, b) => new Date(a.tax_due_date).getTime() - new Date(b.tax_due_date).getTime())[0];

  const daysToNextTax = nextTaxVehicle?.tax_due_date
    ? Math.ceil((new Date(nextTaxVehicle.tax_due_date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Top Banner / Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Halo, Keuangan Anda
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            CvixedFA • Ringkasan Keuangan Pribadi & Asisten Finansial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-xl border-border/70 h-9 font-semibold">
            <Link href="/transactions/new">
              <Camera className="w-4 h-4 mr-1.5 text-primary" />
              Scan Struk
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl h-9 font-semibold shadow-xs">
            <Link href="/transactions/new">
              <Plus className="w-4 h-4 mr-1" />
              Catat Transaksi
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Access Menu Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Link
          href="/wallets"
          className="p-3.5 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Dompet & Saldo</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {wallets.length > 0 ? `${wallets.length} Akun` : 'Kelola Dompet'}
            </p>
          </div>
        </Link>

        <Link
          href="/vehicles"
          className="p-3.5 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Kendaraan</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {vehicles.length > 0 ? `${vehicles.length} Kendaraan` : 'Pajak & Servis'}
            </p>
          </div>
        </Link>

        <Link
          href="/reports"
          className="p-3.5 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Laporan Keuangan</p>
            <p className="text-[11px] text-muted-foreground truncate">Arus Kas & CSV</p>
          </div>
        </Link>

        <Link
          href="/advisor"
          className="p-3.5 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all flex items-center gap-3 shadow-2xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">AI Advisor</p>
            <p className="text-[11px] text-muted-foreground truncate">Konsultasi AI</p>
          </div>
        </Link>
      </div>

      {/* 4 Summary Cards (Pemasukan, Pengeluaran, Sisa, Savings Rate) */}
      <SummaryCards
        income={summary.income}
        expense={summary.expense}
        previousIncome={summary.previousIncome}
        previousExpense={summary.previousExpense}
      />

      {/* Wallets & Vehicle Care Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet Overview Widget */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600">
                  <Wallet className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Saldo Dompet & Rekening</h3>
                  <p className="text-[11px] text-muted-foreground">Total di semua dompet aktif</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary">
                <Link href="/wallets">
                  Kelola <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="pt-1">
              <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {formatRupiah(totalWalletBalance)}
              </p>
            </div>

            {/* Wallet chips */}
            {wallets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-border/40">
                {wallets.slice(0, 3).map((w) => (
                  <div key={w.id} className="p-2 rounded-xl bg-muted/40 border border-border/40 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>{w.icon || '💳'}</span>
                      <span className="truncate font-semibold">{w.name}</span>
                    </div>
                    <p className="font-bold text-foreground mt-1 truncate">
                      {formatRupiah(w.balance || 0)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground pt-1">
                Belum ada dompet tersimpan. Klik Kelola untuk menambah.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Reminder Widget */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <Car className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Status Kendaraan & Pajak</h3>
                  <p className="text-[11px] text-muted-foreground">Pengingat STNK & jadwal servis rutin</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary">
                <Link href="/vehicles">
                  Lihat <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {nextTaxVehicle ? (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    🚗 {nextTaxVehicle.name}
                  </span>
                  {nextTaxVehicle.plate_number && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">
                      {nextTaxVehicle.plate_number}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Jatuh tempo pajak
                  </span>
                  <span
                    className={`font-bold ${
                      daysToNextTax !== null && daysToNextTax <= 30
                        ? 'text-rose-600'
                        : 'text-foreground'
                    }`}
                  >
                    {formatDateShort(nextTaxVehicle.tax_due_date)}
                    {daysToNextTax !== null && ` (${daysToNextTax} hari)`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-muted/30 border border-dashed border-border/60 text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">Belum ada data kendaraan</p>
                <p className="text-[11px] text-muted-foreground">
                  Catat mobil atau motor Anda untuk mendapatkan pengingat pajak & servis otomatis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
