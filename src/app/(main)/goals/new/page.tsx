'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { GOAL_TEMPLATES } from '@/lib/constants';
import { formatCurrencyInput, parseRupiah } from '@/lib/utils/currency';
import { toast } from 'sonner';

export default function NewGoalPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectTemplate = (template: typeof GOAL_TEMPLATES[number]) => {
    setName(template.name);
    setSelectedIcon(template.icon);
    if (template.key === 'pajak') {
      setTargetAmount('4.000.000');
    } else if (template.key === 'servis') {
      setTargetAmount('2.500.000');
    } else if (template.key === 'darurat') {
      setTargetAmount('25.000.000');
    }
  };

  const handleSaveGoal = async () => {
    const amount = parseRupiah(targetAmount);
    if (!name.trim()) {
      toast.error('Nama goal wajib diisi');
      return;
    }
    if (!amount || amount <= 0) {
      toast.error('Target nominal harus lebih dari 0');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          target_amount: amount,
          target_date: targetDate || null,
          icon: selectedIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan goal');
      }

      toast.success('Goal tabungan berhasil dibuat!');
      router.push('/goals');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan goal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-12">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Link href="/goals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Buat Goal Tabungan</h1>
      </div>

      {/* Templates */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Pilih Template Siap Pakai:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              onClick={() => handleSelectTemplate(tpl)}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/50 text-left transition-all"
            >
              <span className="text-xl">{tpl.icon}</span>
              <span className="text-xs font-medium text-foreground truncate">{tpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nama Goal</Label>
            <Input
              placeholder="Mis. Pajak Mobil Tahunan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Target Nominal (Rupiah)</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatCurrencyInput(e.target.value))}
                className="pl-11 text-xl font-bold h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Target Tanggal</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="rounded-xl h-10"
            />
          </div>

          <Button
            onClick={handleSaveGoal}
            disabled={isSaving}
            className="w-full h-11 rounded-xl text-base font-semibold mt-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan Goal...
              </>
            ) : (
              'Simpan Goal'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
