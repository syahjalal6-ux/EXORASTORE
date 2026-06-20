/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shop, Product } from '../types';
import { Search, Star, Sparkles, MapPin, ArrowRight, ShieldCheck, HelpCircle, Trophy, ShoppingBag, Eye } from 'lucide-react';

interface ExplorePageProps {
  shops: Shop[];
  products: Product[];
  onSelectShop: (shopId: string) => void;
  followedShopIds: string[];
  onToggleFollow: (shopId: string) => void;
}

export default function ExplorePage({ shops, products, onSelectShop, followedShopIds, onToggleFollow }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Teknologi & Gadget', 'Fashion & Pakaian', 'Kecantikan & Kesehatan', 'Makanan & Minuman'];

  // Filter products or shops based on query
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shop.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shop.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || shop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingProducts = products.filter(p => p.badge === 'Trending' || p.badge === 'Best Seller' || p.rating >= 4.8).slice(0, 4);

  return (
    <div id="explore-view-main" className="space-y-10">
      {/* Dynamic Promo Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white min-h-[220px] md:min-h-[280px] flex items-center p-8 md:p-12 border border-zinc-900 shadow-2xl">
        {/* Abstract background decorative blobs */}
        <div className="absolute right-0 top-0 w-[450px] h-[450px] bg-gradient-to-br from-blue-600/30 via-indigo-600/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-blue-500/20" /> Exora Prime 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight leading-tight">
            Bangun Brand Anda, <span className="text-blue-500">Bukan Sekadar Toko Online</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
            Kelola produk, atur tampilan, dan buat toko online profesional dalam satu tempat. Cepat dibuat, mudah digunakan, siap berkembang bersama bisnis Anda.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5 text-emerald-400">✓ Tanpa biaya tersembunyi</span>
            <span className="flex items-center gap-1.5 text-blue-400">✓ Reward Point aktif</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sticky top-0 z-40 bg-zinc-150/90 backdrop-blur-md py-4 -my-4 border-b border-zinc-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
            <input
              id="global-exploration-search"
              type="text"
              placeholder="Cari toko indie, brand streetwear, mechanical keyboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 text-zinc-800 font-medium transition-all text-sm shadow-sm"
            />
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm' 
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Items Carousel */}
      {searchQuery === '' && selectedCategory === 'Semua' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              🔥 PRODUK POPULER DI EXORA
            </h3>
            <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 pointer-events-none">
              Diperbarui Real-time <Trophy className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingProducts.map((prod) => {
              const owningShop = shops.find(s => s.id === prod.shopId);
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative pt-[80%] overflow-hidden bg-zinc-50 border-b border-zinc-100 shrink-0">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {prod.badge}
                      </span>
                    )}
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-medium rounded-full flex items-center gap-1 select-none">
                      ★ {prod.rating}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {owningShop && (
                        <button
                          type="button"
                          onClick={() => onSelectShop(owningShop.id)}
                          className="text-[10px] text-blue-600 font-mono font-bold uppercase hover:underline text-left block"
                        >
                          {owningShop.name}
                        </button>
                      )}
                      <h4 className="text-xs font-semibold text-zinc-800 line-clamp-2 mt-1 min-h-[32px] group-hover:text-blue-600 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-950">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </span>
                      {owningShop && (
                        <button
                          type="button"
                          onClick={() => onSelectShop(owningShop.id)}
                          className="p-1 px-2.5 bg-zinc-50 hover:bg-zinc-100 text-[10px] text-zinc-700 font-bold rounded-lg transition-all"
                        >
                          Lihat Toko
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Stores */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
          🎙️ DIREKTORI TOKO TERDAFTAR ({filteredShops.length})
        </h3>
        {filteredShops.length === 0 ? (
          <div className="py-12 bg-white rounded-3xl border border-zinc-100 text-center max-w-md mx-auto">
            <HelpCircle className="w-10 h-10 text-zinc-330 mx-auto mb-3 stroke-[1.2]" />
            <h4 className="font-semibold text-zinc-800 text-sm">Tidak Menemukan Toko</h4>
            <p className="text-xs text-zinc-500 mt-1">Coba gunakan kata kunci pencarian yang lain atau ubah kategori filter Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredShops.map((shop) => {
              const isFollowed = followedShopIds.includes(shop.id);
              return (
                <div
                  key={shop.id}
                  className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between p-5 md:p-6"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 select-none overflow-hidden">
                      {shop.logo && (shop.logo.startsWith('http') || shop.logo.startsWith('/') || shop.logo.startsWith('data:')) ? (
                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        shop.logo || '🛍️'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-bold text-base text-zinc-950 truncate max-w-[190px]">{shop.name}</h4>
                        {shop.isCustomDomainActive && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-mono font-bold rounded-md">
                            PRO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-600 hover:underline font-mono font-medium block">
                        {shop.customDomain ? shop.customDomain : `${shop.slug}.exora.shop`}
                      </span>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[36px]">
                        {shop.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Highlights section: Mini Product Overviews inside */}
                  <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-zinc-50">
                    <div className="text-center">
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Rating</span>
                      <span className="text-xs text-zinc-900 font-semibold flex items-center justify-center gap-1 mt-0.5 select-none">
                        ★ {shop.rating}
                      </span>
                    </div>
                    <div className="text-center border-x border-zinc-100">
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Followers</span>
                      <span className="text-xs text-zinc-900 font-semibold mt-0.5 block">
                        {shop.followersCount + (isFollowed ? 1 : 0)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Kategori</span>
                      <span className="text-xs text-zinc-900 truncate font-semibold mt-0.5 block px-0.5">
                        {shop.category.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => onToggleFollow(shop.id)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        isFollowed 
                          ? 'bg-zinc-100 text-zinc-700 border border-zinc-150' 
                          : 'bg-zinc-950 text-white hover:bg-zinc-800'
                      }`}
                    >
                      {isFollowed ? 'Mengikuti' : 'Follow Toko'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => onSelectShop(shop.id)}
                      className="px-4 py-2.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-105 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap lg:shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" /> Kunjungi Toko
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
