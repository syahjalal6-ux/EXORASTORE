/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shop, Product, Order, StreamPost, PremiumAddon, AdminUser, RealtimeNotification } from '../types';
import { PREMIUM_ADDONS, THEMES_CONFIG } from '../data/mockData';
import { 
  Trophy, Globe, Settings, Users, Smartphone, Sparkles, TrendingUp, Plus, Trash2, 
  Play, CheckCircle, ShoppingBag, ShoppingCart, MessageSquare, PlusCircle, Edit2, 
  Layers, Lock, Check, Send, Heart, MessageCircle, AlertCircle, Share2, Palette, Download, ExternalLink, Zap
} from 'lucide-react';
import NotificationToast from './NotificationToast';
import ImageUploader from './ImageUploader';

interface SellerDashboardProps {
  currentShop: Shop;
  shops: Shop[];
  products: Product[];
  orders: Order[];
  streamPosts: StreamPost[];
  addons: PremiumAddon[];
  admins: AdminUser[];
  notifications: RealtimeNotification[];
  onUpdateShop: (shop: Shop) => void;
  onAddProduct: (prod: Partial<Product>) => void;
  onUpdateProductStock: (id: string, newStock: number) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onAddStreamPost: (content: string, mediaType?: 'image' | 'audio', mediaUrl?: string) => void;
  onAddStreamComment: (postId: string, comment: string) => void;
  onAddStreamCommentReply: (postId: string, commentId: string, reply: string) => void;
  onLikeStreamPost: (postId: string) => void;
  onSendSellerMessage: (buyerId: string, text: string) => void;
  onToggleAddon: (id: string) => void;
  onAddAdmin: (adm: Partial<AdminUser>) => void;
  onDismissNotification: (id: string) => void;
  onClearNotifications: () => void;
  onTriggerDemoOrder: () => void;
  onOpenBuyerView: () => void;
  currentTier?: 'free' | 'pro';
  onOpenBilling?: () => void;
}

export default function SellerDashboard({
  currentShop,
  shops,
  products,
  orders,
  streamPosts,
  addons,
  admins,
  notifications,
  onUpdateShop,
  onAddProduct,
  onUpdateProductStock,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddStreamPost,
  onAddStreamComment,
  onAddStreamCommentReply,
  onLikeStreamPost,
  onSendSellerMessage,
  onToggleAddon,
  onAddAdmin,
  onDismissNotification,
  onClearNotifications,
  onTriggerDemoOrder,
  onOpenBuyerView,
  currentTier = 'free',
  onOpenBilling
}: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'chat' | 'hub' | 'addons' | 'admins' | 'settings'>('overview');
  
  // Create product form states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('150000');
  const [newProdCategory, setNewProdCategory] = useState('Fashion & Pakaian');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdColors, setNewProdColors] = useState('');
  const [newProdSizes, setNewProdSizes] = useState('');

  // Stream Post form states
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostMedia, setSelectedPostMedia] = useState<'none' | 'image' | 'audio'>('none');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  // Chat conversation choices
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-demo');
  const [sellerReplyText, setSellerReplyText] = useState('');

  // Add-on configs
  const [domainInput, setDomainInput] = useState(currentShop.customDomain || '');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'verified'>('idle');

  // Multi-admin form
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminNameInput, setAdminNameInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminRoleInput, setAdminRoleInput] = useState<'manager' | 'editor' | 'finance'>('manager');

  // PWA/APK compilation visual state
  const [isCompilingApk, setIsCompilingApk] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [compiledApkUrl, setCompiledApkUrl] = useState('');

  // Theme customizer selection
  const [activeThemeSelect, setActiveThemeSelect] = useState(currentShop.theme);

  // Shop Bank and AI Autopilot Instructions states
  const [paymentInput, setPaymentInput] = useState(currentShop.paymentRequisite || '');
  const [logoInput, setLogoInput] = useState(currentShop.logo || '');
  const [aiInstructionsInput, setAiInstructionsInput] = useState(currentShop.aiInstructions || '');
  const [announcementTextInput, setAnnouncementTextInput] = useState(currentShop.announcementText || '');
  const [announcementAudioUrlInput, setAnnouncementAudioUrlInput] = useState(currentShop.announcementAudioUrl || '');
  const [announcementVideoUrlInput, setAnnouncementVideoUrlInput] = useState(currentShop.announcementVideoUrl || '');
  const [isSavingShopSettings, setIsSavingShopSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');



  useEffect(() => {
    setPaymentInput(currentShop.paymentRequisite || '');
    setLogoInput(currentShop.logo || '');
    setAiInstructionsInput(currentShop.aiInstructions || '');
    setAnnouncementTextInput(currentShop.announcementText || '');
    setAnnouncementAudioUrlInput(currentShop.announcementAudioUrl || '');
    setAnnouncementVideoUrlInput(currentShop.announcementVideoUrl || '');
  }, [currentShop]);

  // Groq AI Analytics Consultant states
  const [groqConsultantQuery, setGroqConsultantQuery] = useState('');
  const [groqConsultantResponse, setGroqConsultantResponse] = useState<string>('');
  const [isGroqConsulting, setIsGroqConsulting] = useState(false);
  const [groqConsultantSimulated, setGroqConsultantSimulated] = useState(false);

  // Selected interactive tooltip inside analytics table
  const [activeTooltip, setActiveTooltip] = useState<{ productId: string; metric: string } | null>(null);

  // Selected Daily Sales Chart Bar index for interactive tooltip
  const [selectedChartIndex, setSelectedChartIndex] = useState<number | null>(null);

  // Shop Products & Shop Orders
  const shopProducts = products.filter(p => p.shopId === currentShop.id);
  const shopOrders = orders.filter(o => o.shopId === currentShop.id);

  // Stats calculation
  const totalRevenue = shopOrders
    .filter(o => o.status === 'completed' || o.status === 'processing' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const calculatePointsAwarded = shopOrders.reduce((sum, o) => sum + o.pointsEarned, 0);

  // Groq AI Analytics Consultant API handler
  const handleConsultGroq = async (customQuestion?: string) => {
    const questionText = customQuestion || groqConsultantQuery || "Berikan saya analisis performa bisnis dan 3 langkah strategis utama untuk meningkatkan penjualan minggu ini.";
    setIsGroqConsulting(true);
    setGroqConsultantResponse('');
    
    try {
      const customKey = localStorage.getItem('exora_custom_groq_key') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customKey) {
        headers['X-Groq-Api-Key'] = customKey;
      }
      const response = await fetch('/api/groq/analytics-insights', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          stats: {
            totalSales: totalRevenue,
            totalOrders: shopOrders.length,
            conversionRate: shopOrders.length > 0 ? (Math.min(9.8, 1.2 + (shopOrders.length * 0.4))).toFixed(1) : '0.0',
            activeProductsCount: shopProducts.length,
            currentTier: currentTier
          },
          question: questionText
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroqConsultantResponse(data.answer);
        setGroqConsultantSimulated(!!data.isSimulated);
      } else {
        setGroqConsultantResponse('Gagal mengontak Exora Consultant AI (Groq). Silakan coba lagi nanti.');
      }
    } catch (err) {
      console.error(err);
      setGroqConsultantResponse('Gangguan konektivitas ke server backend Exora. Coba periksa koneksi internet Anda.');
    } finally {
      setIsGroqConsulting(false);
    }
  };

  // Human-crafted basic Markdown viewer
  const parseBoldSegments = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-zinc-950 font-display">{part}</strong>;
      }
      return part;
    });
  };

  const renderFormattedAdvice = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-2.5 text-zinc-700 text-xs leading-relaxed">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-1.5" />;
          
          if (trimmed.startsWith('###')) {
            const heading = trimmed.replace(/^###\s*/, '');
            return (
              <h5 key={i} className="text-zinc-900 font-bold text-xs pt-3 border-b border-zinc-150 pb-1 flex items-center gap-1.5 font-display">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm" />
                {heading}
              </h5>
            );
          }
          
          if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
            const bullet = trimmed.replace(/^[\*\-]\s*/, '');
            return (
              <div key={i} className="flex items-start gap-1.5 pl-2">
                <span className="text-blue-500 shrink-0 select-none">•</span>
                <p className="flex-1 text-[11px] lg:text-xs">
                  {parseBoldSegments(bullet)}
                </p>
              </div>
            );
          }

          if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.')) {
            return (
              <p key={i} className="font-semibold text-zinc-900 pt-1">
                {parseBoldSegments(trimmed)}
              </p>
            );
          }

          return (
            <p key={i} className="text-[11px] lg:text-xs">
              {parseBoldSegments(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Filtered orders pipeline status counts
  const filteredOrders = (status: 'all' | Order['status']) => {
    if (status === 'all') return shopOrders;
    return shopOrders.filter(o => o.status === status);
  };
  const [ordersFilter, setOrdersFilter] = useState<'all' | Order['status']>('all');

  // Submit product
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock) return;

    // Check account tier limits: Free is capped at 25 products max
    if (currentTier === 'free' && shopProducts.length >= 25) {
      alert('Batas katalog produk untuk rentang Akun Free adalah 25 produk. Transisi kustom ke Pro untuk mengunggah produk tanpa batas!');
      if (onOpenBilling) onOpenBilling();
      return;
    }

    const mainImageUrl = newProdImages.length > 0 
      ? newProdImages[0] 
      : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';

    const parsedColors = newProdColors ? newProdColors.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const parsedSizes = newProdSizes ? newProdSizes.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    onAddProduct({
      name: newProdName,
      price: parseInt(newProdPrice) || 0,
      category: newProdCategory,
      stock: parseInt(newProdStock) || 0,
      description: newProdDesc || 'Deskripsi produk premium.',
      imageUrl: mainImageUrl,
      images: newProdImages,
      shopId: currentShop.id,
      colors: parsedColors,
      sizes: parsedSizes,
      rating: 5.0,
      salesCount: 0
    });

    setIsAddingProduct(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdImages([]);
    setNewProdColors('');
    setNewProdSizes('');
  };

  // Publish Stream Post
  const handlePublishPost = () => {
    if (!newPostContent.trim()) return;
    let type: 'image' | 'audio' | undefined = undefined;
    let url = '';

    if (selectedPostMedia === 'image') {
      type = 'image';
      url = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop';
    } else if (selectedPostMedia === 'audio') {
      type = 'audio';
      url = '/assets/seller_voice_guide.mp3';
    }

    onAddStreamPost(newPostContent, type, url);
    setNewPostContent('');
    setSelectedPostMedia('none');
  };

  // Publish comment on Stream Post
  const handleSendComment = (postId: string) => {
    const txt = commentInputs[postId];
    if (!txt?.trim()) return;
    onAddStreamComment(postId, txt);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Publish comment reply on Stream Post
  const handleSendCommentReply = (postId: string, commentId: string) => {
    const txt = replyInputs[commentId];
    if (!txt?.trim()) return;
    onAddStreamCommentReply(postId, commentId, txt);
    setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyBoxId(null);
  };

  // Compile Android APK simulator
  const runApkCompiler = () => {
    setIsCompilingApk(true);
    setBuildLogs([]);
    setCompiledApkUrl('');

    const logSteps = [
      '⚡ [EXORA ENGINE] Inisialisasi wrapper Android SDK...',
      '📦 [BUILD] Mendownload manifest PWA Exora Shop...',
      '🛠️ [COMPILER] Mengonversi aset logo dan splascreen menjadi HD mipmap...',
      '⚙️ [GRADLE] Mengompilasi library bundle Exora Native (WebView v4)...',
      '🔒 [SIGNER] Menandatangani sertifikat rilis APK Exora SHA-256...',
      '🎉 [COMPILER] Membundel paket rilis: exora-app-release.apk sukses!'
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setBuildLogs(prev => [...prev, step]);
        if (index === logSteps.length - 1) {
          setIsCompilingApk(false);
          setCompiledApkUrl(`https://exora.shop/dl/${currentShop.slug}-android.apk`);
        }
      }, (index + 1) * 800);
    });
  };

  // Check Custom Domain Status simulation
  const checkDnsRecords = () => {
    if (!domainInput) return;
    setDomainStatus('checking');
    setTimeout(() => {
      setDomainStatus('verified');
      onUpdateShop({
        ...currentShop,
        customDomain: domainInput,
        isCustomDomainActive: true
      });
    }, 1200);
  };

  // Invite Administrator
  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNameInput || !adminEmailInput) return;

    onAddAdmin({
      name: adminNameInput,
      email: adminEmailInput,
      role: adminRoleInput,
      status: 'invited'
    });

    setIsAddingAdmin(false);
    setAdminNameInput('');
    setAdminEmailInput('');
  };

  // Update theme settings
  const handleThemeUpdate = (selectedTheme: typeof currentShop.theme) => {
    onUpdateShop({
      ...currentShop,
      theme: selectedTheme
    });
  };

  // Save bank details and AI custom guidelines
  const handleSaveShopCustomizations = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingShopSettings(true);
    setSettingsSuccessMsg('');
    
    setTimeout(() => {
      onUpdateShop({
        ...currentShop,
        logo: logoInput,
        paymentRequisite: paymentInput,
        aiInstructions: aiInstructionsInput,
        announcementText: announcementTextInput,
        announcementAudioUrl: announcementAudioUrlInput,
        announcementVideoUrl: announcementVideoUrlInput
      });
      setIsSavingShopSettings(false);
      setSettingsSuccessMsg('✓ Pengaturan Profil Toko, AI Autopilot, Data Bank & Pengumuman berhasil disimpan!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }, 600);
  };



  return (
    <div id="seller-dashboard-portal" className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar navigation */}
      <div className="md:col-span-1 bg-white rounded-3xl border border-zinc-100 p-6 flex flex-col justify-between space-y-8 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-100">
            <div className="w-12 h-12 bg-zinc-950 text-white rounded-2xl flex items-center justify-center text-2xl select-none overflow-hidden shrink-0 border border-zinc-100 shadow-sm">
              {currentShop.logo && (currentShop.logo.startsWith('http') || currentShop.logo.startsWith('/') || currentShop.logo.startsWith('data:')) ? (
                <img src={currentShop.logo} alt={currentShop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentShop.logo || '🛍️'
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-sans font-bold text-zinc-900 text-sm truncate">{currentShop.name}</h3>
              <span className="text-[10px] text-zinc-400 font-medium block">Category: {currentShop.category}</span>
              <button
                type="button"
                onClick={onOpenBuyerView}
                className="text-[10px] text-blue-600 font-mono font-bold flex items-center gap-1 hover:underline mt-1"
              >
                Pratinjau Toko <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Ringkasan', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'products', label: 'Kelola Produk', icon: <Layers className="w-4 h-4" /> },
              { id: 'orders', label: 'Pesanan Toko', icon: <ShoppingBag className="w-4 h-4" /> },
              { id: 'chat', label: 'Chat Pelanggan', icon: <MessageSquare className="w-4 h-4 animate-pulse text-indigo-500" /> },
              { id: 'hub', label: 'Seller Hub Feed', icon: <Trophy className="w-4 h-4" /> },
              { id: 'addons', label: 'Add-on Premium', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
              { id: 'admins', label: 'Tim & Hak Akses', icon: <Users className="w-4 h-4" /> },
              { id: 'settings', label: 'Tema & Domain', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-zinc-950 text-white shadow-sm shadow-zinc-950/10' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Real-time Notifications Toast Panel */}
        <div className="pt-4 border-t border-zinc-50">
          <NotificationToast
            notifications={notifications}
            onDismiss={onDismissNotification}
            onClearAll={onClearNotifications}
          />
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="md:col-span-3 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Account Tier Status Banner */}
            <div className={`rounded-3xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
              currentTier === 'pro' 
                ? 'bg-amber-50/40 border-amber-200' 
                : 'bg-zinc-50 border-zinc-200'
            }`}>
              {currentTier === 'pro' && (
                <div className="absolute right-0 top-0 w-[150px] h-[150px] bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              )}
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-2xl border ${
                  currentTier === 'pro' ? 'bg-amber-100/50 border-amber-300 text-amber-600' : 'bg-zinc-200/50 border-zinc-300 text-zinc-500'
                }`}>
                  <Zap className={`w-5 h-5 ${currentTier === 'pro' ? 'fill-amber-500/20' : ''}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">
                      Merchant Level: {currentTier === 'pro' ? 'Exora Pro (Power User)' : 'Exora Free Trial'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      currentTier === 'pro' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-zinc-250 text-zinc-700'
                    }`}>
                      {currentTier === 'pro' ? 'PRO ACTIVE' : 'FREE'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 max-w-lg">
                    {currentTier === 'pro' 
                      ? 'Selamat! Katalog produk tanpa batas, multiple upload foto, Biteship ongkos kirim otomatis, and real-time chat aktif sepenuhnya!' 
                      : 'Unggah maksimal 25 produk & 2 foto per produk. Hubungkan Biteship & chat pelanggan premium dengan meng-upgrade toko Anda.'}
                  </p>
                </div>
              </div>
              {currentTier === 'free' && (
                <button
                  type="button"
                  onClick={onOpenBilling}
                  className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition whitespace-nowrap active:scale-98"
                >
                  🚀 Upgrade Toko
                </button>
              )}
            </div>

            {/* Simulation controls card */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Simulator Lab</span>
                <h4 className="font-bold text-zinc-900 text-sm">Ingin menguji alur workflow Exora Shop?</h4>
                <p className="text-xs text-zinc-600">Simulasikan pesanan masuk dari pembeli secara instan untuk melacak kemajuan statistik.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onTriggerDemoOrder}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Buat Order Demo (+$1.85M)
                </button>
                <button
                  type="button"
                  onClick={onOpenBuyerView}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" /> Buka Toko Saya
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Pendapatan</span>
                <h3 className="text-lg md:text-xl font-extrabold text-zinc-950">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">↑ 14.5% minggu ini</span>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Pesanan</span>
                <h3 className="text-lg md:text-xl font-extrabold text-zinc-950">{shopOrders.length}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">↑ 8.2% hari ini</span>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Pengikut Toko</span>
                <h3 className="text-lg md:text-xl font-extrabold text-zinc-950">
                  {currentShop.followersCount}
                </h3>
                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">★ Brand Terpercaya</span>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Exora Poin</span>
                <h3 className="text-lg md:text-xl font-extrabold text-zinc-950">{currentShop.points}</h3>
                <span className="text-[10px] text-yellow-600 font-semibold flex items-center gap-1">★ Tingkatkan Add-On</span>
              </div>
            </div>

            {/* AI BUSINESS CONSULTANT CARD (Groq AI Integration) */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border border-indigo-150/70 rounded-3xl p-6 shadow-sm shadow-indigo-100/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-zinc-950 text-sm font-display">Exora AI Business Consultant</h4>
                      <span className="bg-indigo-100 text-indigo-700 font-mono font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-indigo-200">
                        Groq Llama-3 Active
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">Asisten kecerdasan bisnis otomatis untuk memaksimalkan omzet toko Anda</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50/60 rounded-2xl p-4 border border-zinc-150/50 text-xs text-zinc-600 space-y-2">
                <p>
                  AI ini dilatih untuk membaca metrik berjalan toko Anda secara privat. Tanyakan cara menaikkan pengikut, optimalisasi rasio konversi, atau ide peluncuran add-on toko.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGroqConsultantQuery("Berikan saya analisis performa bisnis dan 3 langkah strategis utama untuk meningkatkan penjualan minggu ini.");
                      handleConsultGroq("Berikan saya analisis performa bisnis dan 3 langkah strategis utama untuk meningkatkan penjualan minggu ini.");
                    }}
                    className="bg-white hover:bg-zinc-100 text-zinc-800 font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 cursor-pointer text-[10px] transition"
                  >
                    📊 Analisis Performa & Langkah Taktis
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroqConsultantQuery("Bagaimana cara terbaik untuk mendongkrak rasio konversi toko agar pembeli tidak sekadar melihat produk saja?");
                      handleConsultGroq("Bagaimana cara terbaik untuk mendongkrak rasio konversi toko agar pembeli tidak sekadar melihat produk saja?");
                    }}
                    className="bg-white hover:bg-zinc-100 text-zinc-800 font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 cursor-pointer text-[10px] transition"
                  >
                    📈 Dongkrak Rasio Konversi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroqConsultantQuery("Berikan sbeuah ide program diskon kreatif yang cerdas untuk menarik 50 pembeli baru pertama bulan ini.");
                      handleConsultGroq("Berikan sbeuah ide program diskon kreatif yang cerdas untuk menarik 50 pembeli baru pertama bulan ini.");
                    }}
                    className="bg-white hover:bg-zinc-100 text-zinc-800 font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 cursor-pointer text-[10px] transition"
                  >
                    💡 Ide Diskon Penjualan Baru
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={groqConsultantQuery}
                  onChange={(e) => setGroqConsultantQuery(e.target.value)}
                  placeholder="Ketik pertanyaan bisnis khusus Anda di sini..."
                  className="flex-1 bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-zinc-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConsultGroq();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={isGroqConsulting}
                  onClick={() => handleConsultGroq()}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                >
                  {isGroqConsulting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      Konsultasi...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Tanyai AI
                    </>
                  )}
                </button>
              </div>

              {/* Consultation Response Container */}
              {(isGroqConsulting || groqConsultantResponse) && (
                <div className="bg-white rounded-2xl border border-indigo-100 p-5 mt-2 space-y-3 relative overflow-hidden shadow-inner">
                  {isGroqConsulting ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
                      <p className="text-[11px] font-bold text-zinc-500 font-mono animate-pulse">Menghubungi Exora Cloud Advisor & Menyintesis Wawasan...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Saran Konsultasi Bisnis AI</span>
                        <span className="text-[10px] font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">100% Secured Analyze</span>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto pr-1">
                        {renderFormattedAdvice(groqConsultantResponse)}
                      </div>

                      {groqConsultantSimulated && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-100/60 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                          <span className="shrink-0">⚠️</span>
                          <span>Menggunakan model analitik cadangan. Konfigurasikan <strong className="text-zinc-600">GROQ_API_KEY</strong> untuk konsultasi cloud live Llama-3.</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Custom Interactive Sales Chart */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-950 text-sm">Statistik Penjualan Harian</h4>
                  <p className="text-xs text-zinc-500">Omzet dan transaksi dalam rupiah (Klik bar grafik untuk melihat rincian analitik harian)</p>
                </div>
                <div className="flex bg-zinc-50 rounded-lg p-0.5 text-[10px] font-bold">
                  <span className="px-2.5 py-1 bg-white text-zinc-900 rounded shadow-sm">Bulan Ini</span>
                  <span className="px-2.5 py-1 text-zinc-400 cursor-not-allowed">Minggu Ini</span>
                </div>
              </div>

              {/* Dynamic Responsive SVG Line Chart */}
              <div className="h-44 w-full flex items-end justify-between pt-6 pr-2">
                {[
                  { label: '01 Jun', val: 12, transactions: 2, visitors: 24, text: 'Peluncuran perdana etalase toko menarik minat awal pelanggan lokal Anda secara organik.' },
                  { label: '05 Jun', val: 24, transactions: 5, visitors: 45, text: 'Rekomendasi sosial media berbayar & ulasan positif pembeli perdana mendongkrak minat beli produk.' },
                  { label: '10 Jun', val: 18, transactions: 3, visitors: 31, text: 'Pembelian organik stabil didorong oleh rujukan langsung tautan (referral link) instan di WhatsApp.' },
                  { label: '15 Jun', val: 45, transactions: 8, visitors: 72, text: 'Pemasangan asisten belanja cerdas Exora AI berhasil mendidik prospek & mempercepat konversi keranjang.' },
                  { label: '19 Jun', val: totalRevenue > 0 ? 68 : 30, transactions: Math.max(shopOrders.length, 6), visitors: 110, text: 'Puncak pesanan tertinggi pembayar ritel terdaftar seiring dengan kampanye penayangan promosi akhir pekan.' }
                ].map((pt, idx) => {
                  const isSelected = selectedChartIndex === idx;
                  const estimatedOmzet = pt.val * 35000; // Realistic multiplier
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 relative">
                      <div className="relative w-full flex items-end justify-center h-28">
                        {/* Tooltip Popup on Click directly over the bar */}
                        {isSelected && (
                          <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-30 bg-zinc-950 text-white p-3 rounded-2xl shadow-xl w-48 text-center animate-fade-in text-[10px] space-y-1.5 border border-zinc-805">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                              <span className="font-bold text-zinc-400 font-mono">{pt.label}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedChartIndex(null);
                                }}
                                className="text-zinc-500 hover:text-white font-mono font-bold text-xs"
                              >
                                ×
                              </button>
                            </div>
                            <div className="space-y-1 text-left font-sans">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Total Omzet:</span>
                                <span className="font-bold text-emerald-400 font-mono">Rp {(estimatedOmzet).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Transaksi:</span>
                                <span className="font-bold text-blue-400 font-mono">{pt.transactions} sukses</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Traffic:</span>
                                <span className="font-bold text-indigo-400 font-mono">{pt.visitors} sesi</span>
                              </div>
                            </div>
                            <div className="w-2 h-2 bg-zinc-950 absolute bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-r border-b border-zinc-850"></div>
                          </div>
                        )}

                        {/* Interactive Clickable Bar */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChartIndex(selectedChartIndex === idx ? null : idx);
                          }}
                          className={`w-10 rounded-t-xl transition-all duration-350 ease-out flex items-end justify-center overflow-hidden hover:scale-105 active:scale-95 cursor-pointer relative shadow-sm group ${
                            isSelected 
                              ? 'bg-gradient-to-t from-blue-600 via-indigo-600 to-indigo-700 ring-4 ring-blue-105 shadow-md h-[100%]' 
                              : 'bg-gradient-to-t from-blue-500/80 to-blue-600 hover:from-blue-600 hover:to-indigo-600'
                          }`}
                          style={{ height: `${Math.min(100, Math.max(15, pt.val * 1.5))}%` }}
                        >
                          <span className={`text-[10px] font-black pb-2 font-mono ${isSelected ? 'text-white' : 'text-zinc-100'}`}>
                            {pt.val}%
                          </span>
                        </button>
                      </div>
                      <span className={`text-[10px] font-mono font-bold transition-colors ${isSelected ? 'text-blue-600 font-black' : 'text-zinc-400'}`}>
                        {pt.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Breakdown for Clicked Bar */}
              {selectedChartIndex !== null && (() => {
                const pt = [
                  { label: '01 Jun', val: 12, transactions: 2, visitors: 24, text: 'Peluncuran perdana etalase toko menarik minat awal pelanggan lokal Anda secara organik.' },
                  { label: '05 Jun', val: 24, transactions: 5, visitors: 45, text: 'Rekomendasi ulasan post dari pembeli perdana serta promosi mandiri media sosial berhasil melipatgandakan omzet harian.' },
                  { label: '10 Jun', val: 18, transactions: 3, visitors: 31, text: 'Pembelian organik stabil terus mengalir didorong oleh rujukan langsung tautan (referral link) instan di grup komunikasi WhatsApp.' },
                  { label: '15 Jun', val: 45, transactions: 8, visitors: 72, text: 'Pemasangan asisten belanja cerdas Exora AI memangkas kendala skeptis pembeli, meningkatkan conversion rate secara signifikan.' },
                  { label: '19 Jun', val: totalRevenue > 0 ? 68 : 30, transactions: Math.max(shopOrders.length, 6), visitors: 110, text: 'Puncak pesanan akhir pekan tertinggi seiring dengan pemberlakuan kupon gratis biaya kirim Biteship otomatis.' }
                ][selectedChartIndex];
                const revenueAmount = pt.val * 35000;
                return (
                  <div className="bg-gradient-to-r from-zinc-50 to-blue-50/20 border border-zinc-100 rounded-2xl p-4.5 animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 animate-pulse">
                        <span className="p-1 px-1.5 bg-blue-100 text-blue-800 text-[9px] font-black font-mono rounded-md uppercase">Rincian Analitik • {pt.label}</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-semibold">Klik batang diagram lain untuk membandingkan</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-sans font-medium">
                        {pt.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 bg-white p-3 rounded-xl border border-zinc-150 shadow-3xs">
                      <div>
                        <span className="text-[9px] text-zinc-400 block font-mono font-bold uppercase">Estimasi Hasil</span>
                        <span className="text-xs font-black text-emerald-600 font-mono">Rp {revenueAmount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-px h-8 bg-zinc-200"></div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block font-mono font-bold uppercase">Rasio Sukses</span>
                        <span className="text-xs font-black text-zinc-900 font-mono">{((pt.transactions / pt.visitors) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* INTERACTIVE STORE SALES & PRODUCT ANALYTICS TABLE */}
            <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm space-y-4">
              <div className="p-5 border-b border-zinc-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-zinc-50 to-white">
                <div>
                  <h4 className="font-bold text-zinc-950 text-sm flex items-center gap-2">
                    <span className="p-1 px-2 bg-blue-100 text-blue-800 text-[10px] font-bold font-mono rounded-md uppercase">Live</span>
                    Tabel Analitik Kinerja Produk
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Pantau rasio konversi dan peluang pertumbuhan. Klik setiap angka atau rekomendasi untuk memunculkan wawasan detail.</p>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono font-medium shrink-0 flex items-center gap-1">
                  <span>💡 Klik sel untuk deskripsi interaktif & saran AI</span>
                </div>
              </div>

              {shopProducts.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs font-sans">
                  Belum ada produk untuk ditampilkan di tabel analitik. Silakan tambahkan produk baru di tab Kelola Produk.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-auto text-xs">
                    <thead>
                      <tr className="bg-zinc-50/70 border-b border-zinc-100 text-zinc-400 text-[10px] uppercase tracking-wider font-mono font-bold">
                        <th className="py-3 px-5">Produk</th>
                        <th className="py-3 px-4 text-center cursor-help animate-pulse" title="Klik angka untuk rincian pengunjung">Pengunjung 🖱️</th>
                        <th className="py-3 px-4 text-center cursor-help animate-pulse" title="Klik persentase untuk rincian konversi">Rasio Konversi 📈</th>
                        <th className="py-3 px-4 text-center cursor-help animate-pulse" title="Klik volume untuk rincian unit">Unit Terjual 📦</th>
                        <th className="py-3 px-4 text-right cursor-help animate-pulse" title="Klik angka untuk rincian keuntungan">Estimasi Omzet 💰</th>
                        <th className="py-3 px-5 text-right cursor-help animate-pulse" title="Klik badge untuk riset instan AI">Rekomendasi AI 🤖</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {shopProducts.map((prod) => {
                        // Stable seed generation for realistic and consistent mock analytics
                        const stableSeed = Array.from(prod.name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const clicks = 95 + (stableSeed % 180) + (prod.salesCount * 6);
                        const conversionRate = clicks > 0 ? ((prod.salesCount / clicks) * 100).toFixed(1) : "0.0";
                        const revenue = prod.price * prod.salesCount;

                        // Rating & performance badges
                        let score = "Sangat Baik";
                        let scoreBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-100";
                        let rincianSolusi = "Kinerja konversi optimal! Pertahankan tingkat persediaan dan optimalkan kata kunci penelusuran produk.";
                        
                        if (parseFloat(conversionRate) < 1.0) {
                          score = "Saran Perubahan";
                          scoreBadgeColor = "bg-rose-50 text-rose-800 border-rose-100";
                          rincianSolusi = "Konversi rendah. Pertimbangkan untuk merevisi kualitas gambar sampul, menyederhanakan teks deskripsi, atau mengurangi harga 5-10% untuk memicu minat awal pembeli.";
                        } else if (parseFloat(conversionRate) < 2.5) {
                          score = "Butuh Dorongan";
                          scoreBadgeColor = "bg-zinc-100 text-zinc-700 border-zinc-200";
                          rincianSolusi = "Jumlah pengunjung melimpah, namun konversinya tersendat. Coba aktifkan asisten auto-chat pintar untuk langsung menjawab keraguan calon klien di checkout.";
                        } else if (parseFloat(conversionRate) < 5.0) {
                          score = "Berkinerja Baik";
                          scoreBadgeColor = "bg-blue-50 text-blue-800 border-blue-100";
                          rincianSolusi = "Produk berkinerja stabil dan menyumbangkan penjualan teratur. Berikan program gratis ongkos kirim (Biteship Integration) untuk mendorong batas penjualan massal.";
                        } else {
                          score = "Bintang Toko";
                          scoreBadgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                          rincianSolusi = "Luar biasa! Konversi produk Anda jauh di atas rata-rata pasar lokal. Tingkatkan kuota restock inventaris dan tandai sebagai Produk Unggulan di halaman depan toko.";
                        }

                        return (
                          <React.Fragment key={prod.id}>
                            <tr className="hover:bg-zinc-50/50 transition-all duration-150 group">
                              {/* DETAIL PRODUK */}
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={prod.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150"} 
                                    alt={prod.name} 
                                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-150 transition group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <span className="font-bold text-zinc-900 block truncate leading-tight group-hover:text-blue-600 transition">{prod.name}</span>
                                    <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">{prod.category}</span>
                                  </div>
                                </div>
                              </td>

                              {/* PENGUNJUNG (CLICKS) */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTooltip(
                                      activeTooltip?.productId === prod.id && activeTooltip?.metric === 'clicks'
                                        ? null
                                        : { productId: prod.id, metric: 'clicks' }
                                    );
                                  }}
                                  className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md transition duration-200 active:scale-95 ${
                                    activeTooltip?.productId === prod.id && activeTooltip?.metric === 'clicks'
                                      ? 'bg-blue-600 text-white font-black shadow-xs ring-2 ring-blue-300'
                                      : 'hover:bg-zinc-100 text-zinc-800'
                                  }`}
                                >
                                  {clicks}
                                </button>
                              </td>

                              {/* RASIO KONVERSI */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTooltip(
                                      activeTooltip?.productId === prod.id && activeTooltip?.metric === 'conversion'
                                        ? null
                                        : { productId: prod.id, metric: 'conversion' }
                                    );
                                  }}
                                  className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md transition duration-200 active:scale-95 ${
                                    activeTooltip?.productId === prod.id && activeTooltip?.metric === 'conversion'
                                      ? 'bg-indigo-600 text-white font-black shadow-xs ring-2 ring-indigo-300'
                                      : 'hover:bg-zinc-105 hover:text-indigo-600 text-indigo-500 bg-indigo-50/50'
                                  }`}
                                >
                                  {conversionRate}%
                                </button>
                              </td>

                              {/* UNIT TERJUAL */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTooltip(
                                      activeTooltip?.productId === prod.id && activeTooltip?.metric === 'sales'
                                        ? null
                                        : { productId: prod.id, metric: 'sales' }
                                    );
                                  }}
                                  className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md transition duration-200 active:scale-95 ${
                                    activeTooltip?.productId === prod.id && activeTooltip?.metric === 'sales'
                                      ? 'bg-zinc-900 text-white font-black shadow-xs'
                                      : 'hover:bg-zinc-100 text-zinc-700'
                                  }`}
                                >
                                  {prod.salesCount} unit
                                </button>
                              </td>

                              {/* ESTIMASI OMZET */}
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTooltip(
                                      activeTooltip?.productId === prod.id && activeTooltip?.metric === 'revenue'
                                        ? null
                                        : { productId: prod.id, metric: 'revenue' }
                                    );
                                  }}
                                  className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md transition duration-200 active:scale-95 ${
                                    activeTooltip?.productId === prod.id && activeTooltip?.metric === 'revenue'
                                      ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-300'
                                      : 'hover:bg-zinc-100 text-zinc-900'
                                  }`}
                                >
                                  Rp {revenue.toLocaleString('id-ID')}
                                </button>
                              </td>

                              {/* TINDAKAN / REKOMENDASI AI */}
                              <td className="py-3 px-5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTooltip(
                                      activeTooltip?.productId === prod.id && activeTooltip?.metric === 'ai-recs'
                                        ? null
                                        : { productId: prod.id, metric: 'ai-recs' }
                                    );
                                  }}
                                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition duration-250 ${scoreBadgeColor} active:scale-95 hover:brightness-95 shadow-2xs`}
                                >
                                  {score} →
                                </button>
                              </td>
                            </tr>

                            {/* ANIMATED INTERACTIVE TOOLTIP DRAWER ON CLICK */}
                            {activeTooltip?.productId === prod.id && (
                              <tr className="bg-zinc-50/50">
                                <td colSpan={6} className="bg-zinc-50/70 p-0 border-b border-zinc-150">
                                  <div className="p-5 space-y-4 animate-fade-in border-l-4 border-l-zinc-950">
                                    {/* Header tooltip */}
                                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                                        <span>📊 Insight Analitik Kinerja</span>
                                        <span>•</span>
                                        <span className="text-zinc-650">{prod.name}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setActiveTooltip(null)}
                                        className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-700 transition font-bold"
                                      >
                                        Tutup ×
                                      </button>
                                    </div>

                                    {/* TOOLTIP CONTENT BASED ON SELECTOR */}
                                    {activeTooltip.metric === 'clicks' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <h5 className="font-extrabold text-zinc-800 text-xs">Asal Saluran Pengunjung (Traffic Source)</h5>
                                          <div className="space-y-1.5 text-[11px]">
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">💬 Tautan Berbagi WhatsApp / Telegram</span>
                                              <span className="font-bold font-mono text-zinc-900">40% ({Math.round(clicks * 0.4)} klik)</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">📸 Bio Profil Instagram / TikTok</span>
                                              <span className="font-bold font-mono text-zinc-900">35% ({Math.round(clicks * 0.35)} klik)</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">🌐 Pencarian Organik Google & SEO</span>
                                              <span className="font-bold font-mono text-zinc-900">15% ({Math.round(clicks * 0.15)} klik)</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">✨ Referral Internal Exora Marketplace</span>
                                              <span className="font-bold font-mono text-zinc-900">10% ({Math.round(clicks * 0.1)} klik)</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col justify-center space-y-1.5">
                                          <span className="text-[9px] font-bold text-blue-700 uppercase font-mono">Formula Optimalisasi</span>
                                          <h5 className="font-bold text-blue-900 text-xs">Ingin mendongkrak total pengunjung produk?</h5>
                                          <p className="text-[11px] text-blue-800 leading-normal">
                                            Manfaatkan integrasi rujukan link dari WhatsApp rujukan atau perbarui SEO deskripsi produk Anda dengan menyisipkan kata kunci berminat tinggi. Klik tab "Tema & Domain" untuk menyunting metadata sosial media Anda!
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {activeTooltip.metric === 'conversion' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <h5 className="font-extrabold text-zinc-800 text-xs">Alur Keranjang & Pembayaran (Sales Funnel)</h5>
                                          <div className="space-y-1.5 text-[11px]">
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">🛒 Meninjau Detail Halaman & Grid</span>
                                              <span className="font-bold font-mono text-zinc-900">100% ({clicks} views)</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">🛍️ Menambahkan ke Tas Belanja / Keranjang</span>
                                              <span className="font-bold font-mono text-zinc-950">{(parseFloat(conversionRate) * 2.2).toFixed(1)}% ({Math.round(clicks * parseFloat(conversionRate) * 2.2 / 100)} user)</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">💳 Selesai Checkout & Mengirim Konfirmasi</span>
                                              <span className="font-bold font-mono text-emerald-600">{conversionRate}% ({prod.salesCount} sukses)</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col justify-center space-y-1.5">
                                          <span className="text-[9px] font-bold text-indigo-700 uppercase font-mono">Formula Mengatasi Keranjang Terbengkalai</span>
                                          <h5 className="font-bold text-indigo-900 text-xs">Rasio Konversi Saat Ini: {conversionRate}%</h5>
                                          <p className="text-[11px] text-indigo-805 leading-normal">
                                            Pembeli yang menambahkan ke keranjang sering tertahan karena skeptis ongkos kirim. Konfigurasikan add-on Biteship logistik interaktif untuk meminimalkan beban ini, atau tawarkan opsi kupon diskon pembeli pertama!
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {activeTooltip.metric === 'sales' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <h5 className="font-extrabold text-zinc-800 text-xs">Statistik Volume Distribusi Pesanan</h5>
                                          <div className="space-y-1.5 text-[11px]">
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">Bulan Juni 2026</span>
                                              <span className="font-bold font-mono text-zinc-900">{prod.salesCount} unit</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">Target Penjualan Produk Mingguan</span>
                                              <span className="font-bold font-mono text-zinc-500">8 / 10 unit</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 text-rose-50 rounded-lg border border-rose-100 shadow-xs">
                                              <span className="text-rose-700 font-semibold flex items-center gap-1">⚠️ Sisa Stok Tersimpan</span>
                                              <span className="font-bold font-mono text-rose-800">{prod.stock} unit</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="p-4 bg-zinc-900 text-white rounded-2xl flex flex-col justify-center space-y-1.5">
                                          <span className="text-[9px] font-bold text-blue-400 uppercase font-mono">Manajemen Inventaris Cerdas</span>
                                          <h5 className="font-bold text-xs text-zinc-100">Keseimbangan Stok vs Penjualan</h5>
                                          <p className="text-[11px] text-zinc-300 leading-normal">
                                            Stok produk tersisa sebanyak <strong>{prod.stock} unit</strong>. Atur alarm notifikasi stok menipis pada pengaturan notifikasi agar Anda tidak pernah melewatkan momentum pesanan mendadak dari para pembayar ritel.
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {activeTooltip.metric === 'revenue' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <h5 className="font-extrabold text-zinc-800 text-xs">Breakdown Kontribusi Keuangan Toko</h5>
                                          <div className="space-y-1.5 text-[11px]">
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">Total Pendapatan Produk Ini</span>
                                              <span className="font-bold font-mono text-emerald-600">Rp {revenue.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">Rata-rata Margin Bersih (Estimasi 30%)</span>
                                              <span className="font-bold font-mono text-zinc-800">Rp {Math.round(revenue * 0.3).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100 shadow-xs">
                                              <span className="text-zinc-500 font-medium">Kontribusi terhadap Omzet Global Toko</span>
                                              <span className="font-bold font-mono text-blue-600">
                                                {((revenue / (totalRevenue || 1)) * 100).toFixed(1)}%
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex flex-col justify-center space-y-1.5">
                                          <span className="text-[9px] font-bold text-emerald-700 uppercase font-mono">Strategi Maksimisasi Omzet</span>
                                          <h5 className="font-bold text-emerald-900 text-xs">Rp {revenue.toLocaleString('id-ID')} Dikumpulkan</h5>
                                          <p className="text-[11px] text-emerald-800 leading-normal">
                                            Produk ini memberikan kontribusi sebesar <strong>{((revenue / (totalRevenue || 1)) * 100).toFixed(0)}%</strong> dari total kas bisnis. Buat promo pelipatgandakan nilai belanja (upselling) dengan membundel barang komplementer lainnya!
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {activeTooltip.metric === 'ai-recs' && (
                                      <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 space-y-2">
                                        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                                          <span>🤖 Wawasan Khusus Asisten AI Exora</span>
                                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded font-mono text-[8px]">Auto Analysis</span>
                                        </div>
                                        <p className="text-[11.5px] text-zinc-700 leading-relaxed font-sans font-medium">
                                          {rincianSolusi}
                                        </p>
                                        <div className="pt-1 flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const q = `Berikan saya wawasan strategis detail khusus untuk produk "${prod.name}" yang memiliki konversi sebesar ${conversionRate}% dan penjualan sebanyak ${prod.salesCount} unit.`;
                                              setGroqConsultantQuery(q);
                                              handleConsultGroq(q);
                                            }}
                                            className="bg-amber-500 hover:bg-amber-640 text-white font-bold px-3 py-1.5 text-[10px] rounded-lg transition active:scale-95 flex items-center gap-1 shadow-xs"
                                          >
                                            Konsultasikan Produk ke AI →
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recents Table Layout */}
            <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-zinc-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-950 text-sm">Pesanan Terbaru</h4>
                  <p className="text-xs text-zinc-500">Pantau dan kelola pemenuhan paket</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Lihat Semua
                </button>
              </div>

              {shopOrders.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">Belum ada pesanan masuk.</div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {shopOrders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 bg-zinc-50 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-zinc-700">
                          📦
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-900 truncate block">{ord.buyerName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono block">Kode: {ord.id}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-zinc-900 block">
                          Rp {ord.totalAmount.toLocaleString('id-ID')}
                        </span>
                        <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 inline-block mt-0.5 ${
                          ord.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          ord.status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-950">Kelola Katalog Produk</h3>
                <p className="text-xs text-zinc-500">Tambah produk baru, kelola stok, dan variasi.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingProduct(true)}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
              >
                <PlusCircle className="w-4 h-4" /> Upload Produk Baru
              </button>
            </div>

            {/* Add Product Form Modal */}
            {isAddingProduct && (
              <form onSubmit={handleProductSubmit} className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-md space-y-4">
                <h4 className="font-bold text-zinc-900 text-sm">Detail Produk Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label htmlFor="new-product-name" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Nama Produk</label>
                    <input
                      id="new-product-name"
                      type="text"
                      required
                      placeholder="cth: Hyperion Mechanical Keyboard"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-product-category" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Kategori</label>
                    <select
                      id="new-product-category"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    >
                      <option value="Fashion & Pakaian">Fashion & Pakaian</option>
                      <option value="Teknologi & Gadget">Teknologi & Gadget</option>
                      <option value="Kecantikan & Kesehatan">Kecantikan & Kesehatan</option>
                      <option value="Makanan & Minuman">Makanan & Minuman</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="new-product-price" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Harga (Rupiah)</label>
                    <input
                      id="new-product-price"
                      type="number"
                      required
                      placeholder="cth: 420000"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-product-stock" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Stok Awal</label>
                    <input
                      id="new-product-stock"
                      type="number"
                      required
                      placeholder="20"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 flex items-center justify-between">
                      <span>Foto Katalog Produk ({newProdImages.length} terunggah)</span>
                      <span className="text-indigo-600 font-bold uppercase tracking-wider text-[8px] bg-indigo-50 px-1.5 py-0.5 rounded">
                        {currentTier === 'free' ? 'Plan Free: Maks 2 Foto' : 'Plan Pro: Tanpa Batas Foto'}
                      </span>
                    </label>
                    <ImageUploader
                      images={newProdImages}
                      onImagesChange={(urls) => setNewProdImages(urls)}
                      maxCount={currentTier === 'free' ? 2 : 10}
                      accountTier={currentTier}
                      label="Seret & taruh foto katalog produk di sini (rekomendasi rasio 1:1)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="new-product-description" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Deskripsi Produk</label>
                    <textarea
                      id="new-product-description"
                      rows={3}
                      placeholder="Deskripsi spesifikasi detail..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none resize-none"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-product-colors" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">
                        🎨 Variasi Warna (Pisahkan dengan Koma)
                      </label>
                      <input
                        id="new-product-colors"
                        type="text"
                        placeholder="cth: Space Grey, Midnight Blue, Silver"
                        value={newProdColors}
                        onChange={(e) => setNewProdColors(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                      />
                      <p className="text-[9px] text-zinc-400 mt-1">Kosongkan jika produk tidak memiliki pilihan warna.</p>
                    </div>

                    <div>
                      <label htmlFor="new-product-sizes" className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">
                        📐 Variasi Ukuran / Spesifikasi (Pisahkan dengan Koma)
                      </label>
                      <input
                        id="new-product-sizes"
                        type="text"
                        placeholder="cth: S, M, L, XL atau 128GB, 256GB atau Red Switch, Blue Switch"
                        value={newProdSizes}
                        onChange={(e) => setNewProdSizes(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                      />
                      <p className="text-[9px] text-zinc-400 mt-1">Kosongkan jika produk tidak memiliki spesifikasi variansi.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold"
                  >
                    Simpan Produk
                  </button>
                </div>
              </form>
            )}

            {/* List Table Grid View */}
            {shopProducts.length === 0 ? (
              <div className="py-12 bg-white rounded-3xl border border-dashed border-zinc-200 text-center max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 text-zinc-350 mx-auto mb-3 stroke-[1.2]" />
                <h4 className="font-semibold text-zinc-800 text-sm">Katalog Produk Kosong</h4>
                <p className="text-xs text-zinc-500 mt-1">Gunakan tombol 'Upload Produk' untuk membuat stok awal Anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shopProducts.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex gap-4 shadow-sm hover:shadow-md transition">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-xl bg-zinc-100 border shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[10px] text-blue-600 font-mono font-bold uppercase">{prod.category}</span>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(prod.id)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-900 truncate mb-1">{prod.name}</h4>
                        <span className="text-xs font-bold text-zinc-950">
                          Rp {prod.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50 text-xs">
                        <span className="text-zinc-500 font-medium">Stok: <strong className="text-zinc-800 font-mono">{prod.stock}</strong></span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateProductStock(prod.id, Math.max(0, prod.stock - 1))}
                            className="w-6 h-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateProductStock(prod.id, prod.stock + 1)}
                            className="w-6 h-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-zinc-950">Pesanan Pelanggan ({filteredOrders('all').length})</h3>
              <p className="text-xs text-zinc-500">Kelola pengemasan, status logistik, dan klaim poin.</p>
            </div>

            {/* Pipeline Status Filter Buttons */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar bg-white p-1 border rounded-2xl">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'new', label: 'Baru' },
                { id: 'processing', label: 'Diproses' },
                { id: 'shipped', label: 'Dikirim' },
                { id: 'completed', label: 'Selesai' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setOrdersFilter(pill.id as any)}
                  className={`flex-1 min-w-[70px] whitespace-nowrap text-center py-2 text-[11px] font-bold rounded-xl transition ${
                    ordersFilter === pill.id 
                      ? 'bg-zinc-950 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-950'
                  }`}
                >
                  {pill.label} ({filteredOrders(pill.id as any).length})
                </button>
              ))}
            </div>

            {/* List orders */}
            {filteredOrders(ordersFilter).length === 0 ? (
              <div className="py-12 bg-white rounded-3xl border border-zinc-100 text-center max-w-sm mx-auto">
                <ShoppingBag className="w-10 h-10 text-zinc-350 mx-auto mb-3 stroke-[1.2]" />
                <h4 className="font-semibold text-zinc-800 text-sm">Tidak Ada Transaksi</h4>
                <p className="text-xs text-zinc-500 mt-1">Daftar transaksi dengan kategori filter ini kosong.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders(ordersFilter).map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between pb-3 border-b border-zinc-50 flex-col md:flex-row gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-blue-600">{ord.id}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(ord.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Pesanan oleh: <strong className="text-zinc-800">{ord.buyerName}</strong> ({ord.buyerPhone})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 ${
                          ord.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          ord.status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                          ord.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items description */}
                    <div className="space-y-2 text-xs">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-zinc-700 py-1 border-b border-zinc-100 last:border-0">
                          <div>
                            <span className="font-medium text-zinc-900">{item.productName}</span> 
                            <strong className="text-zinc-500 font-normal ml-1">x{item.quantity}</strong>
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="flex gap-1.5 mt-1">
                                {item.selectedColor && (
                                  <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[9px] border border-zinc-200">Warna: {item.selectedColor}</span>
                                )}
                                {item.selectedSize && (
                                  <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[9px] border border-zinc-200">Spek: {item.selectedSize}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="font-mono font-medium shrink-0">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-3 border-t text-zinc-900 font-semibold text-sm">
                        <span>Total Checkout</span>
                        <span className="font-extrabold text-blue-600">Rp {ord.totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="p-2 bg-zinc-50 rounded-lg text-[10px] text-zinc-500 flex items-center gap-1 leading-snug">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-zinc-400" /> Alamat Kirim: {ord.buyerAddress}
                      </div>
                    </div>

                    {/* Action buttons mapping statuses */}
                    <div className="flex justify-end gap-2 pt-1">
                      {ord.status === 'new' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(ord.id, 'processing')}
                          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shadow"
                        >
                          ✔ Proses Pesanan (Packaging)
                        </button>
                      )}
                      
                      {ord.status === 'processing' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(ord.id, 'shipped')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shadow-md"
                        >
                          🚀 Kirim Pesanan (Input Resi)
                        </button>
                      )}

                      {ord.status === 'shipped' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shadow-md"
                        >
                          ✔ Tandai Selesai & Kirim Poin
                        </button>
                      )}

                      {ord.status === 'completed' && (
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl shadow-inner select-none">
                          <CheckCircle className="w-4 h-4" /> Transaksi Selesai & Poin Sukses Ditransfer!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMER CHAT SYSTEM */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
            <div className="border-b pb-4">
              <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
                💬 Inbox Chat Pelanggan <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              </h3>
              <p className="text-xs text-zinc-500">Balas chat dan pertanyaan seputar barang dagangan Anda secara instant.</p>
            </div>

            {/* Simulated Chat Interface layout splitting Left: buyers list, Right: chat box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 pt-4 min-h-[350px]">
              {/* Left sidebar chats list */}
              <div className="md:col-span-1 border-r border-zinc-50 space-y-2 pr-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Percakapan Aktif</span>
                {[
                  { id: 'buyer-demo', name: 'Reza Pratama', lastText: 'Ready gak min keyboardnya?', unread: true },
                  { id: 'buyer-demo-2', name: 'Nadia Rahma', lastText: 'Sisa warna apa aja ya kak?', unread: false }
                ].map((buyer) => (
                  <button
                    key={buyer.id}
                    type="button"
                    onClick={() => setSelectedBuyerId(buyer.id)}
                    className={`w-full text-left p-3 rounded-xl transition ${
                      selectedBuyerId === buyer.id 
                        ? 'bg-blue-50/70 border-l-4 border-blue-600' 
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-900 block">{buyer.name}</span>
                      {buyer.unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{buyer.lastText}</p>
                  </button>
                ))}
              </div>

              {/* Right text chat conversation */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div className="flex-1 bg-zinc-50 rounded-2xl p-4 text-xs space-y-4 max-h-[250px] overflow-y-auto">
                  <div className="text-center font-mono text-[9px] text-zinc-400">PERCAKAPAN DIMULAI - EXORA INSTANT MESSENGER</div>
                  
                  {selectedBuyerId === 'buyer-demo' ? (
                    <>
                      <div className="bg-white text-zinc-800 p-2.5 rounded-2xl rounded-tl-none max-w-[80%] border border-zinc-100 shadow-sm leading-relaxed">
                        Misi min, mau tanya Hyperion Mechanical Keyboard v2 itu switch bawaannya dapet tactile atau linear ya? Ready gak?
                      </div>
                      <div className="bg-blue-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[80%] ml-auto leading-relaxed">
                        Halo Reza! Untuk Hyperion Keyboard v2 dapet tactile linear switches kak. Silakan, stok super terbatas ready gas di-checkout!
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white text-zinc-800 p-2.5 rounded-2xl rounded-tl-none max-w-[80%] border border-zinc-100 shadow-sm leading-relaxed">
                        Sisa warna apa aja ya sista? Mau beli glow serumnya buat kado pacar.
                      </div>
                    </>
                  )}
                </div>

                {/* Reply message input */}
                <div className="flex gap-2 pt-4">
                  <input
                    type="text"
                    required
                    placeholder="Tulis balasan pesan di sini..."
                    value={sellerReplyText}
                    onChange={(e) => setSellerReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!sellerReplyText.trim()) return;
                      onSendSellerMessage(selectedBuyerId, sellerReplyText);
                      setSellerReplyText('');
                    }}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
                  >
                    Kirim <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STREAM SELLER HUB */}
        {activeTab === 'hub' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
                  🎙️ Stream Seller Hub <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">Seller-ke-Seller</span>
                </h3>
                <p className="text-xs text-zinc-500">Berbagi tips operasional, audio podcast kecil, atau update produk terhangat antar komunitas seller.</p>
              </div>

              {/* Status Publisher Form */}
              <div className="space-y-3 pt-2">
                <textarea
                  rows={2}
                  maxLength={250}
                  placeholder="Ada update stok baru, tips branding, atau mau sharing podcast operasional? Tulis di sini..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-250 rounded-2xl focus:outline-none focus:bg-white text-xs resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 font-medium">Bahan Media:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPostMedia(selectedPostMedia === 'image' ? 'none' : 'image')}
                      className={`px-3 py-1.5 border rounded-lg hover:bg-zinc-50 transition font-semibold text-[10px] ${selectedPostMedia === 'image' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
                    >
                      🖼️ Gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPostMedia(selectedPostMedia === 'audio' ? 'none' : 'audio')}
                      className={`px-3 py-1.5 border rounded-lg hover:bg-zinc-50 transition font-semibold text-[10px] ${selectedPostMedia === 'audio' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
                    >
                      🎙️ Audio Voice Note
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handlePublishPost}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl tracking-wide shadow"
                  >
                    Publish Post ✨
                  </button>
                </div>
              </div>
            </div>

            {/* Communities list of updates */}
            <div className="space-y-4">
              {streamPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 border rounded-xl flex items-center justify-center text-xl select-none">
                      {post.shopLogo}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-950">{post.shopName}</h4>
                      <span className="text-[9px] text-zinc-400 font-mono font-medium block">
                        Diupload pada: {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed max-w-xl whitespace-pre-line">{post.content}</p>

                  {/* Render media attachments optionally */}
                  {post.mediaType === 'image' && post.mediaUrl && (
                    <div className="relative rounded-2xl overflow-hidden max-h-56 bg-zinc-50 max-w-md">
                      <img
                        src={post.mediaUrl}
                        alt="Media post"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {post.mediaType === 'audio' && (
                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 max-w-md flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow"
                          onClick={() => alert('Memutar audio simulator voice note...')}
                        >
                          <Play className="w-4.5 h-4.5 fill-white" />
                        </button>
                        <div>
                          <span className="font-bold text-indigo-950 block text-[11px]">Tips_Seller_Branding.mp3</span>
                          <span className="text-[9px] text-indigo-500 block">02:14 • 128kbps stereo</span>
                        </div>
                      </div>
                      {/* Decorative Audio sound wave */}
                      <div className="flex items-end gap-0.5 h-6">
                        {[0.2, 0.5, 0.4, 0.8, 0.3, 0.6, 0.1].map((val, idx) => (
                          <span key={idx} className="w-1 bg-indigo-600 rounded-xs" style={{ height: `${val * 100}%` }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments and Likes reaction pipeline */}
                  <div className="flex items-center gap-4 pt-3 border-t border-zinc-50 text-xs">
                    <button
                      type="button"
                      onClick={() => onLikeStreamPost(post.id)}
                      className={`flex items-center gap-1.5 font-semibold ${post.hasLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'}`}
                    >
                      <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-red-500' : ''}`} /> {post.likes} Likes
                    </button>
                    <span className="text-zinc-400 flex items-center gap-1.5 font-semibold">
                      <MessageCircle className="w-4 h-4" /> {post.comments.length} Diskusi Komentar
                    </span>
                  </div>

                   {/* Commentary Section */}
                  <div className="bg-zinc-50 rounded-2xl p-4 space-y-3.5 text-[11px] max-w-md">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="space-y-1.5 border-b border-zinc-100 pb-2.5 last:border-b-0 last:pb-0">
                        <div>
                          <span className="font-bold text-zinc-900 block">{comm.authorName}</span>
                          <p className="text-zinc-650 leading-relaxed">{comm.content}</p>
                        </div>

                        {/* Render Replies list if any */}
                        {comm.replies && comm.replies.length > 0 && (
                          <div className="pl-3.5 ml-1 border-l-2 border-zinc-200 mt-1.5 space-y-2">
                            {comm.replies.map((rep) => (
                              <div key={rep.id} className="space-y-0.5 bg-white/70 p-2 rounded-xl border border-zinc-100 shadow-3xs">
                                <span className="font-bold text-zinc-800 block text-[10px]">{rep.authorName} <span className="text-blue-600 font-bold bg-blue-50 px-1 py-0.2 rounded text-[8px] ml-1">Balasan</span></span>
                                <p className="text-zinc-600 leading-normal text-[10px]">{rep.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons under each comment */}
                        <div className="flex items-center gap-3 mt-1.5 pl-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setActiveReplyBoxId(activeReplyBoxId === comm.id ? null : comm.id)}
                            className="font-bold text-blue-600 hover:text-blue-800 transition active:scale-95 flex items-center gap-0.5"
                          >
                            <span>💬</span> {activeReplyBoxId === comm.id ? 'Batal Balas' : 'Balas'}
                          </button>
                          <span className="text-zinc-400 font-mono">
                            {new Date(comm.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Interactive conditional Reply form */}
                        {activeReplyBoxId === comm.id && (
                          <div className="mt-2 pl-3.5 flex gap-1.5 animate-fade-in">
                            <input
                              type="text"
                              required
                              placeholder="Ketik balasan Anda..."
                              value={replyInputs[comm.id] || ''}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [comm.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendCommentReply(post.id, comm.id)}
                              className="flex-1 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-550 focus:border-blue-550"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendCommentReply(post.id, comm.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-[10px] active:scale-95"
                            >
                              Balas
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        required
                        placeholder="Tulis tanggapan diskusi..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                        className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendComment(post.id)}
                        className="px-3 py-1 bg-zinc-950 text-white rounded-xl hover:bg-zinc-800 transition font-semibold"
                      >
                        Kirim
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PREMIUM ADDONS STORE */}
        {activeTab === 'addons' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
                🛍️ App Store Add-on Premium <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              </h3>
              <p className="text-xs text-zinc-500">Sesuaikan toko Anda dengan sistem integrasi premium buatan developer Exora.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addons.map((add) => (
                <div key={add.id} className="bg-white rounded-3xl border border-zinc-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {add.category}
                      </span>
                      {add.isUnlocked && (
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Terinstal
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-zinc-900 text-sm">{add.name}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{add.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Harga Bulanan</span>
                      <strong className="text-zinc-950 font-extrabold block">Rp {add.price.toLocaleString('id-ID')} / bln</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleAddon(add.id);
                        if (!add.isUnlocked) {
                          alert(`Pembelian Sukses! Add-on ${add.name} telah di-unlock dan dapat dikonfigurasi.`);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        add.isUnlocked 
                          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-150' 
                          : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow'
                      }`}
                    >
                      {add.isUnlocked ? 'Uninstall Addon' : 'Instal Addon'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: TEAM MULTI-ADMINS ROLES */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-1.5">
                  🛡️ Multi-Admin & Hak Akses
                  {addons.find(a => a.id === 'addon-multiadmin')?.isUnlocked ? (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-mono rounded-md font-bold uppercase">AKTIF</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 text-[9px] font-mono rounded-md font-bold uppercase">Memerlukan Addon</span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500">Undang staf operasional Anda dan konfigurasikan role matriks perizinan.</p>
              </div>

              {addons.find(a => a.id === 'addon-multiadmin')?.isUnlocked && (
                <button
                  type="button"
                  onClick={() => setIsAddingAdmin(true)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <PlusCircle className="w-4 h-4" /> Tambah Anggota
                </button>
              )}
            </div>

            {/* If Addon NOT unlocked, show blur mask lock */}
            {!addons.find(a => a.id === 'addon-multiadmin')?.isUnlocked ? (
              <div className="relative rounded-3xl overflow-hidden border bg-white p-8 text-center space-y-4">
                <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-t from-white via-white/70 to-transparent z-10 pointer-events-none" />
                <Lock className="w-12 h-12 text-zinc-400 mx-auto stroke-[1.2]" />
                <h4 className="font-bold text-zinc-900 text-sm">Akses Terkunci</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Fitur kolaborasi multi-admin memerlukan modul penunjang premium aktif. Silakan aktifkan terlebih dahulu di toko add-on.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('addons')}
                  className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Kunjungi App Store Exora
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Invite Admin Form */}
                {isAddingAdmin && (
                  <form onSubmit={handleInviteAdmin} className="bg-white border p-5 rounded-2xl space-y-4">
                    <h4 className="font-bold text-xs text-zinc-700 uppercase tracking-wider">Undang Operator Baru</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Nama Staff"
                        value={adminNameInput}
                        onChange={(e) => setAdminNameInput(e.target.value)}
                        className="p-2.5 bg-zinc-50 border rounded-xl"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Alamat Email Staff"
                        value={adminEmailInput}
                        onChange={(e) => setAdminEmailInput(e.target.value)}
                        className="p-2.5 bg-zinc-50 border rounded-xl"
                      />
                      <select
                        value={adminRoleInput}
                        onChange={(e) => setAdminRoleInput(e.target.value as any)}
                        className="p-2.5 bg-zinc-50 border rounded-xl"
                      >
                        <option value="manager">Manager Toko</option>
                        <option value="editor">Editor Produk</option>
                        <option value="finance">Manajer Keuangan</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button type="button" onClick={() => setIsAddingAdmin(false)} className="px-3.5 py-2 border rounded-xl">Batal</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Kirim Undangan</button>
                    </div>
                  </form>
                )}

                {/* Team member list */}
                <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
                  <div className="divide-y divide-zinc-50">
                    {admins.map((adm) => (
                      <div key={adm.id} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{adm.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono block">{adm.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-mono font-bold uppercase rounded-lg">
                            {adm.role}
                          </span>
                          <span className={`text-[9px] font-bold uppercase rounded-md px-2 py-0.5 ${adm.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {adm.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matrix permissions overview display */}
                <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-4 text-xs text-zinc-650">
                  <h4 className="font-semibold text-zinc-950 text-xs uppercase tracking-wider">Matriks Hak Akses Perizinan</h4>
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b font-extrabold text-zinc-900 text-[10px]">
                    <span>FITUR</span>
                    <span>MANAGER</span>
                    <span>EDITOR</span>
                    <span>FINANCE</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 py-1.5 border-b text-[11px]">
                    <span>Edit Harga & Stok</span>
                    <span className="text-emerald-600 font-bold">✓ Ya</span>
                    <span className="text-emerald-600 font-bold">✓ Ya</span>
                    <span className="text-zinc-400">✕ Tidak</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 py-1.5 border-b text-[11px]">
                    <span>Atur Resi Pengiriman</span>
                    <span className="text-emerald-600 font-bold">✓ Ya</span>
                    <span className="text-zinc-400">✕ Tidak</span>
                    <span className="text-zinc-400">✕ Tidak</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 py-1.5 text-[11px]">
                    <span>Cetak Laporan Keuangan</span>
                    <span className="text-emerald-600 font-bold">✓ Ya</span>
                    <span className="text-zinc-400">✕ Tidak</span>
                    <span className="text-emerald-600 font-bold">✓ Ya</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SETTINGS & THEMES & BUILD */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* AI AUTOPILOT & BANK DETAILED SETTINGS */}
            <form onSubmit={handleSaveShopCustomizations} className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
                  <span>🤖</span> AI Autopilot & Rekening Rujukan
                </h3>
                <p className="text-xs text-zinc-500">Masukkan data bank rekening & panduan khusus toko Anda untuk dijadikan rujukan instan asisten AI dalam menjawab pertanyaan pembeli.</p>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-medium animate-fade-in flex items-center justify-between">
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* LOGO UPLOAD AREA */}
                <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide opacity-80">
                    📸 Foto Profil / Logo Toko
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-white flex items-center justify-center text-3xl select-none overflow-hidden shrink-0 shadow-inner">
                      {logoInput && (logoInput.startsWith('http') || logoInput.startsWith('/') || logoInput.startsWith('data:')) ? (
                        <img src={logoInput} alt="Preview Toko Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        logoInput || '🛍️'
                      )}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="relative group border border-dashed border-zinc-250 hover:border-zinc-400 bg-white rounded-xl p-4 transition-all text-center cursor-pointer">
                        <input
                          id="logo-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoInput(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <p className="text-[11px] font-semibold text-zinc-700">Tarik & taruh logo gambar kustom brand Anda di sini</p>
                        <p className="text-[9px] text-zinc-400 mt-0.5">Mendukung format PNG, JPG, WEBP hingga 2MB</p>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-zinc-500 whitespace-nowrap">Atau gunakan emoji:</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={logoInput.startsWith('data:') || logoInput.startsWith('http') ? '' : logoInput}
                          onChange={(e) => setLogoInput(e.target.value)}
                          placeholder="cth: 🛍️, 👕, 🍕"
                          className="w-16 px-1.5 py-0.5 bg-white border border-zinc-200 rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="shop-bank-info" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-1 opacity-80">
                    💳 Rekening Bank Pembayaran Toko
                  </label>
                  <input
                    id="shop-bank-info"
                    type="text"
                    value={paymentInput}
                    onChange={(e) => setPaymentInput(e.target.value)}
                    placeholder="cth: Bank BCA No. Rek: 8831204992 A.N. Fathur Rahman"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                    Asisten AI akan otomatis memberikan detail rekening ini di layar chat ketika pembeli menanyakan info rekening atau cara transfer.
                  </p>
                </div>

                <div>
                  <label htmlFor="shop-knowledge-base" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-1 opacity-80">
                    🧠 Bank Data Pengetahuan Toko (AI Knowledge Base)
                  </label>
                  <textarea
                    id="shop-knowledge-base"
                    rows={3}
                    value={aiInstructionsInput}
                    onChange={(e) => setAiInstructionsInput(e.target.value)}
                    placeholder="Masukkan kebijakan pengiriman, garansi produk, syarat retur, jam kerja toko, dsb. Informasi ini dibaca oleh AI untuk menjawab pertanyaan pembeli."
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                    Atur ketentuan toko sendiri (jam operasional, syarat retur). Rujukan ini memastikan asisten chat AI bersikap profesional dan akurat.
                  </p>
                </div>

                <div className="border-t border-dashed border-zinc-200 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                    <span>📢</span> Modul Pengumuman Multi-Format Toko (Teks, Audio & Video)
                  </h4>
                  <p className="text-[11px] text-zinc-500">Membantu pembeli mendapatkan info penting atau demo visual saat berkunjung di halaman beranda toko Anda.</p>

                  <div>
                    <label htmlFor="shop-announcement-text" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-1 opacity-80">
                      📝 Teks Pengumuman Promo / Penting
                    </label>
                    <textarea
                      id="shop-announcement-text"
                      rows={2}
                      value={announcementTextInput}
                      onChange={(e) => setAnnouncementTextInput(e.target.value)}
                      placeholder="cth: Promo Eksklusif Akhir Pekan! Gunakan voucher HELLOSUMMER diskon 15%."
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shop-announcement-audio" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-1 opacity-80">
                        🎵 URL Audio Voice Note (Format MP3)
                      </label>
                      <input
                        id="shop-announcement-audio"
                        type="text"
                        value={announcementAudioUrlInput}
                        onChange={(e) => setAnnouncementAudioUrlInput(e.target.value)}
                        placeholder="https://domain.com/notes.mp3"
                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                      />
                      <p className="text-[9px] text-zinc-400 mt-1">Kosongkan jika tidak memakai Voice Note pembimbing audio.</p>
                    </div>

                    <div>
                      <label htmlFor="shop-announcement-video" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-1 opacity-80">
                        🎥 URL Video Unboxing / Promo (Format MP4)
                      </label>
                      <input
                        id="shop-announcement-video"
                        type="text"
                        value={announcementVideoUrlInput}
                        onChange={(e) => setAnnouncementVideoUrlInput(e.target.value)}
                        placeholder="https://domain.com/promo.mp4"
                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
                      />
                      <p className="text-[9px] text-zinc-400 mt-1">Kosongkan jika tidak melampirkan file video interaktif.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingShopSettings}
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSavingShopSettings ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Simpan rujukan
                    </>
                  )}
                </button>
              </div>
            </form>



            {/* Theme switcher */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-1.5">
                  🎨 Kustomisasi Tema Toko
                </h3>
                <p className="text-xs text-zinc-500">Ubah seketika seluruh skema warna, font, dan aesthetic toko di mata pembeli.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(THEMES_CONFIG).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveThemeSelect(key as any);
                      handleThemeUpdate(key as any);
                    }}
                    className={`p-4 border rounded-2xl text-left transition-all relative ${
                      activeThemeSelect === key 
                        ? 'border-blue-500 ring-2 ring-blue-500/10 bg-zinc-50/70' 
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-900 block">{value.name}</span>
                    <div className="flex gap-1 mt-2.5">
                      <span className="w-5 h-5 rounded-md border" style={{ backgroundColor: value.bg.includes('#') ? value.bg.replace('bg-[', '').replace(']', '') : '#fff' }} />
                      <span className="w-5 h-5 rounded-md" style={{ backgroundColor: value.cardBg.includes('#') ? value.cardBg.replace('bg-[', '').replace(']', '') : '#e4e4e7' }} />
                    </div>
                    {activeThemeSelect === key && (
                      <span className="absolute top-2 right-2 p-0.5 bg-blue-600 text-white rounded-full text-[8px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Domain Settings mapping Add-on */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-1.5">
                  🌐 Kustomisasi Domain (.com/.id)
                  {addons.find(a => a.id === 'addon-domain')?.isUnlocked ? (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-mono rounded-md font-bold uppercase">AKTIF</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 text-[9px] font-mono rounded-md font-bold uppercase">Memerlukan Addon</span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500">Kelola setting DNS pointer ke Exora Cloud Server untuk visual brand seutuhnya.</p>
              </div>

              {!addons.find(a => a.id === 'addon-domain')?.isUnlocked ? (
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-xs text-zinc-500 text-center space-y-2">
                  <p>Membubuhkan domain pribadi memerlukan lisensi modul mapping aktif.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('addons')}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Beli Paket Mapping Domain & SSL ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-medium space-y-2">
                    <label htmlFor="custom-domain-verify-input" className="block text-zinc-700">Tulis Domain Anda</label>
                    <div className="flex gap-2">
                      <input
                        id="custom-domain-verify-input"
                        type="text"
                        placeholder="cth: stellar-wardrobe.com"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={checkDnsRecords}
                        disabled={domainStatus === 'checking'}
                        className="px-4 py-2 bg-zinc-950 font-bold text-white rounded-xl text-xs hover:bg-zinc-800 transition"
                      >
                        {domainStatus === 'checking' ? 'Memverifikasi...' : domainStatus === 'verified' ? '✓ Terkoneksi' : 'Cek DNS Pointer'}
                      </button>
                    </div>
                  </div>

                  {domainStatus === 'verified' && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs leading-relaxed border border-emerald-100">
                      Sertifikat keamanan <strong>SSL / HTTPS</strong> berstatus <strong>AKTIF</strong> untuk domain Stellar-wardrobe.com. DNS mengarah dengan benar ke: CNAME <code>ingress.exora.shop</code>.
                    </div>
                  )}

                  <div className="bg-zinc-50 border p-3.5 rounded-2xl text-[10px] font-mono space-y-1">
                    <div className="text-zinc-400 font-sans uppercase font-bold text-[9px] mb-2">Konfigurasi DNS CNAME</div>
                    <div>TYPE:  <code>CNAME</code></div>
                    <div>HOST:  <code>@ atau www</code></div>
                    <div>TARGET:<code>ingress.exora.shop</code></div>
                    <div>TTL:   <code>3600</code></div>
                  </div>
                </div>
              )}
            </div>

            {/* Android APK & PWA Builder */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-1.5">
                  🤖 Android APK & PWA Compiler Studio
                  {addons.find(a => a.id === 'addon-apk')?.isUnlocked ? (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-mono rounded-md font-bold uppercase">AKTIF</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 text-[9px] font-mono rounded-md font-bold uppercase">Memerlukan Addon</span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500">Kompilasi toko Anda menjadi aplikasi APK Android siap kirim ke Play Store secara real-time.</p>
              </div>

              {!addons.find(a => a.id === 'addon-apk')?.isUnlocked ? (
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-xs text-zinc-500 text-center space-y-2">
                  <p>Membina APK installer Android memerlukan modul platform compiler aktif.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('addons')}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Kunjungi App Store untuk Mengaktifkan APK Builder ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-zinc-700">
                      Nama Paket Aplikasi: <code>com.exorashop.{currentShop.slug}</code>
                    </div>
                    <button
                      type="button"
                      onClick={runApkCompiler}
                      disabled={isCompilingApk}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      {isCompilingApk ? 'Membuld Paket...' : '⚡ Kompilasi APK Sekarang'}
                    </button>
                  </div>

                  {buildLogs.length > 0 && (
                    <div className="bg-[#0b0f19] text-emerald-400 p-4 rounded-2xl text-[10px] font-mono space-y-1.5 leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                      {buildLogs.map((log, idx) => (
                        <div key={idx} className="fade-in">{log}</div>
                      ))}
                      {isCompilingApk && (
                        <div className="text-blue-400 font-bold animate-pulse">⚙️ Sedang mengolah Gradle build package... mohon tunggu</div>
                      )}
                    </div>
                  )}

                  {compiledApkUrl && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <span className="text-emerald-800 block text-[11px]">Android APK Berhasil Dikompilasi!</span>
                        <span className="text-[10px] text-emerald-500 font-mono font-normal">Ukuran: 18.2 MB • Versi Rilis 1.0.0</span>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Mendownload simulator android APK package... Terima kasih!');
                        }}
                        className="px-3 py-1.5 bg-zinc-950 text-white font-bold rounded-xl flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 transition shadow"
                      >
                        <Download className="w-3.5 h-3.5" /> Download APK
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
