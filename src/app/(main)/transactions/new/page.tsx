'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, ArrowLeft, Sparkles, Check, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { formatCurrencyInput, formatRupiah, parseRupiah } from '@/lib/utils/currency';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';

export default function NewTransactionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [rawAmount, setRawAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Makan & Minum');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  useEffect(() => {
    async function loadWallets() {
      try {
        const res = await fetch('/api/wallets');
        const data = await res.json();
        if (data?.wallets && data.wallets.length > 0) {
          setWallets(data.wallets);
          setSelectedWalletId(data.wallets[0].id);
        }
      } catch (err) {
        console.error('Failed to load wallets:', err);
      }
    }
    loadWallets();
  }, []);

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setRawAmount(formatted);
  };

async function compressImageForOcr(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1200; // Optimal for sharp receipt text & ultra-light payload
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], 'receipt.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      // Compress in browser: reduces 10MB down to ~200KB for instant upload
      const fileToUpload = await compressImageForOcr(file);

      const formData = new FormData();
      formData.append('image', fileToUpload);

      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data && !data.error) {
        setScanResult(data);
        if (data.total) setRawAmount(formatCurrencyInput(data.total.toString()));
        if (data.merchant) setMerchant(data.merchant);
        if (data.suggested_category) setSelectedCategory(data.suggested_category);
        toast.success('Struk berhasil dibaca oleh Gemini AI!');
      } else {
        toast.error(data.error || 'Gagal membaca struk. Menggunakan draft.');
      }
    } catch {
      toast.error('Gagal memproses struk.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveTransaction = async () => {
    const numericAmount = parseRupiah(rawAmount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Masukkan nominal transaksi yang valid');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          category_name: selectedCategory,
          wallet_id: selectedWalletId || null,
          merchant: merchant || (scanResult?.merchant ?? null),
          note: note || (scanResult?.items ? scanResult.items.map((i: any) => i.name).join(', ') : null),
          date: scanResult?.date || new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan transaksi');
      }

      toast.success('Transaksi berhasil disimpan!');
      router.push('/transactions');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-12">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Link href="/transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Catat Transaksi</h1>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid grid-cols-2 rounded-xl mb-4">
          <TabsTrigger value="manual" className="rounded-lg">Manual</TabsTrigger>
          <TabsTrigger value="scan" className="rounded-lg">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" /> Scan Struk AI
          </TabsTrigger>
        </TabsList>

        {/* Scan Mode Tab */}
        <TabsContent value="scan" className="space-y-4">
          <Card className="rounded-2xl border-dashed border-2 border-border/80">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Ambil Foto Struk Belanja</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Gemini AI akan otomatis membaca merchant, tanggal, total, dan kategori belanjaan Anda.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="rounded-xl bg-primary text-primary-foreground font-medium"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisis dengan Gemini AI...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" /> Ambil Foto / Upload Struk
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {scanResult && (
            <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                    <Check className="w-4 h-4" /> Struk Terdeteksi ({scanResult.confidence || 'high'})
                  </div>
                  <span className="text-xs text-muted-foreground">{scanResult.date}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{scanResult.merchant}</p>
                  <p className="text-xs text-muted-foreground">Kategori saran: {scanResult.suggested_category}</p>
                </div>
                {scanResult.items && (
                  <div className="text-xs space-y-1 pt-2 border-t border-emerald-500/20">
                    {scanResult.items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>{it.name}</span>
                        <span>{formatRupiah(it.price || it.total)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-foreground pt-1">
                      <span>Total</span>
                      <span>{formatRupiah(scanResult.total)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSaveTransaction}
                  disabled={isSaving}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-2"
                >
                  {isSaving ? 'Menyimpan...' : 'Konfirmasi & Simpan Transaksi Struk'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manual Mode Tab */}
        <TabsContent value="manual" className="space-y-4">
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setSelectedCategory('Makan & Minum');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setSelectedCategory('Gaji');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-4 space-y-4">
              {/* Amount input */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nominal (Rupiah)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={rawAmount}
                    onChange={handleAmountChange}
                    className="pl-11 text-xl font-bold h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Wallet Picker */}
              {wallets.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Pilih Dompet / Sumber Dana</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {wallets.map((w) => {
                      const isSelected = selectedWalletId === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWalletId(w.id)}
                          className={`flex items-center gap-1.5 p-2 rounded-xl border text-left text-xs transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-border/60 bg-card text-muted-foreground hover:border-border'
                          }`}
                        >
                          <span className="text-base">{w.icon || '💳'}</span>
                          <span className="truncate">{w.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Merchant / Place */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Merchant / Toko / Sumber</Label>
                <Input
                  placeholder="Mis. Warteg, SPBU Pertamina, BCA"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              {/* Category Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pilih Kategori</Label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'border-border/60 bg-card text-muted-foreground hover:border-border'
                        }`}
                      >
                        <span className="text-xl mb-1">{cat.icon}</span>
                        <span className="text-[11px] truncate w-full leading-tight">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Catatan Tambahan</Label>
                <Input
                  placeholder="Catatan opsional..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              <Button
                onClick={handleSaveTransaction}
                disabled={isSaving}
                className="w-full h-11 rounded-xl text-base font-semibold mt-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Transaksi'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
