'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, QrCode, Lock, ArrowRight, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TotpAuthPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrUrl: string;
    uri: string;
    isConfigured: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input automatically
    inputRefs.current[0]?.focus();
  }, []);

  const handleFetchSetup = async () => {
    try {
      const res = await fetch('/api/auth/totp/setup');
      const data = await res.json();
      setSetupData(data);
      setShowSetup(true);
    } catch {
      toast.error('Gagal memuat informasi setup.');
    }
  };

  const handleChangeDigit = (index: number, val: string) => {
    setErrorMsg('');
    const char = val.replace(/\D/g, '').slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6 && !nextDigits.includes('')) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setDigits(next);

    if (pasted.length === 6) {
      submitCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const submitCode = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Masukkan 6 digit kode dari Google Authenticator');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsSetup) {
          setErrorMsg(data.error);
          handleFetchSetup();
        } else {
          setErrorMsg(data.error || 'Kode salah, silakan coba lagi.');
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
        setIsLoading(false);
        return;
      }

      toast.success('Aplikasi berhasil dibuka!');
      router.push('/');
      router.refresh();
    } catch {
      setErrorMsg('Gagal memverifikasi kode. Periksa koneksi.');
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Secret key disalin ke clipboard');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* App Branding */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              CvixedFA
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Cvixed Financial Advisor • Single Owner Access
            </p>
          </div>
        </div>

        {/* Verification Card */}
        <Card className="rounded-3xl border-border/70 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                Verifikasi Google Authenticator
              </h2>
              <p className="text-xs text-muted-foreground">
                Masukkan 6-digit kode keamanan dari ponsel Anda
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChangeDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className="w-11 h-14 text-center text-xl font-bold rounded-xl border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-muted/40 transition-all"
                />
              ))}
            </div>

            {errorMsg && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Ingat saya di perangkat ini (30 hari)
              </label>
            </div>

            <Button
              onClick={() => submitCode()}
              disabled={isLoading || digits.join('').length !== 6}
              className="w-full h-11 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                'Memverifikasi...'
              ) : (
                <>
                  Buka Kunci CvixedFA <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>

            {/* Setup Trigger */}
            <div className="pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={handleFetchSetup}
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showSetup ? 'Perbarui Setup QR Code' : 'Setup / Scan Google Authenticator'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Setup Dialog / Drawer Card */}
        {showSetup && setupData && (
          <Card className="rounded-3xl border-primary/30 bg-primary/5 text-left p-5 space-y-4 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Setup Google Authenticator</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSetup(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                Tutup
              </button>
            </div>

            <div className="text-center bg-white p-3 rounded-2xl w-fit mx-auto border shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrUrl}
                alt="Google Authenticator QR Code"
                width={190}
                height={190}
                className="mx-auto"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-foreground">Secret Key (Input Manual):</span>
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border font-mono text-[11px] select-all">
                <span className="truncate mr-2 font-bold">{setupData.secret}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1 hover:bg-muted rounded-lg text-primary shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1 bg-card/60 p-3 rounded-xl border border-border/50">
              <p className="font-semibold text-foreground">Langkah:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Buka Google Authenticator di HP Anda.</li>
                <li>Tap <strong>+</strong> lalu <strong>Scan QR code</strong> di atas.</li>
                <li>Simpan kode rahasia di file <code>.env.local</code>:</li>
              </ol>
              <code className="block mt-1 font-mono text-[10px] bg-muted p-1.5 rounded-lg text-foreground font-bold">
                APP_TOTP_SECRET={setupData.secret}
              </code>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
