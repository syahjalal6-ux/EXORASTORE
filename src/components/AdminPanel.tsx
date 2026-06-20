import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/supabaseClient';
import { Shop } from '../types';
import { 
  Users, 
  Crown, 
  Search, 
  ShoppingBag, 
  ShieldAlert, 
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  LogOut,
  Mail,
  UserCheck,
  UserMinus,
  Settings
} from 'lucide-react';

interface AdminPanelProps {
  onBackToExplore: () => void;
  onRefreshGlobalData: () => Promise<void>;
  currentUserId: string | undefined;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  account_tier?: 'free' | 'pro';
  points_balance?: number;
  createdAt?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onBackToExplore, 
  onRefreshGlobalData,
  currentUserId
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [waInput, setWaInput] = useState(() => localStorage.getItem('exora_wa_number') || '628831204992');
  const [isSavingWa, setIsSavingWa] = useState(false);

  // Admin Active Tab Management
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

  // Credentials and API Integrations Form States
  const [biteshipApiKeyInput, setBiteshipApiKeyInput] = useState(() => {
    try {
      return localStorage.getItem('exora_custom_biteship_key') || '';
    } catch { return ''; }
  });
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => {
    try {
      return localStorage.getItem('exora_custom_supabase_url') || '';
    } catch { return ''; }
  });
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(() => {
    try {
      return localStorage.getItem('exora_custom_supabase_key') || '';
    } catch { return ''; }
  });
  const [groqApiKeyInput, setGroqApiKeyInput] = useState(() => {
    try {
      return localStorage.getItem('exora_custom_groq_key') || '';
    } catch { return ''; }
  });
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSavingApiSettings, setIsSavingApiSettings] = useState(false);
  const [apiSettingsSuccessMsg, setApiSettingsSuccessMsg] = useState('');

  const handleSaveWaNumber = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWa(true);
    // clean value
    const clean = waInput.trim();
    localStorage.setItem('exora_wa_number', clean);
    setTimeout(() => {
      setIsSavingWa(false);
      setSuccessMessage(`Nomor WhatsApp rujukan berhasil disimpan ke: ${clean}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 500);
  };

  const handleSaveApiCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingApiSettings(true);
    setApiSettingsSuccessMsg('');

    setTimeout(() => {
      try {
        localStorage.setItem('exora_custom_biteship_key', biteshipApiKeyInput.trim());
        localStorage.setItem('exora_custom_supabase_url', supabaseUrlInput.trim());
        localStorage.setItem('exora_custom_supabase_key', supabaseAnonKeyInput.trim());
        localStorage.setItem('exora_custom_groq_key', groqApiKeyInput.trim());
        
        setIsSavingApiSettings(false);
        setApiSettingsSuccessMsg('✓ Kunci API & Integrasi Layanan Backend berhasil disimpan ke sistem cloud-secure lokal Anda! Segarkan halaman untuk inisialisasi browser ulang.');
        setTimeout(() => setApiSettingsSuccessMsg(''), 6000);
      } catch (err) {
        setIsSavingApiSettings(false);
        alert('Gagal menulis data ke localStorage. Periksa izin iframe browser Anda.');
      }
    }, 500);
  };

  // Load users & shops
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const allUsers = await dbService.admin.getAllUsers();
      const allShops = await dbService.shops.getAll();
      setUsers(allUsers || []);
      setShops(allShops || []);
    } catch (error) {
      console.error('Failed to load admin panel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateUserTier = async (userId: string, newTier: 'free' | 'pro') => {
    setActionLoading(userId);
    setSuccessMessage(null);
    try {
      await dbService.admin.updateUserTier(userId, newTier);
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_tier: newTier } : u));
      
      const targetUser = users.find(u => u.id === userId);
      const userName = targetUser ? targetUser.name : 'Pengguna';
      
      setSuccessMessage(`Berhasil ${newTier === 'pro' ? 'mengaktifkan EXORA PRO untuk' : 'mencabut status PRO dari'} ${userName}!`);
      
      // Refresh global app state so it immediately updates the logged-in user header & layout
      await onRefreshGlobalData();
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Failed to update user tier:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Impersonate / Switch user role for browser testing easily
  const handleImpersonateUser = async (user: UserProfile) => {
    setActionLoading(`impersonate-${user.id}`);
    try {
      // Direct replace profile in local storage to login as them
      localStorage.setItem('exora_profile', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        account_tier: user.account_tier || 'free',
        points_balance: user.points_balance || 0
      }));
      
      setSuccessMessage(`Simulasi login berhasil! Anda sekarang bertindak sebagai ${user.name}.`);
      await onRefreshGlobalData();
      
      // Redirect to seller dashboard to test their view instantly
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Simulasi login gagal:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const userTier = u.account_tier || 'free';
    const matchesTier = tierFilter === 'all' || userTier === tierFilter;
    
    return matchesSearch && matchesTier;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const proUsersCount = users.filter(u => u.account_tier === 'pro').length;
  const freeUsersCount = totalUsers - proUsersCount;
  const totalShops = shops.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 text-white rounded-3xl p-6 md:p-8 border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" /> Panel Kontrol Pusat
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">Exora Admin Monitor</h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Sistem manajemen lisensi terpusat. Pantau pertumbuhan pengguna independen Exora, aktifkan atau cabut paket EXORA PRO, dan simulasikan akun dalam sekali klik.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={loadAdminData}
            title="Sinkronisasi Data Ulang"
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-2xl transition-all duration-200 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={onBackToExplore}
            className="px-5 py-3 bg-white hover:bg-zinc-150 text-zinc-950 text-xs font-bold rounded-2xl shadow-md transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            Kembali ke Eksplorasi <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:grid-cols-4">
        {[
          {
            title: 'Total Pengguna',
            value: isLoading ? '...' : totalUsers,
            sub: 'Akun Terdaftar',
            icon: Users,
            colorClass: 'text-zinc-900 bg-zinc-50 border border-zinc-100'
          },
          {
            title: 'Mitra Exora PRO',
            value: isLoading ? '...' : proUsersCount,
            sub: 'Langganan Aktif',
            icon: Crown,
            colorClass: 'text-amber-700 bg-amber-50 border border-amber-100 shadow-sm shadow-amber-100/30'
          },
          {
            title: 'Pengguna Ritel FREE',
            value: isLoading ? '...' : freeUsersCount,
            sub: 'Paket Terbatas',
            icon: Users,
            colorClass: 'text-blue-700 bg-blue-50 border border-blue-100'
          },
          {
            title: 'Jumlah Toko Aktif',
            value: isLoading ? '...' : totalShops,
            sub: 'Sektor UMKM Digital',
            icon: ShoppingBag,
            colorClass: 'text-emerald-700 bg-emerald-50 border border-emerald-100'
          }
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-3xl ${stat.colorClass} space-y-2 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-80 font-mono">{stat.title}</span>
              <stat.icon className="w-5 h-5 opacity-60" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold opacity-60 font-sans tracking-wide">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEGMENTED TAB SELECTOR */}
      <div className="flex border-b border-zinc-200/60 gap-6 mt-2 font-sans">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all relative ${
            activeTab === 'users' 
              ? 'border-zinc-950 text-zinc-950 font-black' 
              : 'border-transparent text-zinc-400 hover:text-zinc-650'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengguna & Toko ({users.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all relative ${
            activeTab === 'settings' 
              ? 'border-zinc-950 text-zinc-950 font-black' 
              : 'border-transparent text-zinc-400 hover:text-zinc-650'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & API Integrasi</span>
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fade-in font-sans">
          {/* EXORA WHATSAPP ROUTING CONFIG */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <span>💬</span> Integrasi WhatsApp Upgrade Billing
              </h3>
              <p className="text-xs text-zinc-500">
                Konfigurasikan nomor WhatsApp Admin rujukan. Ketika seller mengklik tombol "Pilih" atau "Upgrade" pada paket berlangganan PRO Premium, mereka akan diarahkan langsung ke WhatsApp ini dengan pesan konfirmasi otomatis.
              </p>
            </div>

            <form onSubmit={handleSaveWaNumber} className="flex flex-col sm:flex-row gap-3 items-end max-w-2xl bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div className="flex-1 w-full space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Nomor WhatsApp (Format Kode Negara, Tanpa '+' atau Spasi)
                </label>
                <input
                  type="text"
                  required
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="cth: 628831204992 atau 08831204992"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none transition font-mono text-zinc-850"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingWa}
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm whitespace-nowrap active:scale-95"
              >
                {isSavingWa ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </form>
          </div>

          {/* API CREDENTIALS & INTEGRATIONS SECTION (User requested via Admin Panel) */}
          <form onSubmit={handleSaveApiCredentials} className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
                  <span>🔑</span> Integrasi Kunci API & Layanan Backend
                </h3>
                <p className="text-xs text-zinc-500">
                  Input & simpan kredensial layanan pihak ketiga untuk mengaktifkan database real-time Supabase, asisten pintar Groq AI, dan pengiriman otomatis Biteship secara global untuk aplikasi Exora.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold rounded-lg transition shrink-0 uppercase tracking-wider font-mono"
              >
                {showApiKeys ? '🙈 Sembunyikan' : '👁️ Tampilkan Kunci'}
              </button>
            </div>

            {apiSettingsSuccessMsg && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl font-medium animate-fade-in flex flex-col gap-2">
                <span>{apiSettingsSuccessMsg}</span>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="p-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold w-fit transition shadow-sm self-start"
                >
                  🔄 Segarkan Halaman Sekarang
                </button>
              </div>
            )}

            <div className="space-y-5">
              {/* 1. Supabase Group */}
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                  <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <span>🗄️</span> Supabase DB (Real-time Cloud Backend)
                  </span>
                  <span className="p-1 px-2 bg-zinc-200 text-zinc-650 text-[9px] font-black font-mono rounded">SQL DATAPLACE</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="api-supabase-url" className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">
                      SUPABASE URL
                    </label>
                    <input
                      id="api-supabase-url"
                      type="text"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://yourprojectid.supabase.co"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="api-supabase-key" className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">
                      SUPABASE ANON KEY
                    </label>
                    <input
                      id="api-supabase-key"
                      type={showApiKeys ? 'text' : 'password'}
                      value={supabaseAnonKeyInput}
                      onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[9px] text-zinc-400">
                    Gunakan database Supabase PostgreSQL untuk sinkronisasi inventaris & order multi-perangkat.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!supabaseUrlInput || !supabaseAnonKeyInput) {
                        alert('Mohon masukkan URL & Anon Key Supabase terlebih dahulu.');
                        return;
                      }
                      if (!supabaseUrlInput.includes('supabase.co') || !supabaseUrlInput.startsWith('http')) {
                        alert('🔴 Format URL tidak valid (harus diawali http/https dan menyertakan supabase.co)');
                        return;
                      }
                      alert('🟢 Deteksi format URL & Anon Key Supabase valid! Klik tombol "Simpan Kunci" untuk menerapkan integrasi.');
                    }}
                    className="text-[9px] font-bold text-indigo-600 hover:underline"
                  >
                    CNAME format check ➔
                  </button>
                </div>
              </div>

              {/* 2. Groq cloud API key */}
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                  <span className="text-xs font-black text-rose-700 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <span>🤖</span> Groq Cloud AI Engine (Llama-3-8B)
                  </span>
                  <span className="p-1 px-2 bg-zinc-200 text-rose-800 text-[9px] font-black font-mono rounded">INFRA AI INSTANT</span>
                </div>

                <div>
                  <label htmlFor="api-groq-key" className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">
                    GROQ CLOUD API KEY
                  </label>
                  <input
                    id="api-groq-key"
                    type={showApiKeys ? 'text' : 'password'}
                    value={groqApiKeyInput}
                    onChange={(e) => setGroqApiKeyInput(e.target.value)}
                    placeholder="gsk_u9NskcE2v0Z9bLs1..."
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[9px] text-zinc-400">
                    Diperlukan oleh asisten chat virtual Exora AI untuk menjawab pertanyaan pembeli secara instan.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!groqApiKeyInput) {
                        alert('Masukkan Kunci API Groq Anda.');
                        return;
                      }
                      if (!groqApiKeyInput.startsWith('gsk_')) {
                        alert('⚠️ Peringatan: Kunci API Groq resmi biasanya diawali dengan "gsk_". Silakan periksa kembali.');
                        return;
                      }
                      alert('🟢 Format Kunci Groq lolos validasi parsial. Klik "Simpan Kunci" untuk menyimpannya.');
                    }}
                    className="text-[9px] font-bold text-rose-600 hover:underline"
                  >
                    Check Groq pattern ➔
                  </button>
                </div>
              </div>

              {/* 3. Biteship API Key */}
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                  <span className="text-xs font-black text-blue-700 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <span>🚚</span> Biteship API Key (Multi-Kurir Indonesia)
                  </span>
                  <span className="p-1 px-2 bg-zinc-200 text-blue-800 text-[9px] font-black font-mono rounded">LOGISTIK RESMI</span>
                </div>

                <div>
                  <label htmlFor="api-biteship-key" className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">
                    BITESHIP API KEY (sandbox / production)
                  </label>
                  <input
                    id="api-biteship-key"
                    type={showApiKeys ? 'text' : 'password'}
                    value={biteshipApiKeyInput}
                    onChange={(e) => setBiteshipApiKeyInput(e.target.value)}
                    placeholder="biteship_test_..."
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-850 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[9px] text-zinc-400">
                    Menghubungkan langsung ongkos kirim real-time JNE, SiCepat, J&T, & tracking nomor resi otomatis Biteship.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!biteshipApiKeyInput) {
                        alert('Masukkan kunci API Biteship Anda.');
                        return;
                      }
                      if (!biteshipApiKeyInput.includes('biteship_')) {
                        alert('⚠️ Peringatan: API key Biteship biasanya memiliki prefiks "biteship_".');
                        return;
                      }
                      alert('🟢 Struktur Kunci Biteship Valid. Klik tombol "Simpan Kunci" untuk mengaktifkan fitur kurir Biteship.');
                    }}
                    className="text-[9px] font-bold text-blue-600 hover:underline"
                  >
                    Check Biteship structure ➔
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingApiSettings}
                className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                {isSavingApiSettings ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sedang Menyimpan...
                  </>
                ) : (
                  <>
                    <span>💾</span> Simpan Integrasi Kunci API & Layanan Backend
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <>
          {/* FILTER & PENCARIAN & SUCCESS ALERTS */}
      <div className="space-y-4">
        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-fade-in shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs font-bold leading-relaxed">{successMessage}</div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none transition font-sans text-zinc-850 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mr-2 font-mono whitespace-nowrap">Filter Paket:</span>
            {[
              { id: 'all', label: 'Semua Akun' },
              { id: 'free', label: 'Massa FREE' },
              { id: 'pro', label: 'Eksklusif PRO ⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTierFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  tierFilter === tab.id 
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-zinc-50 text-zinc-650 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* USER MONITORING TABLE / GRID */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-zinc-150 p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-4" />
          <p className="text-sm font-sans font-bold text-zinc-500 animate-pulse">Menghubungkan data basis pengguna secara langsung...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-150 p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-zinc-800">Tidak ada pengguna ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan kata pencarian atau bersihkan filter Lisensi Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-400 text-[10px] font-bold tracking-wider uppercase font-mono">
                  <th className="py-4 px-6">Identitas Pengguna</th>
                  <th className="py-4 px-6">Status Terkini</th>
                  <th className="py-4 px-6">Informasi Toko</th>
                  <th className="py-4 px-6 text-right">Manajemen Lisensi & Lisensi PRO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredUsers.map((user) => {
                  const userShop = shops.find(s => s.ownerId === user.id);
                  const isPro = user.account_tier === 'pro';
                  const isDiriSendiri = user.id === currentUserId;
                  
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition duration-150">
                      
                      {/* IDENTITAS */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-100" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 text-sm font-mono uppercase">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 truncate font-sans text-sm">{user.name}</span>
                              {isDiriSendiri && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[8px] font-bold uppercase">ADMIN UTAMA</span>
                              )}
                            </div>
                            <span className="text-zinc-550 block font-mono text-[10px] mt-0.5">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* STATUS TIER */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {isPro ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full font-bold text-[10px] font-sans">
                              <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> EXORA PRO
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full font-bold text-[10px] font-sans">
                              REGULER FREE
                            </span>
                          )}
                          <p className="text-[9px] text-zinc-400 font-medium">Saldo Token: <span className="font-bold font-mono text-zinc-700">{user.points_balance ?? 0} XP</span></p>
                        </div>
                      </td>

                      {/* INFORMASI TOKO */}
                      <td className="py-4 px-6">
                        {userShop ? (
                          <div className="space-y-1 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="font-bold text-zinc-900 truncate text-[11px] font-display">{userShop.name}</span>
                            </div>
                            <p className="text-[10px] text-blue-600 font-mono font-medium truncate">
                              slug: {userShop.slug}.exora.shop
                            </p>
                            <div className="text-[9px] text-zinc-400 leading-normal flex items-center gap-2">
                              <span>⭐ {userShop.rating} Rating</span>
                              <span>•</span>
                              <span>👥 {userShop.followersCount} Pengikut</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-sans italic text-[11px]">Belum Membuka Toko</span>
                        )}
                      </td>

                      {/* MANAGEMENT LICENSES */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate simulation */}
                          <button
                            type="button"
                            onClick={() => handleImpersonateUser(user)}
                            disabled={actionLoading !== null}
                            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg text-[10px] transition font-sans disabled:opacity-40"
                            title="Bertindak sebagai user ini untuk menguji tokonya di browser"
                          >
                            {actionLoading === `impersonate-${user.id}` ? 'Loading...' : 'Simulasi Login'}
                          </button>

                          {isPro ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserTier(user.id, 'free')}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Downgrade ke akun FREE"
                            >
                              <UserMinus className="w-3 h-3" /> Cabut Pro
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserTier(user.id, 'pro')}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-650 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow-xs shadow-amber-300/30 disabled:opacity-50"
                              title="Upgrade ke akun PRO Premium"
                            >
                              <Crown className="w-3 h-3 fill-white" /> Aktifkan PRO
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 font-mono gap-2">
            <span>Menampilkan {filteredUsers.length} dari total {users.length} pengguna terdaftar.</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Lisensi PRO instan aktif tanpa perlu gateway pembayaran real.
            </span>
          </div>
        </div>
      )}

      {/* QUICK DOCUMENTATION CARD */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start">
        <div className="p-3 bg-blue-150 text-blue-700 rounded-2xl shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-xs text-blue-900 font-display">Tugas & Alur Kerja Manajemen Akses PRO</h4>
          <p className="text-[11px] text-blue-755 leading-relaxed">
            Sistem Lisensi Terpusat Exora mengontrol fungsionalitas UI secara real-time. Ketika Anda mengklik <strong>"Aktifkan PRO"</strong>, user akan mendapatkan akses ke: custom domain toko, unggah produk multi-foto tak terbatas, asisten chatbot AI cerdas yang membaca rujukan rincian bank langsung, dan fitur analitik penjualan terperinci. Gunakan fitur <strong>"Simulasi Login"</strong> di atas untuk memverifikasi perubahan visual ini pada browser Anda seketika!
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
