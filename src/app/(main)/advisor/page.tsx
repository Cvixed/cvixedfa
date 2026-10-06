'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, User, AlertCircle } from 'lucide-react';
import { SUGGESTED_PROMPTS } from '@/lib/constants';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Halo! Saya **asisten CvixedFA**, AI financial advisor pribadi Anda. Saya telah menganalisis ringkasan keuangan Anda bulan ini:\n\n• **Pemasukan:** Rp 8.500.000\n• **Pengeluaran:** Rp 5.200.000\n• **Savings Rate:** 39% (Sangat baik! 👍)\n• **Pengeluaran Terbesar:** Makan & Minum (Rp 1.800.000)\n\nAda yang ingin Anda konsultasikan hari ini? Anda bisa menanyakan tentang alokasi gaji, dana darurat, atau strategi mencapai goals Anda.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (textToSend?: string) => {
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

    // Call /api/ai/chat or fallback gracefully
    setTimeout(() => {
      let responseText = '';
      if (text.toLowerCase().includes('dana darurat')) {
        responseText =
          'Berdasarkan pengeluaran bulanan Anda sebesar **Rp 5.200.000**:\n\n• **Target Ideal (6 bulan):** Rp 31.200.000\n• **Saat ini terkumpul:** Rp 15.000.000 (48%)\n• **Kekurangan:** Rp 16.200.000\n\n💡 **Rekomendasi:**\nDengan sisa arus kas bulanan Anda saat ini (~Rp 3.300.000), Anda dapat mengalokasikan **Rp 1.500.000/bulan** ke Dana Darurat di Reksa Dana Pasar Uang (likuid & imbal hasil 4-5% p.a.). Target akan tercapai dalam **~11 bulan**.\n\n⚠️ *Ini adalah edukasi keuangan, bukan nasihat keuangan berlisensi. CvixedFA tidak menjamin hasil investasi.*';
      } else if (text.toLowerCase().includes('alokasi') || text.toLowerCase().includes('gaji')) {
        responseText =
          'Rekomendasi alokasi gaji bulanan Anda (**Rp 8.500.000**) berdasarkan kerangka 50/30/20 yang disesuaikan:\n\n1. **Kebutuhan Pokok (50%):** Rp 4.250.000 (Makan, bensin, utilitas)\n2. **Keinginan & Hangout (20%):** Rp 1.700.000\n3. **Tabungan & Goals (30%):** Rp 2.550.000\n   - Sinking funds mobil (Pajak + Servis): Rp 650.000\n   - Dana Darurat: Rp 1.500.000\n   - Investasi/Lainnya: Rp 400.000\n\n⚠️ *Ini adalah edukasi keuangan, bukan nasihat keuangan berlisensi. CvixedFA tidak menjamin hasil investasi.*';
      } else {
        responseText =
          `Terima kasih atas pertanyaannya mengenai "${text}". Berdasarkan profil dan transaksi keuangan Anda, fokus utama saat ini sebaiknya menjaga rasio pengeluaran konsumtif di bawah 60% dan memastikan sinking funds untuk pajak mobil serta dana darurat tetap berjalan rutin setiap bulan.\n\n⚠️ *Ini adalah edukasi keuangan, bukan nasihat keuangan berlisensi. CvixedFA tidak menjamin hasil investasi.*`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
        },
      ]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5rem)] max-w-2xl mx-auto pb-2">
      {/* Disclaimer Top Bar */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs mb-3 shrink-0">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <p className="leading-tight">
          <strong>CvixedFA</strong> memberikan edukasi keuangan berbasis data aktual Anda, bukan nasihat keuangan berlisensi.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

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
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-tr-xs'
                    : 'bg-card border border-border/70 text-foreground rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.content}
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
              <span>asisten CvixedFA sedang berpikir...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="py-2 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
        {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted text-xs text-muted-foreground hover:text-foreground shrink-0 border border-border/50 transition-all"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span>{prompt}</span>
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
          placeholder="Tanyakan ke asisten CvixedFA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-xl h-11 bg-card border-border/70 flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-11 w-11 rounded-xl bg-primary text-primary-foreground shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
