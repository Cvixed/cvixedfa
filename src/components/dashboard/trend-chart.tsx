'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { formatRupiah } from '@/lib/utils/currency';
import { EmptyState } from '@/components/shared/empty-state';
import { BarChart3 } from 'lucide-react';

interface MonthlyTrendItem {
  month: string;
  income: number;
  expense: number;
}

interface TrendChartProps {
  data: MonthlyTrendItem[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Tren Arus Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<BarChart3 className="w-8 h-8" />}
            title="Belum ada riwayat"
            description="Tren pemasukan vs pengeluaran akan tergambar seiring berjalannya waktu."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Tren Arus Kas</CardTitle>
          <span className="text-xs text-muted-foreground">6 Bulan Terakhir</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatRupiah(Number(value)),
                  name === 'income' ? 'Pemasukan' : 'Pengeluaran',
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(23, 23, 23, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                formatter={(val) => (val === 'income' ? 'Pemasukan' : 'Pengeluaran')}
              />
              <Bar
                dataKey="income"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="expense"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
