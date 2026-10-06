'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import { calculateMonthlyContribution } from '@/lib/utils/calculations';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialFallback = [
    {
      id: '1',
      name: 'Pajak Kendaraan (PKB)',
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
  ];

  useEffect(() => {
    async function loadGoals() {
      try {
        const res = await fetch('/api/goals');
        const data = await res.json();
        if (data && data.goals && data.goals.length > 0) {
          setGoals(data.goals);
        } else {
          setGoals(initialFallback);
        }
      } catch {
        setGoals(initialFallback);
      } finally {
        setIsLoading(false);
      }
    }
    loadGoals();
  }, []);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Goals Tabungan
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Sinking funds & target alokasi tabungan berencana
          </p>
        </div>
        <Button asChild size="sm" className="rounded-xl h-9">
          <Link href="/goals/new">
            <Plus className="w-4 h-4 mr-1" />
            Buat Goal
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Memuat goals...</span>
        </div>
      ) : (
        /* Goal Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((goal.current_amount / goal.target_amount) * 100)
            );

            const monthlyNeeded = goal.target_date
              ? calculateMonthlyContribution(
                  goal.target_amount,
                  goal.current_amount,
                  goal.target_date
                )
              : 0;

            return (
              <Card
                key={goal.id}
                className="rounded-2xl border-border/60 hover:border-border transition-all"
              >
                <CardContent className="p-4 space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-muted/60">
                        {goal.icon || '🎯'}
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-foreground">
                          {goal.name}
                        </h3>
                        {goal.target_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Target: {formatDateShort(goal.target_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={
                        goal.status === 'on_track'
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                      }
                    >
                      {goal.status === 'on_track' ? 'On Track' : 'Tertinggal'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Progress</span>
                      <span className="font-bold text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                    <div className="flex justify-between text-xs pt-1">
                      <span className="font-semibold text-foreground">
                        {formatRupiah(goal.current_amount)}
                      </span>
                      <span className="text-muted-foreground">
                        Target {formatRupiah(goal.target_amount)}
                      </span>
                    </div>
                  </div>

                  {monthlyNeeded > 0 && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Perlu disisihkan:</span>
                      <span className="font-bold text-primary">
                        {formatRupiah(monthlyNeeded)} / bln
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
