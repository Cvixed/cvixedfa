'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Car,
  Bike,
  Plus,
  Calendar,
  Gauge,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrencyInput, formatRupiah, parseRupiah } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Add Vehicle
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState<'car' | 'motorcycle'>('car');
  const [year, setYear] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [taxDueDate, setTaxDueDate] = useState('');
  const [serviceIntervalKm, setServiceIntervalKm] = useState('10000');
  const [serviceIntervalMonths, setServiceIntervalMonths] = useState('6');

  // Modal Add Service
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [serviceType, setServiceType] = useState('Ganti Oli Mesin & Filter');
  const [serviceOdometer, setServiceOdometer] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceNote, setServiceNote] = useState('');
  const [recordAsExpense, setRecordAsExpense] = useState(true);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  // Expanded service history
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (data?.vehicles) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Masukkan nama kendaraan');
      return;
    }

    setIsSubmittingVehicle(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          plate_number: plateNumber.trim() || null,
          type,
          year: year ? Number(year) : null,
          current_odometer: currentOdometer ? Number(currentOdometer) : 0,
          tax_due_date: taxDueDate || null,
          service_interval_km: Number(serviceIntervalKm) || 10000,
          service_interval_months: Number(serviceIntervalMonths) || 6,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kendaraan');

      toast.success('Kendaraan berhasil ditambahkan!');
      setIsAddVehicleOpen(false);
      setName('');
      setPlateNumber('');
      setYear('');
      setCurrentOdometer('');
      setTaxDueDate('');
      loadVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan kendaraan');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id: string, vName: string) => {
    if (!confirm(`Hapus kendaraan "${vName}"?`)) return;
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Kendaraan "${vName}" dihapus`);
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      } else {
        toast.error('Gagal menghapus kendaraan');
      }
    } catch {
      toast.error('Gagal menghapus kendaraan');
    }
  };

  const handleOpenServiceModal = (v: any) => {
    setSelectedVehicle(v);
    setServiceOdometer(v.current_odometer ? v.current_odometer.toString() : '');
    setIsServiceModalOpen(true);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    setIsSubmittingService(true);
    try {
      const costNum = parseRupiah(serviceCost);
      const res = await fetch('/api/vehicles/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.id,
          date: serviceDate,
          odometer: serviceOdometer ? Number(serviceOdometer) : null,
          service_type: serviceType,
          cost: costNum,
          note: serviceNote.trim() || null,
          record_as_expense: recordAsExpense,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan riwayat servis');

      toast.success('Riwayat servis berhasil dicatat!');
      if (recordAsExpense && costNum > 0) {
        toast.info('Biaya servis otomatis dicatat di transaksi pengeluaran');
      }
      setIsServiceModalOpen(false);
      setServiceCost('');
      setServiceNote('');
      loadVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mencatat servis');
    } finally {
      setIsSubmittingService(false);
    }
  };

  // Tax calculations
  const calculateDaysUntilTax = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-5 pb-12 max-w-2xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Kendaraan & Perawatan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pantau jadwal servis berkala, odometer, dan jatuh tempo pajak kendaraan
          </p>
        </div>
        <Button
          onClick={() => setIsAddVehicleOpen(!isAddVehicleOpen)}
          size="sm"
          className="rounded-xl h-10 px-4 font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Kendaraan
        </Button>
      </div>

      {/* Add Vehicle Form Modal */}
      {isAddVehicleOpen && (
        <Card className="rounded-2xl border-primary/30 shadow-md bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 pb-2 border-b border-border/60">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="p-1 rounded-lg bg-primary/10 text-primary">
                <Car className="w-4 h-4" />
              </span>
              Tambah Kendaraan Baru
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsAddVehicleOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleCreateVehicle} className="p-4 space-y-4">
            {/* Tipe Kendaraan */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Tipe Kendaraan</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('car')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    type === 'car'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Mobil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('motorcycle')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    type === 'motorcycle'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Motor</span>
                </button>
              </div>
            </div>

            {/* Nama & Plat Nomor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Nama Kendaraan</Label>
                <Input
                  placeholder="Mis. Honda HR-V, Yamaha NMAX"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Plat Nomor (Opsional)</Label>
                <Input
                  placeholder="Mis. B 1234 XYZ"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  className="rounded-xl h-10 uppercase font-mono"
                />
              </div>
            </div>

            {/* Tahun & Odometer Saat Ini */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Tahun Kendaraan</Label>
                <Input
                  type="number"
                  placeholder="Mis. 2022"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Odometer Saat Ini (KM)</Label>
                <Input
                  type="number"
                  placeholder="Mis. 25000"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            {/* Jatuh Tempo Pajak & Interval Servis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Jatuh Tempo Pajak STNK / PKB</Label>
                <Input
                  type="date"
                  value={taxDueDate}
                  onChange={(e) => setTaxDueDate(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Interval Servis Berkala</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="KM"
                    value={serviceIntervalKm}
                    onChange={(e) => setServiceIntervalKm(e.target.value)}
                    className="rounded-xl h-10 flex-1"
                  />
                  <span className="flex items-center text-xs text-muted-foreground font-semibold">KM</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 px-4 text-xs font-semibold"
                onClick={() => setIsAddVehicleOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingVehicle}
                className="rounded-xl h-10 px-5 text-xs font-semibold shadow-xs"
              >
                {isSubmittingVehicle ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Kendaraan'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Record Service Modal */}
      {isServiceModalOpen && selectedVehicle && (
        <Card className="rounded-2xl border-primary/30 shadow-md bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 pb-2 border-b border-border/60">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="p-1 rounded-lg bg-primary/10 text-primary">
                <Wrench className="w-4 h-4" />
              </span>
              Catat Servis: {selectedVehicle.name}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsServiceModalOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleCreateService} className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Jenis Servis / Perawatan</Label>
              <Input
                placeholder="Mis. Ganti Oli Mesin, Servis 10.000 KM, Ganti Ban"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="rounded-xl h-10"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Tanggal Servis</Label>
                <Input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Odometer Saat Servis (KM)</Label>
                <Input
                  type="number"
                  placeholder="Mis. 20500"
                  value={serviceOdometer}
                  onChange={(e) => setServiceOdometer(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Biaya Servis (Rupiah)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">Rp</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(formatCurrencyInput(e.target.value))}
                  className="pl-11 rounded-xl h-10 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Catatan / Rincian Suku Cadang</Label>
              <Input
                placeholder="Mis. Oli Shell Helix 4L + filter oli original"
                value={serviceNote}
                onChange={(e) => setServiceNote(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={recordAsExpense}
                onChange={(e) => setRecordAsExpense(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-foreground font-medium">
                Otomatis catat biaya ini ke transaksi pengeluaran (Kategori Servis)
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 px-4 text-xs font-semibold"
                onClick={() => setIsServiceModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingService}
                className="rounded-xl h-10 px-5 text-xs font-semibold shadow-xs"
              >
                {isSubmittingService ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Riwayat Servis'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Vehicle List */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Memuat data kendaraan...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-8 text-center bg-card">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Belum ada kendaraan terdaftar</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Tambahkan mobil atau motor Anda untuk mendapatkan pengingat jatuh tempo pajak STNK dan jadwal servis rutin.
          </p>
          <Button
            onClick={() => setIsAddVehicleOpen(true)}
            size="sm"
            className="rounded-xl h-9 px-4 font-semibold mt-4 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Kendaraan Pertama
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => {
            const isCar = v.type === 'car';
            const daysToTax = calculateDaysUntilTax(v.tax_due_date);
            const services = v.vehicle_services || [];
            const isExpanded = expandedVehicleId === v.id;

            // Service interval logic
            const lastOdo = v.last_service_odometer || 0;
            const currentOdo = v.current_odometer || 0;
            const intervalKm = v.service_interval_km || 10000;
            const nextServiceOdo = lastOdo > 0 ? lastOdo + intervalKm : currentOdo + intervalKm;
            const kmRemaining = nextServiceOdo - currentOdo;

            return (
              <Card
                key={v.id}
                className="rounded-2xl border-border/60 hover:border-border transition-all overflow-hidden shadow-2xs bg-card"
              >
                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Top: Name & Plate */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                        {isCar ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-base text-foreground">{v.name}</h2>
                          {v.year && (
                            <span className="text-xs text-muted-foreground">({v.year})</span>
                          )}
                        </div>
                        {v.plate_number && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-zinc-900 text-white font-mono font-bold text-xs tracking-wider border border-zinc-700 shadow-2xs">
                            {v.plate_number}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 rounded-lg"
                        onClick={() => handleDeleteVehicle(v.id, v.name)}
                        title="Hapus kendaraan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Grid Status: Odometer, Pajak, Servis */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Odometer */}
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Gauge className="w-3.5 h-3.5 text-primary" />
                        <span>Odometer Saat Ini</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">
                        {currentOdo.toLocaleString('id-ID')} KM
                      </p>
                    </div>

                    {/* Pajak STNK */}
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        daysToTax !== null && daysToTax <= 30
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                          : 'bg-muted/40 border-border/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>Pajak STNK / PKB</span>
                      </div>
                      <p className="font-bold text-sm">
                        {v.tax_due_date ? formatDateShort(v.tax_due_date) : '-'}
                      </p>
                      {daysToTax !== null && (
                        <p className="text-[11px] font-semibold">
                          {daysToTax > 0
                            ? `${daysToTax} hari lagi`
                            : daysToTax === 0
                            ? 'Hari ini!'
                            : `Terlewat ${Math.abs(daysToTax)} hari`}
                        </p>
                      )}
                    </div>

                    {/* Servis Rutin */}
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Wrench className="w-3.5 h-3.5 text-primary" />
                        <span>Servis Berikutnya</span>
                      </div>
                      <p className="font-bold text-sm text-foreground">
                        {nextServiceOdo.toLocaleString('id-ID')} KM
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {kmRemaining > 0 ? `Sisa ${kmRemaining.toLocaleString('id-ID')} KM` : 'Saatnya servis!'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & History Accordion */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 px-3 text-xs font-semibold"
                      onClick={() => handleOpenServiceModal(v)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-primary" /> Catat Servis
                    </Button>

                    <button
                      type="button"
                      onClick={() => setExpandedVehicleId(isExpanded ? null : v.id)}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 py-1"
                    >
                      <span>Riwayat Servis ({services.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Service History */}
                  {isExpanded && (
                    <div className="pt-2 space-y-2 border-t border-border/40">
                      {services.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Belum ada catatan servis tersimpan untuk kendaraan ini.
                        </p>
                      ) : (
                        services.map((s: any) => (
                          <div
                            key={s.id}
                            className="p-2.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{s.service_type}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatDateShort(s.date)} {s.odometer ? `• ${s.odometer.toLocaleString('id-ID')} KM` : ''}
                              </p>
                              {s.note && <p className="text-[11px] text-muted-foreground mt-0.5">{s.note}</p>}
                            </div>
                            <span className="font-bold text-foreground shrink-0 ml-2">
                              {formatRupiah(s.cost || 0)}
                            </span>
                          </div>
                        ))
                      )}
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
