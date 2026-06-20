/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shop, Product, ShopTheme, Order, ChatMessage } from '../types';
import { THEMES_CONFIG } from '../data/mockData';
import { ArrowLeft, ShoppingCart, MessageSquare, Star, Plus, Minus, Check, Users, Sparkles, Send, ShieldAlert, Truck, Search, Activity, Package, X } from 'lucide-react';
import { biteshipService, ShippingRateOption } from '../lib/biteship';

interface BuyerStoreViewProps {
  shop: Shop;
  products: Product[];
  onBack: () => void;
  onAddOrder: (order: Partial<Order>) => void;
  isFollowed: boolean;
  onToggleFollow: () => void;
  onSendChatMessage: (text: string) => void;
  chatMessages: ChatMessage[];
}

export default function BuyerStoreView({
  shop,
  products,
  onBack,
  onAddOrder,
  isFollowed,
  onToggleFollow,
  onSendChatMessage,
  chatMessages
}: BuyerStoreViewProps) {
  const theme = THEMES_CONFIG[shop.theme] || THEMES_CONFIG.minimal;

  // Shopping Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number; selectedColor?: string; selectedSize?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // Checkout flow state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [lastAssignedOrderId, setLastAssignedOrderId] = useState('');

  // Biteship core states (Cek Ongkir & Lacak Pesanan)
  const [postalCode, setPostalCode] = useState('');
  const [biteshipRates, setBiteshipRates] = useState<ShippingRateOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRateOption | null>(null);
  const [isCalculatingRates, setIsCalculatingRates] = useState(false);

  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackingWaybill, setTrackingWaybill] = useState('');
  const [trackingCourier, setTrackingCourier] = useState('jne');
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [isQueryingTracking, setIsQueryingTracking] = useState(false);

  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  React.useEffect(() => {
    if (selectedProduct) {
      setSelectedColor(selectedProduct.colors && selectedProduct.colors.length > 0 ? selectedProduct.colors[0] : '');
      setSelectedSize(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes[0] : '');
    } else {
      setSelectedColor('');
      setSelectedSize('');
    }
  }, [selectedProduct]);

  // Groq Product AI Assistant States
  const [productAiChatHistory, setProductAiChatHistory] = useState<{ [prodId: string]: { sender: 'buyer' | 'ai'; text: string }[] }>({});
  const [productAiInputText, setProductAiInputText] = useState('');
  const [isProductAiLoading, setIsProductAiLoading] = useState(false);

  const getProductChatMessages = (prodId: string) => {
    return productAiChatHistory[prodId] || [
      { sender: 'ai', text: `Halo! Saya adalah Asisten Belanja Pintar ${shop.name} yang ditenagai oleh Groq AI Llama. Ada yang bisa saya bantu jelaskan mengenai produk premium ini? 🛍️` }
    ];
  };

  const handleQueryProductAi = async (prod: Product, customQuestion?: string) => {
    const questionText = customQuestion || productAiInputText;
    if (!questionText.trim()) return;

    const currentHistory = getProductChatMessages(prod.id);
    const updatedHistoryWithUser = [...currentHistory, { sender: 'buyer', text: questionText }];
    
    // Set immediate UI progress state
    setProductAiChatHistory(prev => ({
      ...prev,
      [prod.id]: updatedHistoryWithUser
    }));
    
    setProductAiInputText('');
    setIsProductAiLoading(true);

    try {
      const customKey = localStorage.getItem('exora_custom_groq_key') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customKey) {
        headers['X-Groq-Api-Key'] = customKey;
      }
      const response = await fetch('/api/groq/product-assistant', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          productName: prod.name,
          productDescription: prod.description,
          productPrice: prod.price,
          question: questionText,
          chatHistory: updatedHistoryWithUser,
          shopPaymentRequisite: shop.paymentRequisite,
          shopAiInstructions: shop.aiInstructions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProductAiChatHistory(prev => ({
          ...prev,
          [prod.id]: [...updatedHistoryWithUser, { sender: 'ai', text: data.answer }]
        }));
      } else {
        setProductAiChatHistory(prev => ({
          ...prev,
          [prod.id]: [...updatedHistoryWithUser, { sender: 'ai', text: 'Maaf, saya sedang kesulitan menghubungi server asisten Groq. Silakan tanyakan hal lain beberapa saat lagi.' }]
        }));
      }
    } catch (err) {
      console.error(err);
      setProductAiChatHistory(prev => ({
        ...prev,
        [prod.id]: [...updatedHistoryWithUser, { sender: 'ai', text: 'Koneksi ke asisten AI terganggu. Silakan cek koneksi Anda.' }]
      }));
    } finally {
      setIsProductAiLoading(false);
    }
  };

  const shopProducts = products.filter(p => p.shopId === shop.id);

  const addToCart = (prod: Product, color?: string, size?: string) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === prod.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );
      if (existing) {
        return prev.map(item => 
          (item.product.id === prod.id && item.selectedColor === color && item.selectedSize === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1, selectedColor: color, selectedSize: size }];
    });
  };

  const updateCartQuantity = (prodId: string, delta: number, color?: string, size?: string) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === prodId && item.selectedColor === color && item.selectedSize === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is { product: Product; quantity: number; selectedColor?: string; selectedSize?: string } => item !== null);
    });
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !buyerPhone || !buyerAddress) return;

    const finalShippingPrice = selectedRate ? selectedRate.price : 0;
    const grandTotal = totalCartPrice + finalShippingPrice;

    const items = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize
    }));

    const pointsEarned = Math.floor(grandTotal / 10000); // 1 point every 10k IDR
    const orderId = 'ORD-' + Math.floor(Math.random() * 900000 + 100000);

    onAddOrder({
      id: orderId,
      shopId: shop.id,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress: `${buyerAddress} (KODE POS: ${postalCode || '-'})`,
      items,
      totalAmount: grandTotal,
      status: 'new',
      pointsEarned,
      createdAt: new Date().toISOString()
    });

    // Compile customized beautiful WhatsApp checkout draft containing items & shipping courier detailed
    const courierStr = selectedRate ? `\n- *Kurir Ekspedisi*: ${selectedRate.courier_name} (${selectedRate.courier_service_name})\n- *Ongkos Kirim*: Rp ${finalShippingPrice.toLocaleString('id-ID')}` : '';
    
    const productItemsStr = cart.map((item, idx) => {
      const variantStr = (item.selectedColor || item.selectedSize)
        ? ` (${[item.selectedColor, item.selectedSize].filter(Boolean).join(', ')})`
        : '';
      return `${idx + 1}. ${item.product.name}${variantStr} (x${item.quantity}) - Rp ${(item.product.price * item.quantity).toLocaleString('id-ID')}`;
    }).join('\n');
    
    const waText = `*Halo, saya ingin memesan produk dari ${shop.name}!*

*Kode Order*: ${orderId}

*Detail Penerima*:
- *Nama Penerima*: ${buyerName}
- *Alamat Kirim*: ${buyerAddress}
- *Kode Pos*: ${postalCode || '-'}
- *Kontak HP*: ${buyerPhone}

*Daftar Belanja*:
${productItemsStr}
${courierStr}

*TOTAL PEMBAYARAN*: *Rp ${grandTotal.toLocaleString('id-ID')}*

Mohon informasikan no. rekening pembayaran admin eksklusif ya. Terima kasih!`;

    const cleanWhatsappNumber = shop.contactWhatsapp.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanWhatsappNumber || '628123456789'}&text=${encodeURIComponent(waText)}`;
    
    // Open WhatsApp in a separate browser tab
    window.open(waUrl, '_blank');

    setLastAssignedOrderId(orderId);
    setCart([]);
    setIsCheckoutSuccess(true);
    setIsCheckingOut(false);
  };

  const handleSendChat = () => {
    if (!newMessage.trim()) return;
    onSendChatMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className={`min-h-screen pb-20 ${theme.bg} ${theme.textMain} transition-all`}>
      {/* Mini Top Banner warning of simulated view */}
      <div className="bg-zinc-950 text-white text-[10px] md:text-xs font-semibold py-1.5 px-4 flex items-center justify-between z-50">
        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-400" /> Mode Pembeli Toko</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsTrackOpen(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 uppercase tracking-wide bg-amber-500/10 px-2 py-0.5 rounded"
          >
            <Activity className="w-3 h-3 animate-ping text-amber-500" /> Lacak Paket Biteship
          </button>
          <button
            type="button"
            onClick={onBack}
            className="underline hover:text-blue-200 text-[10px] uppercase font-bold"
          >
            ← Kembali ke Dashboard Exora
          </button>
        </div>
      </div>

      {/* Styled Responsive Store Banner */}
      <div className="relative h-[180px] md:h-[240px] bg-zinc-900 border-b overflow-hidden">
        <img
          src={shop.banner}
          alt={shop.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        
        {/* Back navigation and Follow trigger */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs rounded-xl hover:bg-black/85 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Cari Toko Lain
          </button>
        </div>

        {/* Floating Cart Button */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="p-3 bg-blue-600 border border-blue-500 text-white rounded-full shadow-lg relative cursor-pointer"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

        {/* Content overlaid inside banner */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-white shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 select-none overflow-hidden">
              {shop.logo && (shop.logo.startsWith('http') || shop.logo.startsWith('/') || shop.logo.startsWith('data:')) ? (
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                shop.logo || '🛍️'
              )}
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight leading-tight">{shop.name}</h1>
                <span className="text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow">
                  ★ {shop.rating}
                </span>
              </div>
              <p className={`text-xs text-zinc-300 ${theme.taglineFont} italic mt-1 max-w-md`}>
                {shop.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFollow}
              className={`p-2 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 border border-white/20 ${
                isFollowed 
                  ? 'bg-emerald-500/80 text-white backdrop-blur-xs' 
                  : 'bg-white text-zinc-950 font-bold hover:bg-zinc-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {isFollowed ? 'Mengikuti' : 'Follow Brand'}
            </button>
          </div>
        </div>
      </div>

      {/* SHOP MULTI-FORMAT ANNOUNCEMENT MODULE */}
      {(shop.announcementText || shop.announcementAudioUrl || shop.announcementVideoUrl) && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-stretch gap-6 text-zinc-900">
            {/* TEXT & AUDIO INFO (LEFT/MAIN COLUMN) */}
            <div className="flex-1 space-y-4 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-850 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200">
                  <span>📢</span> Pengumuman Penting Toko
                </span>
                
                {shop.announcementText ? (
                  <p className="text-zinc-850 text-xs md:text-sm font-semibold leading-relaxed mt-2.5">
                    {shop.announcementText}
                  </p>
                ) : (
                  <p className="text-zinc-500 text-xs italic mt-2.5">
                    Toko menyematkan voice note/media interaktif di bawah ini:
                  </p>
                )}
              </div>

              {/* VOICE AUDIO PLAYER */}
              {shop.announcementAudioUrl && (
                <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      🎵
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-zinc-900 uppercase">Voice Note Penjual</h5>
                      <span className="text-[9px] text-zinc-400 block -mt-0.5">Putar panduan audio</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <audio 
                      src={shop.announcementAudioUrl} 
                      controls 
                      className="w-full h-8 outline-none text-xs"
                      preload="none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO PLAYER (RIGHT COLUMN) */}
            {shop.announcementVideoUrl && (
              <div className="w-full md:w-80 shrink-0 flex flex-col justify-center">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <span>🎥</span> Cuplikan & Unboxing Promo
                </span>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-amber-200 shadow-md bg-zinc-950">
                  <video 
                    src={shop.announcementVideoUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    preload="none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main product catalog */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-bold tracking-tight uppercase mb-6 flex items-center gap-1.5">
          👜 CATALOG PRODUK ({shopProducts.length})
        </h2>

        {shopProducts.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border border-dashed ${theme.border} ${theme.cardBg}`}>
            <ShieldAlert className="w-8 h-8 text-zinc-400 mx-auto mb-2 stroke-[1.2]" />
            <h4 className="font-semibold text-sm">Produk Belum Ditambahkan</h4>
            <p className="text-xs text-zinc-400 mt-1">Gunakan Seller Dashboard untuk mengupload produk pertama Anda!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shopProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className={`group rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
              >
                <div className="relative pt-[90%] overflow-hidden bg-zinc-50 border-b border-zinc-100">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {prod.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                      {prod.badge}
                    </span>
                  )}
                  {prod.stock <= 5 && (
                    <span className="absolute bottom-2 left-2.5 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-md">
                      SISA {prod.stock}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase ${theme.accentText}`}>
                      {prod.category}
                    </span>
                    <h3 className="text-xs md:text-sm font-semibold truncate group-hover:text-blue-500 transition-colors mt-0.5">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100/10">
                    <span className="text-xs md:text-sm font-extrabold">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${theme.accent}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER & FLOATING CHAT */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-4 bg-zinc-950 text-white hover:bg-zinc-800 rounded-full shadow-2xl flex items-center justify-center relative cursor-pointer group"
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
        </button>
      </div>

      {/* Customer Chat Dialog Drawer Pop */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white border border-zinc-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 text-zinc-800">
          <div className="bg-zinc-950 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm select-none overflow-hidden shrink-0">
                {shop.logo && (shop.logo.startsWith('http') || shop.logo.startsWith('/') || shop.logo.startsWith('data:')) ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  shop.logo || '🛍️'
                )}
              </div>
              <div>
                <h4 className="font-bold text-xs">{shop.name} Chat Support</h4>
                <p className="text-[10px] text-emerald-400">● Online - Balas Instan</p>
              </div>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-zinc-50 text-[11px]">
            <div className="bg-zinc-100 p-2.5 rounded-2xl rounded-tl-none max-w-[85%]">
              Halo! Ada yang bisa kami bantu mengenai produk-produk di toko {shop.name}? Tulis pertanyaanmu di bawah ya.
            </div>
            {chatMessages.filter(m => m.shopId === shop.id).map((msg) => (
              <div 
                key={msg.id}
                className={`p-2.5 rounded-2xl max-w-[85%] ${
                  msg.sender === 'buyer' 
                    ? 'bg-blue-600 text-white rounded-tr-none self-end ml-auto' 
                    : 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-zinc-100 flex gap-2">
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-150 rounded-xl focus:outline-none focus:bg-white text-xs"
            />
            <button
              type="button"
              onClick={handleSendChat}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-zinc-900">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[640px]">
            {/* LEFT COLUMN: PRODUCT INFO */}
            <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 border-zinc-100 h-1/2 md:h-auto">
              <div className="relative min-h-[160px] md:min-h-[250px] shrink-0">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
                <div>
                  <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedProduct.category}</span>
                  <h3 className="text-base font-bold text-zinc-950 mt-1">{selectedProduct.name}</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
                    <span className="text-zinc-500">Stok: {selectedProduct.stock} Pcs</span>
                    <span>|</span>
                    <span className="text-zinc-500 flex items-center gap-0.5 font-display">★ {selectedProduct.rating} Rating</span>
                  </div>

                  {/* Dynamic Color Selector */}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Pilih Warna:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                              selectedColor === color
                                ? 'bg-zinc-955 text-white border-zinc-950 bg-zinc-900 shadow-sm'
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Size Selector */}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div className="mt-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Pilih Spesifikasi / Ukuran:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                              selectedSize === size
                                ? 'bg-zinc-955 text-white border-zinc-950 bg-zinc-900 shadow-sm'
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">Harga</span>
                    <span className="text-sm font-extrabold text-zinc-900 font-display">
                      Rp {selectedProduct.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(selectedProduct, selectedColor, selectedSize);
                      setSelectedProduct(null);
                    }}
                    className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer active:scale-98"
                  >
                    Beli Sekarang
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GROQ AI PRODUCT CHAT ASSISTANT */}
            <div className="w-full md:w-1/2 bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-200 flex flex-col h-1/2 md:h-auto overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 bg-white flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900 font-display">Tanya Exora Product AI</h4>
                  <p className="text-[9px] text-zinc-400">Ditenagai oleh Groq Llama-3</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/70">
                {getProductChatMessages(selectedProduct.id).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'buyer' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-zinc-800 border border-zinc-150 rounded-tl-none shadow-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isProductAiLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white text-zinc-500 border border-zinc-150 rounded-2xl p-3 rounded-tl-none text-[10px] flex items-center gap-1.5 shadow-xs">
                      <div className="w-2.5 h-2.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Groq AI sedang mengetik jawaban...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Presets and form */}
              <div className="p-3.5 bg-white border-t border-zinc-200 space-y-2.5 shrink-0">
                {/* presets */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                  {[
                    "Apakah produk ini ready stok?",
                    "Bolehkah minta ringkasan fiturnya?",
                    "Berapa berat & estimasi ongkir?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isProductAiLoading}
                      onClick={() => handleQueryProductAi(selectedProduct, preset)}
                      className="bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-[9px] font-bold px-2.5 py-1.5 rounded-lg border border-zinc-200 transition shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productAiInputText}
                    onChange={(e) => setProductAiInputText(e.target.value)}
                    placeholder="Tanya detail produk di sini..."
                    disabled={isProductAiLoading}
                    className="flex-1 bg-zinc-50 focus:bg-white border border-zinc-200 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs outline-none transition placeholder:text-zinc-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQueryProductAi(selectedProduct);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isProductAiLoading || !productAiInputText.trim()}
                    onClick={() => handleQueryProductAi(selectedProduct)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-xl transition flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md font-bold text-sm hover:scale-105 active:scale-95 transition cursor-pointer z-10 border border-zinc-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 text-zinc-900">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-hidden">
            <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Keranjang Belanjaan
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-zinc-400 hover:text-zinc-650"
                >
                  Tutup ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400">
                  <ShoppingCart className="w-12 h-12 text-zinc-300 stroke-[1.2] mb-3" />
                  <p className="text-sm font-semibold">Keranjang Kosong</p>
                  <p className="text-xs mt-1">Tambahkan produk favorit Anda untuk berbelanja.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="flex gap-4 p-3 border rounded-xl bg-zinc-50 animate-fade-in text-zinc-900">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg bg-zinc-100 border shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-900 truncate">{item.product.name}</h4>
                          {/* VARIANT DISPLAY */}
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedColor && (
                                <span className="bg-zinc-200/75 text-zinc-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 whitespace-nowrap">
                                  <span>🎨</span> {item.selectedColor}
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="bg-zinc-200/75 text-zinc-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 whitespace-nowrap">
                                  <span>📐</span> {item.selectedSize}
                                </span>
                              )}
                            </div>
                          )}
                          <span className="text-xs text-zinc-500 font-extrabold mt-1 block">
                            Rp {item.product.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-lg bg-white overflow-hidden text-xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, -1, item.selectedColor, item.selectedSize)}
                              className="px-2 py-1 hover:bg-zinc-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, 1, item.selectedColor, item.selectedSize)}
                              className="px-2 py-1 hover:bg-zinc-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && !isCheckingOut && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Total Harga</span>
                  <span className="text-base text-zinc-950 font-extrabold">
                    Rp {totalCartPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl text-[11px] text-blue-700 font-medium flex items-center gap-1.5 border border-blue-50">
                  <Sparkles className="w-4 h-4 fill-blue-500/10 shrink-0" />
                  Kamu akan memenangkan <span className="font-extrabold text-blue-600">{Math.floor(totalCartPrice / 10000)} Poin Reward</span> lewat order ini!
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl tracking-wide shadow-md transition"
                >
                  Lanjut Pembayaran
                </button>
              </div>
            )}

            {isCheckingOut && (
              <form onSubmit={handleCheckoutSubmit} className="border-t pt-4 space-y-4 max-h-[70%] overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-zinc-700 uppercase tracking-wider">Form Pengiriman</h4>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Kembali Ke Keranjang
                  </button>
                </div>
                
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label htmlFor="checkout-nama-pembeli" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Nama Penerima</label>
                    <input
                      id="checkout-nama-pembeli"
                      type="text"
                      required
                      placeholder="cth: Ahmad Fauzi"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email-pembeli" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Email</label>
                    <input
                      id="checkout-email-pembeli"
                      type="email"
                      required
                      placeholder="cth: ahmadf@gmail.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-hp-pembeli" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">No. Handphone (WhatsApp)</label>
                    <input
                      id="checkout-hp-pembeli"
                      type="text"
                      required
                      placeholder="cth: 0812345678"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-alamat-pembeli" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Alamat Lengkap</label>
                    <textarea
                      id="checkout-alamat-pembeli"
                      required
                      rows={2}
                      placeholder="cth: Jl. Dago No. 12, Coblong, Bandung"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none resize-none"
                    />
                  </div>

                  {/* Biteship Cek Ongkir Inputs */}
                  <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-150 space-y-2 md:space-y-3">
                    <label htmlFor="checkout-kodepos-pembeli" className="block text-[10px] uppercase font-bold text-zinc-600 mb-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-500" /> Kode Pos (Untuk Ongkir Biteship)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="checkout-kodepos-pembeli"
                        type="text"
                        maxLength={5}
                        placeholder="cth: 40111"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 px-3 py-1.5 bg-white border rounded-lg focus:outline-none text-xs text-center font-mono"
                      />
                      <button
                        type="button"
                        disabled={isCalculatingRates || postalCode.length < 5}
                        onClick={async () => {
                          if (!postalCode) return;
                          setIsCalculatingRates(true);
                          try {
                            const rates = await biteshipService.calculateRates({
                              originPostalCode: '40111',
                              destinationPostalCode: postalCode,
                              weightGrams: 1000,
                              couriers: 'jne,sicepat,jnt'
                            });
                            setBiteshipRates(rates);
                            if (rates.length > 0) {
                              setSelectedRate(rates[0]);
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsCalculatingRates(false);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition disabled:opacity-50"
                      >
                        {isCalculatingRates ? 'Mencari...' : 'Cek Ongkir'}
                      </button>
                    </div>

                    {/* Rates options representation list */}
                    {biteshipRates.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-zinc-200/50">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Kurir Biteship Tersedia:</span>
                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                          {biteshipRates.map((r, idx) => {
                            const isChosen = selectedRate?.courier_code === r.courier_code && selectedRate?.courier_service_name === r.courier_service_name;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedRate(r)}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition ${
                                  isChosen 
                                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' 
                                    : 'bg-white border-zinc-200 text-zinc-750 hover:bg-zinc-50'
                                }`}
                              >
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider block font-black">{r.courier_name}</span>
                                  <span className="text-[9px] text-zinc-500 font-medium block">Servis: {r.courier_service_name} • Est: {r.duration}</span>
                                </div>
                                <span className="font-mono text-xs font-black text-blue-600">Rp {r.price.toLocaleString('id-ID')}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rates detail final calculation summary */}
                {selectedRate && (
                  <div className="border-t border-zinc-150 pt-3 space-y-1.5 text-xs text-zinc-600">
                    <div className="flex justify-between">
                      <span>Subtotal Produk ({totalCartItems} item)</span>
                      <span className="font-mono">Rp {totalCartPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim ({selectedRate.courier_name})</span>
                      <span className="font-mono">Rp {selectedRate.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-zinc-950 font-bold text-sm border-t border-dashed pt-2">
                      <span>Total Tagihan WA</span>
                      <span className="text-blue-600 font-black">Rp {(totalCartPrice + selectedRate.price).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  💬 Selesaikan & Order via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT SUCCESS DIALOG */}
      {isCheckoutSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-zinc-900">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950">Pesanan Sukses Dikirim!</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Selamat, order dengan kode referensi <strong className="text-zinc-800 font-mono text-[11px]">{lastAssignedOrderId}</strong> berhasil masuk ke database dan dialihkan ke WhatsApp seller {shop.name}!
            </p>
            <div className="p-3 bg-emerald-50/50 rounded-2xl text-[10px] text-emerald-700 font-medium">
              Kamu memenangkan Poin Reward lewat transaksi os eksklusif ini!
            </div>
            <button
              onClick={() => {
                setIsCheckoutSuccess(false);
                setIsCartOpen(false);
              }}
              className="w-full py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition"
            >
              Lanjutkan Penjelajahan
            </button>
          </div>
        </div>
      )}

      {/* BITESHIP WAYBILL TRACKER OVERLAY DRAWER */}
      {isTrackOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-zinc-950">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm">Lacak Paket Biteship</h3>
                  <p className="text-[10px] text-zinc-400">Masukkan nomor resi ekspedisimu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTrackOpen(false);
                  setTrackingData(null);
                  setTrackingWaybill('');
                }}
                className="p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label htmlFor="track-waybill-input" className="block text-[8px] uppercase font-bold text-zinc-450 mb-1">Nomor Resi / Waybill</label>
                  <input
                    id="track-waybill-input"
                    type="text"
                    placeholder="cth: SN-88127389"
                    value={trackingWaybill}
                    onChange={(e) => setTrackingWaybill(e.target.value.trim().toUpperCase())}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none text-xs text-center font-mono font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="track-courier-select" className="block text-[8px] uppercase font-bold text-zinc-450 mb-1">Ekspedisi</label>
                  <select
                    id="track-courier-select"
                    value={trackingCourier}
                    onChange={(e) => setTrackingCourier(e.target.value)}
                    className="w-full px-2 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none text-xs font-bold"
                  >
                    <option value="jne">JNE</option>
                    <option value="sicepat">SiCepat</option>
                    <option value="jnt">J&T</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isQueryingTracking || !trackingWaybill}
                onClick={async () => {
                  if (!trackingWaybill) return;
                  setIsQueryingTracking(true);
                  try {
                    const res = await biteshipService.trackOrder(trackingCourier, trackingWaybill);
                    setTrackingData(res);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsQueryingTracking(false);
                  }
                }}
                className="w-full py-2.5 bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {isQueryingTracking ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Lacak Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* Checkpoint Tracking Results list */}
            {trackingData && (
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                  <div>
                    <span className="text-[9px] uppercase font-heavy font-black text-amber-600 block">{trackingData.courier_name}</span>
                    <span className="text-xs font-bold font-mono text-zinc-900">{trackingData.waybill_number}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    trackingData.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800 font-medium'
                  }`}>
                    {trackingData.status}
                  </span>
                </div>

                <div className="space-y-4 relative pl-4 border-l border-zinc-200">
                  {trackingData.checkpoints.map((cp: any, idx: number) => (
                    <div key={idx} className="relative space-y-1">
                      {/* Active green/blue indicators */}
                      <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${
                        idx === 0 ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-zinc-300'
                      }`} />
                      <h4 className={`text-xs font-bold ${idx === 0 ? 'text-zinc-900' : 'text-zinc-600'}`}>{cp.title}</h4>
                      <p className="text-[10px] text-zinc-550 leading-relaxed">{cp.description}</p>
                      <span className="text-[8px] text-zinc-400 font-mono block">
                        {new Date(cp.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
