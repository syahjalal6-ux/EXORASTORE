/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Gem, Globe, PackageOpen } from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'free' | 'pro';
  onUpgrade: (tier: 'free' | 'pro') => void;
}

export default function BillingModal({ isOpen, onClose, currentTier, onUpgrade }: BillingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Exora Free',
      tagline: 'Sempurna untuk hobi & eksplorasi awal',
      price: 'Rp 0',
      period: 'selamanya',
      features: [
        'Maksimal 25 Produk Aktif',
        'Maksimal 2 Foto per Produk',
        'Alamat Subdomain (.exora.shop)',
        'Notifikasi Poin Standar',
        'Dukungan via Komunitas'
      ],
      icon: <PackageOpen className="w-5 h-5 text-zinc-500" />,
      themeColor: 'border-zinc-200 hover:border-zinc-350 bg-white'
    },
    {
      id: 'starter',
      name: 'Pro Starter (UKM Aktif)',
      tagline: 'Pilihan pas untuk toko yang berkembang pesat',
      price: 'Rp 29.000',
      period: 'bulan',
      features: [
        'Katalog Produk Tanpa Batas',
        'Hingga 5 Foto per Produk',
        'Integrasi Cek Ongkir Biteship',
        'Pelacakan Resi Biteship Instan',
        'Chat Pelanggan Real-Time',
        'Dashboard Ringkasan Penjualan'
      ],
      icon: <Zap className="w-5 h-5 text-blue-500 fill-blue-500/10" />,
      themeColor: 'border-blue-200 bg-blue-50/10 hover:border-blue-400'
    },
    {
      id: 'scale',
      name: 'Pro Scale (Brand Premium)',
      tagline: 'Best Seller! Fitur istimewa untuk branding kuat',
      price: 'Rp 49.000',
      period: 'bulan',
      features: [
        'Semua fitur Pro Starter',
        'Hingga 10 Foto per Produk',
        'Kustom Domain Aktif (.com, .id, .net)',
        'Prioritas CS Support 24/7',
        'Hapus Watermark Exora',
        'Point Rewards Ganda untuk Pembeli'
      ],
      icon: <Gem className="w-5 h-5 text-amber-500 fill-amber-500/10" />,
      themeColor: 'border-amber-200 bg-amber-50/10 hover:border-amber-400 ring-2 ring-amber-400/20'
    },
    {
      id: 'enterprise',
      name: 'Pro Enterprise',
      tagline: 'Kapsul digital lengkap untuk volume bisnis raksasa',
      price: 'Rp 99.000',
      period: 'bulan',
      features: [
        'Produk & Galeri Foto Tanpa Batas',
        'Integrasi biteship Multi-Kurir Prioritas',
        'Multi-Admin Staff (hingga 10 akun)',
        'Compiler APK instan siap rilis Android',
        'Konsultasi Bisnis Khusus Bulanan',
        'Akses API Endpoint Kustom'
      ],
      icon: <Globe className="w-5 h-5 text-[#9333ea] fill-[#9333ea]/10" />,
      themeColor: 'border-purple-200 bg-purple-50/10 hover:border-purple-400'
    }
  ];

  const handleUpdateTier = async (planId: string) => {
    setIsProcessing(true);
    
    if (planId !== 'free') {
      const savedWa = localStorage.getItem('exora_wa_number') || '628831204992';
      const cleanNumber = savedWa.replace(/[^0-9]/g, '');
      const finalNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.slice(1) : cleanNumber;
      
      const planName = plans.find(p => p.id === planId)?.name || 'PRO Premium';
      const formattedMsg = encodeURIComponent(`Halo Admin Exora, saya tertarik untuk upgrade toko saya menggunakan paket *${planName}* dan ingin melakukan aktivasi lisensi. Mohon info nomor rekening pembayarannya ya! Terima kasih.`);
      
      const whatsappUrl = `https://wa.me/${finalNumber}?text=${formattedMsg}`;
      window.open(whatsappUrl, '_blank');
    }

    setTimeout(() => {
      onUpgrade(planId === 'free' ? 'free' : 'pro');
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-zinc-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Closed cross */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5 pr-6">
          <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Upgrade OS Kapsul Tokomu</span>
          <h2 className="text-xl md:text-2xl font-extrabold text-zinc-950 font-sans tracking-tight">Katalog Plan OS Berjenjang</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Hancurkan batas jumlah produk dan foto. Integrasikan sistem cek ongkos kirim Biteship otomatis dan chat real-time instan sekarang juga!
          </p>
        </div>

        {/* Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {plans.map((p) => {
            const isSelected = p.id === 'free' ? currentTier === 'free' : currentTier === 'pro';
            return (
              <div 
                key={p.id} 
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${p.themeColor} ${
                  isSelected ? 'ring-3 ring-blue-500 bg-blue-50/5' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-zinc-50 border rounded-xl">{p.icon}</div>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-zinc-900 leading-snug">{p.name}</h3>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">{p.tagline}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-base font-black text-zinc-950">{p.price}</span>
                    <span className="text-[10px] text-zinc-400 font-mono"> / {p.period}</span>
                  </div>

                  <div className="border-t border-zinc-50 pt-3 space-y-2">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[10px] text-zinc-600">
                        <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    disabled={isProcessing || (p.id === 'free' ? currentTier === 'free' : currentTier === 'pro')}
                    onClick={() => handleUpdateTier(p.id)}
                    className={`w-full py-2 rounded-xl text-[10px] font-bold text-center transition cursor-pointer ${
                      p.id === 'free' && currentTier === 'free' 
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : p.id !== 'free' && currentTier === 'pro' && p.id === 'starter'
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm'
                    }`}
                  >
                    {isProcessing ? 'Memproses...' : isSelected ? 'Plan Aktif Anda' : `Pilih ${p.name.split(' ')[0]}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-zinc-50 text-center flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Garansi 30 Hari Uang Kembali & Jaminan Transaksi Sukses Aman 100%</span>
        </div>

      </div>
    </div>
  );
}
