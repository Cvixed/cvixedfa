'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { formatCurrencyInput } from '@/lib/utils/currency';

export default function ProfilePage() {
  const [monthlyIncome, setMonthlyIncome] = useState('8.500.000');
  const [dependents, setDependents] = useState('0');
  const [maritalStatus, setMaritalStatus] = useState('single');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([
    'Reksa Dana Pasar Uang',
    'Emas',
    'SBN Ritel',
  ]);

  const instruments = [
    'Reksa Dana Pasar Uang',
    'Reksa Dana Saham/Obligasi',
    'SBN Ritel (ORI/SR)',
    'Emas Batangan',
    'Deposito Bank',
    'Saham IDX',
  ];

  const toggleInstrument = (item: string) => {
    if (selectedInstruments.includes(item)) {
      setSelectedInstruments(selectedInstruments.filter((i) => i !== item));
    } else {
      setSelectedInstruments([...selectedInstruments, item]);
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Profil Keuangan</h1>
      </div>

      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Data profil ini digunakan secara otomatis oleh <strong>asisten CvixedFA</strong> untuk memberikan simulasi dan rekomendasi finansial yang presisi untuk Anda.
        </p>
      </div>

      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Penghasilan Bersih Bulanan</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(formatCurrencyInput(e.target.value))}
                className="pl-11 text-lg font-bold h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Jumlah Tanggungan</Label>
              <Input
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status Pernikahan</Label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="single">Lajang</option>
                <option value="married">Menikah</option>
                <option value="divorced">Cerai</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Profil Risiko Investasi</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'conservative', label: 'Konservatif' },
                { id: 'moderate', label: 'Moderat' },
                { id: 'aggressive', label: 'Agresif' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRiskTolerance(r.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    riskTolerance === r.id
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border/60 bg-card text-muted-foreground hover:border-border'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Instrumen Diminati</Label>
            <div className="grid grid-cols-2 gap-2">
              {instruments.map((ins) => {
                const checked = selectedInstruments.includes(ins);
                return (
                  <button
                    key={ins}
                    type="button"
                    onClick={() => toggleInstrument(ins)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                      checked
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border/60 bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="truncate mr-1">{ins}</span>
                    {checked && <Check className="w-3.5 h-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Button className="w-full h-11 rounded-xl text-base font-semibold mt-2">
            Perbarui Profil Keuangan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
