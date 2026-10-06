'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, Moon, Download, Trash2, ChevronRight, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();

  const handleLockApp = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.info('Aplikasi dikunci. Masukkan Google Authenticator untuk masuk kembali.');
      router.push('/auth/totp');
      router.refresh();
    } catch {
      router.push('/auth/totp');
    }
  };

  const sections = [
    {
      title: 'Akun & Profil',
      items: [
        { label: 'Profil Keuangan', icon: <User className="w-4 h-4 text-primary" />, href: '/profile' },
        { label: 'Setup Google Authenticator', icon: <KeyRound className="w-4 h-4 text-emerald-500" />, href: '/auth/totp' },
      ],
    },
    {
      title: 'Tampilan & Preferensi',
      items: [
        { label: 'Mode Gelap / Terang', icon: <Moon className="w-4 h-4 text-amber-500" />, href: '#' },
        { label: 'Sembunyikan Saldo', icon: <Shield className="w-4 h-4 text-teal-500" />, href: '#' },
      ],
    },
    {
      title: 'Data & Privasi',
      items: [
        { label: 'Ekspor Data CSV & PDF', icon: <Download className="w-4 h-4 text-sky-500" />, href: '#' },
        { label: 'Hapus Semua Data / Akun', icon: <Trash2 className="w-4 h-4 text-rose-500" />, href: '#' },
      ],
    },
  ];

  return (
    <div className="space-y-5 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-xs text-muted-foreground">Preferensi aplikasi dan keamanan akun</p>
        </div>
        <Button
          onClick={handleLockApp}
          variant="outline"
          size="sm"
          className="rounded-xl border-border/80 text-xs font-semibold"
        >
          <Lock className="w-3.5 h-3.5 mr-1 text-primary" /> Kunci
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {section.title}
            </h2>
            <Card className="rounded-2xl border-border/60 overflow-hidden divide-y divide-border/50">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted/60">{item.icon}</div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </Card>
          </div>
        ))}
      </div>

      {/* Lock Button Full Width */}
      <Button
        onClick={handleLockApp}
        variant="outline"
        className="w-full h-11 rounded-2xl border-rose-500/20 text-rose-600 hover:bg-rose-500/5 hover:text-rose-700 font-semibold"
      >
        <Lock className="w-4 h-4 mr-2" />
        Kunci Aplikasi CvixedFA Sekarang
      </Button>

      {/* App Version Info */}
      <div className="text-center pt-2 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">CvixedFA</p>
        <p>Cvixed Financial Advisor v1.0.0 (Personal Edition)</p>
        <p className="text-[11px]">Dilindungi dengan 2FA Google Authenticator (RFC 6238)</p>
      </div>
    </div>
  );
}
