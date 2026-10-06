'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatRupiah } from '@/lib/utils/currency';
import { EmptyState } from '@/components/shared/empty-state';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ExpenseCategoryItem {
  name: string;
  value: number;
  color: string;
}

interface ExpenseDonutProps {
  data: ExpenseCategoryItem[];
}

export function ExpenseDonut({ data }: ExpenseDonutProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<PieChartIcon className="w-8 h-8" />}
            title="Belum ada data"
            description="Pengeluaran bulan ini akan muncul di diagram ini."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold">Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [formatRupiah(Number(val)), 'Total']}
                contentStyle={{
                  backgroundColor: 'rgba(23, 23, 23, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total</span>
            <span className="text-sm font-bold text-foreground">{formatRupiah(total, { compact: true })}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/60">
          {data.slice(0, 6).map((item) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-muted-foreground font-medium">{item.name}</span>
                <span className="ml-auto font-semibold text-foreground">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
