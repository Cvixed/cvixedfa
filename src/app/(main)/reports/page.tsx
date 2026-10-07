'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'this_month' | 'three_months' | 'all'>('this_month');

  useEffect(() => {
    async function loadAllTransactions() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/transactions?limit=500');
        const data = await res.json();
        if (data?.transactions) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.error('Failed to load transactions for reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllTransactions();
  }, []);

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (period === 'this_month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }
      if (period === 'three_months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return txDate >= threeMonthsAgo;
      }
      return true; // 'all'
    });
  }, [transactions, period]);

  // Financial aggregates
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Expenses breakdown by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; icon: string; color: string }> = {};

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const name = t.categories?.name || 'Lainnya';
        const icon = t.categories?.icon || '📌';
        const color = t.categories?.color || '#0F766E';

        if (!map[name]) {
          map[name] = { total: 0, icon, color };
        }
        map[name].total += Number(t.amount || 0);
      });

    return Object.entries(map)
      .map(([name, val]) => ({
        name,
        total: val.total,
        icon: val.icon,
        color: val.color,
        percentage: totalExpense > 0 ? Math.round((val.total / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions, totalExpense]);

  // Monthly trend for chart
  const monthlyTrendData = useMemo(() => {
    const monthsMap: Record<string, { income: number; expense: number; sortKey: string }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
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

    return Object.entries(monthsMap)
      .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
      .slice(-6)
      .map(([name, data]) => ({
        name,
        income: data.income,
        expense: data.expense,
      }));
  }, [transactions]);

  // Financial Health Score
  const healthScore = useMemo(() => {
    let score = 50; // base score
    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate > 0) score += 5;
    else score -= 15;

    if (netCashFlow > 0) score += 15;
    else score -= 15;

    if (totalExpense > 0 && totalIncome > 0) {
      if (totalExpense <= totalIncome * 0.7) score += 10;
    }

    return Math.min(100, Math.max(10, score));
  }, [savingsRate, netCashFlow, totalExpense, totalIncome]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data transaksi untuk diekspor');
      return;
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Nominal', 'Kategori', 'Dompet', 'Merchant', 'Catatan'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      tx.amount,
      `"${tx.categories?.name || 'Lainnya'}"`,
      `"${tx.wallets?.name || 'Dompet'}"`,
      `"${tx.merchant || ''}"`,
      `"${tx.note || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cvixedfa_laporan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil diunduh!');
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Laporan Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Analisis arus kas, tren pengeluaran, dan evaluasi kesehatan finansial
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-primary" /> Ekspor CSV
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex rounded-xl bg-muted p-1 max-w-sm">
        <button
          type="button"
          onClick={() => setPeriod('this_month')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            period === 'this_month' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
          }`}
        >
          Bulan Ini
        </button>
        <button
          type="button"
          onClick={() => setPeriod('three_months')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            period === 'three_months' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
          }`}
        >
          3 Bulan
        </button>
        <button
          type="button"
          onClick={() => setPeriod('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            period === 'all' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
          }`}
        >
          Semua Waktu
        </button>
      </div>

      {/* Executive Summary 4 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Pemasukan</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-extrabold text-base sm:text-lg text-emerald-600 truncate">
              {formatRupiah(totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Pengeluaran</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="font-extrabold text-base sm:text-lg text-rose-500 truncate">
              {formatRupiah(totalExpense)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Arus Kas Bersih</span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <p
              className={`font-extrabold text-base sm:text-lg truncate ${
                netCashFlow >= 0 ? 'text-primary' : 'text-rose-500'
              }`}
            >
              {formatRupiah(netCashFlow)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Savings Rate</span>
              <PiggyBank className="w-4 h-4 text-teal-600" />
            </div>
            <p className="font-extrabold text-base sm:text-lg text-foreground truncate">
              {savingsRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Score Banner */}
      <Card className="rounded-2xl bg-gradient-to-r from-teal-900 to-emerald-950 text-white border-0 shadow-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                Financial Health Score
              </span>
              <span className="text-xs text-teal-200">
                {healthScore >= 80 ? '🌟 Sangat Sehat' : healthScore >= 60 ? '👍 Sehat' : '⚠️ Perlu Evaluasi'}
              </span>
            </div>
            <h2 className="text-lg font-bold">
              Skor Kesehatan Finansial: {healthScore} / 100
            </h2>
            <p className="text-xs text-teal-200 max-w-md">
              {savingsRate >= 20
                ? 'Luar biasa! Tingkat tabungan Anda di atas 20% menunjukkan pengelolaan arus kas yang sangat disiplin.'
                : savingsRate > 0
                ? 'Arus kas Anda positif. Tingkatkan alokasi tabungan hingga minimal 20% untuk memperkuat dana darurat.'
                : 'Pengeluaran melebihi pemasukan bulan ini. Coba cek kategori belanja dan pos-pos non-esensial.'}
            </p>
          </div>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 shrink-0 text-xl font-black">
            {healthScore}
          </div>
        </div>
      </Card>

      {/* Visual Charts: Monthly Trend & Category Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trend Bar Chart */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">Tren Arus Kas (6 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {monthlyTrendData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                Belum cukup data tren
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={11} stroke="#888" />
                    <YAxis
                      fontSize={10}
                      stroke="#888"
                      tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Jt`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(Number(val)), '']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Donut */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">Komposisi Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {categoryBreakdown.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                Belum ada pengeluaran di periode ini
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#0F766E'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatRupiah(Number(val)), '']}
                        contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Top 4 Legend */}
                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {categoryBreakdown.slice(0, 4).map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="font-bold shrink-0">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rincian Detail Pengeluaran per Kategori */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Rincian Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Tidak ada data pengeluaran untuk ditampilkan.
            </p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-bold text-foreground">
                      {formatRupiah(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || '#0F766E',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
