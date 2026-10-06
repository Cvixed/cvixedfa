import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';

export default function BudgetsPage() {
  const budgets = [
    { category: 'Makan & Minum', icon: '🍽️', spent: 1800000, limit: 2500000 },
    { category: 'Bensin & Transport', icon: '⛽', spent: 1500000, limit: 1600000 },
    { category: 'Belanja & Supermarket', icon: '🛍️', spent: 920000, limit: 1500000 },
    { category: 'Hiburan & Hangout', icon: '🎉', spent: 750000, limit: 800000 },
  ];

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Anggaran Bulanan</h1>
          <p className="text-xs text-muted-foreground">Batas pengeluaran per kategori (Oktober 2026)</p>
        </div>
        <Button size="sm" className="rounded-xl h-9">
          <Plus className="w-4 h-4 mr-1" /> Atur
        </Button>
      </div>

      <div className="space-y-3">
        {budgets.map((b) => {
          const ratio = Math.round((b.spent / b.limit) * 100);
          const isWarning = ratio >= 80 && ratio < 100;
          const isDanger = ratio >= 100;

          return (
            <Card key={b.category} className="rounded-2xl border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{b.icon}</span>
                    <span className="font-semibold text-sm">{b.category}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isDanger
                        ? 'text-rose-600'
                        : isWarning
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {ratio}%
                  </span>
                </div>

                <Progress
                  value={Math.min(100, ratio)}
                  className={`h-2.5 ${isDanger ? '[&>div]:bg-rose-500' : isWarning ? '[&>div]:bg-amber-500' : ''}`}
                />

                <div className="flex justify-between text-xs text-muted-foreground pt-0.5">
                  <span>Terpakai {formatRupiah(b.spent)}</span>
                  <span>Batas {formatRupiah(b.limit)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
