'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Sparkles,
  User,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Target,
  Wallet,
  Car,
  PieChart,
  CreditCard,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ExecutedActionResult } from '@/lib/ai/types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  executed_actions?: ExecutedActionResult[];
}

const ACTION_SUGGESTIONS = [
  'Beli barang a 50rb, bensin 600rb paylater, goal figurine ironman 1jt',
  'Ganti oli motor 85rb km 15000',
  'Buat dompet baru BCA saldo 1.5jt',
  'Atur budget makan 2jt bulan ini',
  'Berapa dana darurat yang ideal buat saya?',
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Halo! Saya **asisten CvixedFA**, AI financial advisor pribadi Anda.\n\nSekarang Anda bisa langsung mencatat apapun lewat chat! Ketik satu atau beberapa aksi sekaligus, contoh:\n*"saya hari ini beli barang a dengan harga 50rb, lalu saya shopeepaylater bensin sebesar 600rb selama sebulan, saya juga ada goals untuk beli figurine ironman dengan harga 1jt"*\n\nSemua akan langsung saya masukkan otomatis ke Transaksi, Goals, Anggaran, Dompet, dan Kendaraan Anda. Ada yang ingin Anda catat atau tanyakan hari ini?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'Maaf, terjadi kendala saat memproses konsultasi.';
      const executed = data.executed_actions || [];

      if (executed.length > 0) {
        toast.success(`Berhasil mencatat ${executed.length} data finansial otomatis!`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          executed_actions: executed,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf, gagal menghubungi asisten CvixedFA. Periksa koneksi Anda.',
        },
      ]);
      toast.error('Gagal menghubungi asisten');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (cat: string) => {
    switch (cat) {
      case 'transaction':
        return <Receipt className="w-3.5 h-3.5 text-rose-500" />;
      case 'goal':
        return <Target className="w-3.5 h-3.5 text-primary" />;
      case 'wallet':
        return <Wallet className="w-3.5 h-3.5 text-teal-500" />;
      case 'vehicle':
        return <Car className="w-3.5 h-3.5 text-blue-500" />;
      case 'vehicle_service':
        return <Wrench className="w-3.5 h-3.5 text-purple-500" />;
      case 'budget':
        return <PieChart className="w-3.5 h-3.5 text-amber-500" />;
      case 'debt':
        return <CreditCard className="w-3.5 h-3.5 text-orange-500" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5rem)] max-w-2xl mx-auto pb-2">
      {/* Disclaimer Top Bar */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs mb-3 shrink-0">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <p className="leading-tight">
          <strong>CvixedFA Agentic AI:</strong> Chat langsung untuk mencatat transaksi, tabungan, anggaran, & kendaraan secara otomatis.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasActions = msg.executed_actions && msg.executed_actions.length > 0;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                  isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>

              <div
                className={`max-w-[88%] md:max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-tr-xs'
                    : 'bg-card border border-border/70 text-foreground rounded-tl-xs shadow-2xs'
                }`}
              >
                <div>{msg.content}</div>

                {/* Render Executed Actions Card if actions were detected & executed */}
                {hasActions && (
                  <div className="mt-3.5 pt-3 border-t border-border/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{msg.executed_actions!.length} Data Berhasil Disimpan ke Sistem:</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.executed_actions!.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border border-border/50 text-xs gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{getActionIcon(act.category)}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{act.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{act.detail}</p>
                            </div>
                          </div>
                          {act.href && (
                            <Link
                              href={act.href}
                              className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quick navigation pill bar */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                      <Link
                        href="/transactions"
                        className="px-2 py-1 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        💳 Transaksi
                      </Link>
                      <Link
                        href="/goals"
                        className="px-2 py-1 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        🎯 Goals
                      </Link>
                      <Link
                        href="/wallets"
                        className="px-2 py-1 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        💵 Dompet
                      </Link>
                      <Link
                        href="/vehicles"
                        className="px-2 py-1 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        🚗 Kendaraan
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border border-border/70 rounded-2xl p-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>asisten CvixedFA sedang menganalisis & menyimpan data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="py-2 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
        {ACTION_SUGGESTIONS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted text-xs text-muted-foreground hover:text-foreground shrink-0 border border-border/50 transition-all max-w-[280px] truncate"
            title={prompt}
          >
            <Sparkles className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 shrink-0"
      >
        <Input
          placeholder="Ketik pengeluaran, tabungan, mobil, atau tanya saran..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-xl h-11 bg-card border-border/70 flex-1 text-xs md:text-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-11 w-11 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
