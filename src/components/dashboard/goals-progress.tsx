'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import { ChevronRight, Target, Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

interface GoalItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  current_amount: number;
  target_amount: number;
  status: string;
  target_date?: string;
}

interface GoalsProgressProps {
  goals: GoalItem[];
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  if (!goals || goals.length === 0) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Goals Tabungan</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary">
              <Link href="/goals/new">
                <Plus className="w-3.5 h-3.5 mr-1" /> Buat Goal
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Target className="w-8 h-8" />}
            title="Belum ada goals"
            description="Buat target tabungan seperti servis mobil, pajak, atau dana darurat."
            action={{ label: 'Mulai Buat Goal', href: '/goals/new' }}
          />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string, progress: number) => {
    if (progress >= 100 || status === 'completed') {
      return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px]">Tercapai</Badge>;
    }
    if (status === 'behind') {
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-[10px]">Tertinggal</Badge>;
    }
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px]">On Track</Badge>;
  };

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Goals Tabungan</CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/goals">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5 pt-0">
        {goals.slice(0, 3).map((goal) => {
          const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));

          return (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="block p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl p-1.5 rounded-lg bg-card border border-border/50 shadow-2xs">
                    {goal.icon || '🎯'}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight">{goal.name}</h4>
                    {goal.target_date && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Target: {formatDateShort(goal.target_date)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(goal.status, progress)}
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    {formatRupiah(goal.current_amount, { compact: true })} / {formatRupiah(goal.target_amount, { compact: true })}
                  </span>
                  <span className="font-bold text-foreground">{progress}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
