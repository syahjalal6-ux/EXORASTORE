/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shop, ShopTheme } from '../types';
import { ArrowRight, ArrowLeft, Check, Sparkles, Store, Globe, Palette } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface WizardStoreCreateProps {
  onComplete: (newShop: Partial<Shop>) => void;
  onCancel: () => void;
}

export default function WizardStoreCreate({ onComplete, onCancel }: WizardStoreCreateProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Fashion & Pakaian');
  const [logo, setLogo] = useState('🛍️');
  const [theme, setTheme] = useState<ShopTheme>('minimal');
  const [contactEmail, setContactEmail] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  const [slugChecked, setSlugChecked] = useState(false);

  const categories = [
    'Fashion & Pakaian',
    'Teknologi & Gadget',
    'Kecantikan & Kesehatan',
    'Makanan & Minuman',
    'Dekorasi Rumah',
    'Hobi & Kreatif'
  ];

  const themeOptions: { value: ShopTheme; label: string; description: string; preview: string }[] = [
    { value: 'minimal', label: 'Classic Minimalist', description: 'Clean off-white & premium black outline', preview: 'bg-zinc-100 border border-zinc-300 text-zinc-950' },
    { value: 'modern-dark', label: 'Aether Obsidian', description: 'Dark futuristic tech-forward slate', preview: 'bg-zinc-900 border border-zinc-800 text-white' },
    { value: 'neon-cyan', label: 'Synth Cyberpunk', description: 'Glow neon cyan on deep dark navy', preview: 'bg-indigo-950 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]' },
    { value: 'warm-sunset', label: 'Organic Sunset', description: 'Warm beige combined with terracotta rose', preview: 'bg-[#fbf7f2] border border-[#ebdcd0] text-[#3c2f2f]' },
    { value: 'royal-emerald', label: 'Premium Emerald', description: 'Prestigious forest green & royal gold', preview: 'bg-[#00271b] border border-emerald-500/30 text-[#e2b76c]' }
  ];

  const handleSlugChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
    setSlugChecked(false);
  };

  const verifySlug = () => {
    if (!slug) return;
    setIsValidatingSlug(true);
    setTimeout(() => {
      setIsValidatingSlug(false);
      setSlugChecked(true);
    }, 600);
  };

  const nextStep = () => {
    if (step === 1 && !name) return;
    if (step === 2 && (!slug || !slugChecked)) {
      verifySlug();
      setTimeout(() => setStep(3), 700);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete({
      name,
      slug,
      tagline: tagline || 'Toko online persembahan terbaik dari kami.',
      category,
      logo,
      theme,
      contactEmail: contactEmail || `${slug}@exora.shop`,
      contactWhatsapp: contactWhatsapp || '+628123456789',
      followersCount: 0,
      rating: 5.0,
      points: 0,
      isCustomDomainActive: false
    });
  };

  return (
    <div id="store-create-wizard" className="max-w-2xl mx-auto bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden p-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-sans font-semibold text-zinc-900 text-lg">Buat Toko Baru</h2>
            <p className="text-xs text-zinc-500">Mulai bisnis digital Anda dalam hitungan menit</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-zinc-50 rounded-full px-3 py-1 text-xs text-zinc-500 font-mono">
          <span className="text-blue-600 font-semibold">{step}</span>
          <span>/</span>
          <span>4</span>
        </div>
      </div>

      {/* Progressive Step Tracker Indicator */}
      <div className="relative h-1.5 bg-zinc-100 rounded-full mb-10 overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-300 ease-out" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step Contents */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              Langkah 1: Identitas Brand <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />
            </h3>
            <p className="text-sm text-zinc-500">Beri nama toko online Anda dan tentukan konsep produk utama Anda.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="shop-name-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Nama Toko</label>
              <input
                id="shop-name-input"
                type="text"
                placeholder="cth: Stellar Wardrobe, Kopi Sore Bandung"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white text-zinc-800 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="shop-tagline-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Tagline Slogan (Opsional)</label>
              <input
                id="shop-tagline-input"
                type="text"
                placeholder="cth: Streetwear dengan sentuhan masa depan"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white text-zinc-800 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="shop-category-select" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Kategori Utama</label>
              <select
                id="shop-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white text-zinc-800 transition-all text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              Langkah 2: Custom Subdomain <Globe className="w-5 h-5 text-blue-500" />
            </h3>
            <p className="text-sm text-zinc-500">Tentukan alamat unik toko Anda. Semua toko mendapatkan link gratis selamanya.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="shop-slug-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Alamat Link Toko</label>
              <div className="flex items-stretch shadow-sm rounded-2xl overflow-hidden border border-zinc-200">
                <input
                  id="shop-slug-input"
                  type="text"
                  placeholder="namatokomu"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-50 focus:outline-none focus:bg-white text-zinc-800 text-sm font-medium transition-all text-right"
                />
                <div className="bg-zinc-100 text-zinc-500 px-4 flex items-center text-sm font-mono border-l border-zinc-200 select-none">
                  .exora.shop
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Hanya huruf kecil, angka, dan tanda hubung (-). Tanpa spasi.</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="text-xs text-zinc-600 max-w-sm">
                {slug ? (
                  <span>Alamat anda akan menjadi: <strong className="text-zinc-900 font-mono text-sm">{slug}.exora.shop</strong></span>
                ) : (
                  <span>Tulis subdomain di atas untuk memeriksa ketersediaan.</span>
                )}
              </div>
              {slug && (
                <button
                  type="button"
                  onClick={verifySlug}
                  disabled={isValidatingSlug}
                  className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs rounded-xl transition-all font-medium whitespace-nowrap"
                >
                  {isValidatingSlug ? 'Memeriksa...' : slugChecked ? '✓ Tersedia!' : 'Cek Ketersediaan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              Langkah 3: Identitas Tema <Palette className="w-5 h-5 text-indigo-500" />
            </h3>
            <p className="text-sm text-zinc-500">Pilih skema visual awal. Anda dapat memodifikasi seluruh warna & aset kapan saja nanti.</p>
          </div>

          <div className="space-y-5">
            <div>
              <span className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Pilih Emoji Logo Toko</span>
              <div className="flex flex-wrap gap-2 mb-4">
                {['🛍️', '⚡', '🍃', '🪐', '☄️', '🍵', '🍪', '💄', '👟', '🕶️', '💍', '🎮', '📦'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setLogo(emoji)}
                    className={`text-2xl p-3 rounded-2xl border transition-all ${logo === emoji ? 'bg-blue-50 border-blue-500 scale-105' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Atau Gunakan Logo Gambar Kustom Brand Anda (.png, .jpg)</span>
                <ImageUploader
                  images={logo && logo.startsWith('http') ? [logo] : []}
                  onImagesChange={(urls) => {
                    if (urls.length > 0) {
                      setLogo(urls[0]);
                    }
                  }}
                  maxCount={1}
                  label="Tarik & taruh logo gambar kustom brand Anda di sini"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3">Tema Visual Storefront</span>
              <div className="grid grid-cols-1 gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${theme === opt.value ? 'bg-zinc-50 border-blue-500 ring-2 ring-blue-500/10' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                  >
                    <div className="text-left">
                      <span className="text-sm font-semibold text-zinc-900 block">{opt.label}</span>
                      <span className="text-xs text-zinc-500">{opt.description}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-medium font-mono ${opt.preview}`}>
                      Preview UI
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-950">Toko Siap Diluncurkan-!</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Luar biasa! Toko Anda <strong className="text-zinc-800">{name}</strong> siap dibuat dengan tema premium pilihan Anda.
            </p>
          </div>

          <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <span className="text-zinc-500">Nama Toko</span>
              <span className="text-zinc-900 font-semibold text-right">{name}</span>

              <span className="text-zinc-500">Subdomain Link</span>
              <span className="text-blue-600 font-mono font-medium text-right">{slug}.exora.shop</span>

              <span className="text-zinc-500">Kategori Bisnis</span>
              <span className="text-zinc-900 font-medium text-right">{category}</span>

              <span className="text-zinc-500">Tema Terpilih</span>
              <span className="text-zinc-900 text-right capitalize">{theme.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="shop-email-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Email Kontak</label>
              <input
                id="shop-email-input"
                type="email"
                placeholder="business@gmail.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
            <div>
              <label htmlFor="shop-whatsapp-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">WhatsApp Bisnis</label>
              <div className="flex rounded-xl overflow-hidden border border-zinc-200">
                <span className="bg-zinc-100 px-3 flex items-center text-zinc-500 text-xs border-r border-zinc-200 font-mono">+62</span>
                <input
                  id="shop-whatsapp-input"
                  type="text"
                  placeholder="8123456789"
                  value={contactWhatsapp.replace(/^\+62|^0/, '')}
                  onChange={(e) => setContactWhatsapp('+62' + e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-4 py-2.5 bg-zinc-50 focus:outline-none focus:bg-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button controls */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-5 py-3 text-sm text-zinc-650 hover:bg-zinc-50 font-medium rounded-2xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 text-sm text-zinc-400 hover:text-zinc-650 transition-all font-medium"
          >
            Batal
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={step === 1 && !name}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              (step === 1 && !name) 
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-md shadow-zinc-950/10'
            }`}
          >
            Lanjut <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-blue-600/15 transition-all"
          >
            Luncurkan Toko Saya ✨
          </button>
        )}
      </div>
    </div>
  );
}
