'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Target, Calendar, Loader2, Trash2, PiggyBank, X } from 'lucide-react';
import { formatCurrencyInput, formatRupiah, parseRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import { calculateMonthlyContribution } from '@/lib/utils/calculations';
import { toast } from 'sonner';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deposit modal state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/goals');
      const data = await res.json();
      if (data && data.goals && data.goals.length > 0) {
        setGoals(data.goals);
      } else {
        setGoals([]);
      }
    } catch {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleDeleteGoal = async (id: string, name: string) => {
    if (!confirm(`Hapus goal tabungan "${name}"?`)) return;

    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Goal "${name}" berhasil dihapus`);
        setGoals((prev) => prev.filter((g) => g.id !== id));
      } else {
        toast.error('Gagal menghapus goal');
      }
    } catch {
      toast.error('Gagal menghapus goal');
    }
  };

  const handleOpenDeposit = (goal: any) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setIsDepositOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    const num = parseRupiah(depositAmount);
    if (!num || num <= 0) {
      toast.error('Masukkan nominal tabungan yang valid');
      return;
    }

    setIsDepositing(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGoal.id,
          add_amount: num,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan tabungan');

      toast.success(`Berhasil menambah tabungan Rp ${num.toLocaleString('id-ID')} ke "${selectedGoal.name}"!`);
      setIsDepositOpen(false);
      loadGoals();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan tabungan');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Goals Tabungan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Sinking funds & target alokasi tabungan berencana
          </p>
        </div>
        <Button asChild size="sm" className="rounded-xl h-10 px-4 font-semibold shadow-xs">
          <Link href="/goals/new">
            <Plus className="w-4 h-4 mr-1.5" /> Buat Goal
          </Link>
        </Button>
      </div>

      {/* Deposit Modal */}
      {isDepositOpen && selectedGoal && (
        <Card className="rounded-2xl border-primary/30 shadow-md bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 pb-2 border-b border-border/60">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="p-1 rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="w-4 h-4" />
              </span>
              Tambah Tabungan: {selectedGoal.name}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsDepositOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleDepositSubmit} className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Nominal Setoran (Rupiah)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">Rp</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(formatCurrencyInput(e.target.value))}
                  className="pl-11 rounded-xl h-11 text-lg font-bold"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 px-4 text-xs font-semibold"
                onClick={() => setIsDepositOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isDepositing}
                className="rounded-xl h-10 px-5 text-xs font-semibold shadow-xs"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Setoran'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Memuat goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-8 text-center bg-card">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Belum ada target tabungan</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Buat target tabungan pertama Anda (mis. Pajak Mobil, Dana Darurat, Liburan) untuk memantau progress secara rutin.
          </p>
          <Button asChild size="sm" className="rounded-xl h-9 px-4 font-semibold mt-4 shadow-xs">
            <Link href="/goals/new">
              <Plus className="w-4 h-4 mr-1.5" /> Buat Goal Baru
            </Link>
          </Button>
        </Card>
      ) : (
        /* Goal Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const targetAmount = Number(goal.target_amount) || 1;
            const currentAmount = Number(goal.current_amount) || 0;
            const progress = Math.min(100, Math.round((currentAmount / targetAmount) * 100));

            const monthlyNeeded = goal.target_date
              ? calculateMonthlyContribution(targetAmount, currentAmount, goal.target_date)
              : 0;

            const isCompleted = currentAmount >= targetAmount;

            return (
              <Card
                key={goal.id}
                className="rounded-2xl border-border/60 hover:border-border transition-all overflow-hidden shadow-2xs bg-card group"
              >
                <CardContent className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2.5 rounded-2xl bg-muted/60 shrink-0 shadow-2xs">
                        {goal.icon || '🎯'}
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-bold text-base text-foreground truncate">
                          {goal.name}
                        </h2>
                        {goal.target_date && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Target: {formatDateShort(goal.target_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Badge
                        className={
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 font-semibold'
                            : progress >= 50
                            ? 'bg-primary/10 text-primary hover:bg-primary/20 font-semibold'
                            : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold'
                        }
                      >
                        {isCompleted ? 'Tercapai 🎉' : progress >= 50 ? 'On Track' : 'Tertinggal'}
                      </Badge>

                      {/* Tombol Hapus Goal */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 opacity-60 hover:opacity-100 rounded-lg transition-opacity"
                        onClick={() => handleDeleteGoal(goal.id, goal.name)}
                        title="Hapus goal ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar & Amount */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">Progress</span>
                      <span className="font-extrabold text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 rounded-full" />
                    <div className="flex justify-between text-xs pt-1 font-semibold">
                      <span className="text-primary font-bold">
                        {formatRupiah(currentAmount)}
                      </span>
                      <span className="text-muted-foreground">
                        Target {formatRupiah(targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Monthly needed info or congratulations */}
                  {isCompleted ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                      <span>Target tabungan ini sudah tercapai!</span>
                    </div>
                  ) : monthlyNeeded > 0 ? (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Perlu disisihkan:</span>
                      <span className="font-bold text-primary">
                        {formatRupiah(monthlyNeeded)} / bln
                      </span>
                    </div>
                  ) : null}

                  {/* Action: Tambah Tabungan */}
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl h-8 text-xs font-semibold"
                      onClick={() => handleOpenDeposit(goal)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-primary" /> Tambah Tabungan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
