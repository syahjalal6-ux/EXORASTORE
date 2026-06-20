/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shop, Product, StreamPost, PremiumAddon, AdminUser } from '../types';

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Aether Studio',
    slug: 'aether',
    tagline: 'Minimalist tech and hardware for future minds.',
    category: 'Teknologi & Gadget',
    logo: '⚡',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    theme: 'modern-dark',
    rating: 4.9,
    followersCount: 1420,
    contactEmail: 'hello@aether.exora.shop',
    contactWhatsapp: '+628123456789',
    isCustomDomainActive: true,
    customDomain: 'aetherstudio.io',
    points: 1250,
    createdAt: '2026-01-10T12:00:00Z',
    ownerId: 'user-1',
    paymentRequisite: 'Bank Central Asia (BCA) No. Rekening: 8831204992 A.N. Fathur Rahman (Exora Tech Group)',
    aiInstructions: 'Aether Studio menjual gadget mechanical keyboard kelas enthusiast serta aksesoris workstation premium. Berikan info garansi 1 tahun resmi untuk semua piringan keyboard. Pengiriman dilakukan maksimal H+1 setelah pembayaran terkonfirmasi via WhatsApp.',
    announcementText: '🔥 PENGUMUMAN BULAN JUNI: Dapatkan diskon 10% untuk produk Keyboard Hyperion & Free premium desk mat untuk pemegang poin loyalitas Exora di atas 1000 Pts!',
    announcementAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    announcementVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'shop-2',
    name: 'Verdant Organics',
    slug: 'verdant',
    tagline: 'Premium organic skin care crafted from botanical secrets.',
    category: 'Kecantikan & Kesehatan',
    logo: '🍃',
    banner: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop',
    theme: 'royal-emerald',
    rating: 4.8,
    followersCount: 840,
    contactEmail: 'care@verdant.exora.shop',
    contactWhatsapp: '+628998877665',
    isCustomDomainActive: false,
    customDomain: '',
    points: 450,
    createdAt: '2026-03-05T08:30:00Z',
    ownerId: 'user-2',
    paymentRequisite: 'Bank Mandiri No. Rekening: 131002991029 A.N. PT Verdant Organics Indo',
    aiInstructions: 'Verdant Organics hanya menjual produk skincare 100% alami bersertifikat BPOM dan organik EcoCert. Produk kami aman untuk ibu hamil dan menyusui. Jelaskan bahwa bahan murni diekstrak langsung tanpa bahan pengawet merkuri.',
    announcementText: '🍃 INFO PRODUK ORGANIK: Seluruh serum kami bebas merkuri dan bebas paraben. Audio panduan pemakaian tersedia di bawah ini.',
    announcementAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    announcementVideoUrl: ''
  },
  {
    id: 'shop-3',
    name: 'Sol & Luna Club',
    slug: 'solluna',
    tagline: 'Retro-future streetwear and accessories designed in Bandung.',
    category: 'Fashion & Pakaian',
    logo: '🪐',
    banner: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    theme: 'warm-sunset',
    rating: 4.7,
    followersCount: 2150,
    contactEmail: 'crew@soluna.exora.shop',
    contactWhatsapp: '+628776655443',
    isCustomDomainActive: false,
    customDomain: '',
    points: 2900,
    createdAt: '2026-02-18T15:45:00Z',
    ownerId: 'user-3',
    paymentRequisite: 'Bank Jago No. Rekening: 10452930219 A.N. Sol & Luna Collective',
    aiInstructions: 'Sol & Luna Club memproduksi streetwear terinspirasi tahun 90an fiksi ilmiah. Semua bahan menggunakan katun heavy-weight 24s premium tahan luntur. Tukar size baju diperbolehkan maksimal 3 hari sejak barang sampai.',
    announcementText: '🪐 EXCLUSIVE DROP: Streetwear Bandung x Neon-Future 90s Edition baru saja mendarat. Tonton trailer koleksi kami di bawah!',
    announcementAudioUrl: '',
    announcementVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  },
  {
    id: 'shop-4',
    name: 'NeoGlow Wear',
    slug: 'neoglow',
    tagline: 'Cyberpunk cyberware and interactive glow fashion.',
    category: 'Fashion & Pakaian',
    logo: '☄️',
    banner: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    theme: 'neon-cyan',
    rating: 4.9,
    followersCount: 512,
    contactEmail: 'cyber@neoglow.shop',
    contactWhatsapp: '+628120099887',
    isCustomDomainActive: true,
    customDomain: 'neoglowwear.com',
    points: 780,
    createdAt: '2026-05-01T20:00:00Z',
    ownerId: 'user-4',
    paymentRequisite: 'Bank Negara Indonesia (BNI) No. Rekening: 9029103991 A.N. Cyber Wear Dev',
    aiInstructions: 'NeoGlow Wear mengkhususkan diri pada busana futuristik cyberpunk dengan aksen LED adaptif. LED bisa dicharge ulang menggunakan USB-C biasa. Waterproof standar IPX4 (tahan cipratan air hujan ringan, jangan direndam).',
    announcementText: '☄️ RESTOCK UPDATE: Visor v4.2 dan LED Techwear kini bersertifikasi IPX4. Cek video unboxing & testing ketahanan air luar biasa di bawah ini!',
    announcementAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    announcementVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Aether Studio Products
  {
    id: 'prod-1',
    shopId: 'shop-1',
    name: 'Hyperion Mechanical Keyboard v2',
    price: 1850000,
    category: 'Teknologi & Gadget',
    stock: 14,
    description: 'Anodized aluminum frame, hot-swappable tactile linear switches, custom dual-shot PBT keycaps with translucent legends. Seamless multi-device connectivity via 2.4GHz and Bluetooth 5.2.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop',
    badge: 'Trending',
    rating: 4.9,
    salesCount: 45,
    colors: ['Jet Black', 'Arctic White', 'Aero Space Gray'],
    sizes: ['Linear Yellow Switch', 'Tactile Brown Switch', 'Silent Red Switch']
  },
  {
    id: 'prod-2',
    shopId: 'shop-1',
    name: 'Quantum Desk Mat - Slate Grey',
    price: 349000,
    category: 'Teknologi & Gadget',
    stock: 45,
    description: 'Ultra-smooth water-resistant micro-woven surface with clean stitched edges. Anti-skid natural rubber backing ensures extreme desktop stability for work or intense gaming sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    salesCount: 112,
    colors: ['Slate Grey', 'Carbon Gold', 'Ocean Blue'],
    sizes: ['Standard Medium (800x300mm)', 'Premium Extra-Large (900x400mm)']
  },
  {
    id: 'prod-3',
    shopId: 'shop-1',
    name: 'Aura Ambient Desk Light',
    price: 649000,
    category: 'Teknologi & Gadget',
    stock: 5,
    description: 'Smart ambient cylinder housing high-density RGB LEDs with seamless motion customization. Features smart music synchronization and dual vertical/horizontal placement options.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    badge: 'Stok Menurun',
    rating: 4.7,
    salesCount: 88,
    colors: ['Matte Black', 'Frost White']
  },

  // Verdant Organics Products
  {
    id: 'prod-4',
    shopId: 'shop-2',
    name: 'Botanical Dew Glow Serum',
    price: 289000,
    category: 'Kecantikan & Kesehatan',
    stock: 22,
    description: 'Enriched with wild rosehip, organic jojoba, and micro-infused with 5% hyaluronic acid. Brings deep root hydration and a reflective glass glow directly to tired skin without heavy synthetic chemicals.',
    imageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop',
    badge: 'Best Seller',
    rating: 4.9,
    salesCount: 189,
    sizes: ['30ml Premium Dropper', '50ml Family Size Refill']
  },
  {
    id: 'prod-5',
    shopId: 'shop-2',
    name: 'Herbal Clay Purifying Mask',
    price: 195000,
    category: 'Kecantikan & Kesehatan',
    stock: 30,
    description: 'French green clay blended with healing tea tree oils and dry lavender petals. Smoothly extracts impurities and refines skin pores gently.',
    imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=600&auto=format&fit=crop',
    rating: 4.6,
    salesCount: 104,
    sizes: ['50g Travel Glass Jar', '100g Full Size Eco-Bowl']
  },

  // Sol & Luna Club Products
  {
    id: 'prod-6',
    shopId: 'shop-3',
    name: 'Bandung Retro Crewneck - Solar Edition',
    price: 420000,
    category: 'Fashion & Pakaian',
    stock: 18,
    description: 'Heavyweight organic cotton, premium screenพิมพ์ graphic detailing retro 80s space designs. Styled with a comfortable relaxed fit and premium custom woven tags.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop',
    badge: 'Hot Drop',
    rating: 4.8,
    salesCount: 74,
    colors: ['Solar Yellow', 'Midnight Navy', 'Ash Grey'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod-7',
    shopId: 'shop-3',
    name: 'Universal Ranger Cargo Pants',
    price: 525000,
    category: 'Fashion & Pakaian',
    stock: 12,
    description: 'Durable nylon ripstop fabric with weather-resistant coating. Multi-tier visual utility pockets with custom Exora-matte hardware buckles.',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
    rating: 4.7,
    salesCount: 52,
    colors: ['Olive Ranger', 'Stealth Charcoal Black'],
    sizes: ['28', '30', '32', '34', '36']
  },

  // NeoGlow Wear Products
  {
    id: 'prod-8',
    shopId: 'shop-4',
    name: 'Chrono-Cyber Visor v4.2',
    price: 1250000,
    category: 'Fashion & Pakaian',
    stock: 6,
    description: 'Rechargeable holographic side-emitting glowing glasses. Featuring dynamic touch color shifting to map your visual accent.',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
    badge: 'Cyber Tech',
    rating: 4.9,
    salesCount: 38,
    colors: ['Neo Neon Cyan', 'Toxic Acid Green', 'Laser Pink Glow']
  },
  {
    id: 'prod-9',
    shopId: 'shop-4',
    name: 'Reflective Neon Windbreaker',
    price: 890000,
    category: 'Fashion & Pakaian',
    stock: 10,
    description: 'Iridescent rainbow reflective technical fabric, windproof and water repellent. Reflects bright glowing rainbow colors on any camera or phone flash.',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    salesCount: 22
  }
];

export const INITIAL_STREAM_POSTS: StreamPost[] = [
  {
    id: 'post-1',
    shopId: 'shop-1',
    shopName: 'Aether Studio',
    shopLogo: '⚡',
    content: '🎉 Hyperion Keyboard v2 Batch Baru sudah landing di gudang utama! Kami menambahkan foam peredam suara ekstra secara cuma-cuma di rilis kali ini agar bunyi ketikannya terdengar super buttery. Stok terbatas ya teman-teman, langsung checkout lewat tab produk!',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
    likes: 42,
    hasLiked: false,
    comments: [
      { id: 'c1', authorName: 'Reza Pratama', content: 'Asik! Suara ketikan yang kemaren aja udah gurih banget!', createdAt: '2026-06-19T10:00:00Z' },
      { id: 'c2', authorName: 'Nadia Rahma', content: 'Upgrade dari yang v1 berasa banget bedanya ga min? Mau checkout nih.', createdAt: '2026-06-19T11:15:00Z' }
    ],
    createdAt: '2026-06-19T09:30:00Z'
  },
  {
    id: 'post-2',
    shopId: 'shop-2',
    shopName: 'Verdant Organics',
    shopLogo: '🍃',
    content: '🎙️ [TIPS SELLER] Cara kami menghemat biaya packing hingga 30% menggunakan bahan daur ulang ramah lingkungan yang justru disukai pelanggan. Kami membagikan panduan suara singkat ini khusus untuk teman-teman seller Exora! Silakan dengerin tips kami dapet star seller!',
    mediaType: 'audio',
    mediaUrl: '/assets/tips_packaging.mp3', // Simulated audio
    likes: 28,
    hasLiked: false,
    comments: [
      { id: 'c3', authorName: 'Aether Studio', content: 'Keren banget idenya kak! Sangat inspiratif buat kami yang jualan hardware.', createdAt: '2026-06-19T13:40:00Z' }
    ],
    createdAt: '2026-06-19T12:00:00Z'
  }
];

export const PREMIUM_ADDONS: PremiumAddon[] = [
  {
    id: 'addon-domain',
    name: 'Custom Domain Mapping',
    description: 'Hubungkan domain Anda sendiri (seperti namatoko.com) ke website Exora Shop secara instan dengan SSL gratis otomatis.',
    price: 49000,
    category: 'infrastructure',
    icon: 'Globe',
    isUnlocked: false,
    pointsCost: 500
  },
  {
    id: 'addon-whatsapp',
    name: 'WhatsApp Checkout Express',
    description: 'Pembeli bisa langsung melakukan checkout pesanan otomatis terintegrasi ke chat WhatsApp CS toko Anda.',
    price: 29000,
    category: 'marketing',
    icon: 'MessageSquareShare',
    isUnlocked: true,
    pointsCost: 300
  },
  {
    id: 'addon-multiadmin',
    name: 'Sistem Multi-Admin & Hak Akses',
    description: 'Tambah admin staf dengan role khusus (Manager, Finansial, Kurir) untuk mengelola pesanan tanpa memberikan password utama.',
    price: 79000,
    category: 'operations',
    icon: 'Users',
    isUnlocked: false,
    pointsCost: 800
  },
  {
    id: 'addon-apk',
    name: 'Android APK & PWA Builder',
    description: 'Ubah toko online Anda secara instan menjadi aplikasi Mobile Android (APK) dan Progressive Web App (PWA) siap instal.',
    price: 149000,
    category: 'infrastructure',
    icon: 'Smartphone',
    isUnlocked: false,
    pointsCost: 1500
  }
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Fathur Rahman (You)',
    email: 'Fathur48@gmail.com',
    role: 'owner',
    status: 'active'
  },
  {
    id: 'admin-2',
    name: 'Citra Dewi',
    email: 'citra.operational@gmail.com',
    role: 'manager',
    status: 'active'
  },
  {
    id: 'admin-3',
    name: 'Andi Saputra',
    email: 'andi.finance@example.com',
    role: 'finance',
    status: 'invited'
  }
];

export const THEMES_CONFIG = {
  minimal: {
    name: 'Classic White Minimalist',
    bg: 'bg-[#fafafa]',
    cardBg: 'bg-white',
    textMain: 'text-zinc-950',
    textMuted: 'text-zinc-500',
    accent: 'bg-zinc-950 text-white',
    accentText: 'text-zinc-950',
    border: 'border-zinc-200',
    buttonHover: 'hover:bg-zinc-900',
    taglineFont: 'font-sans'
  },
  'modern-dark': {
    name: 'Aether Cyber Dark',
    bg: 'bg-[#0a0a0a]',
    cardBg: 'bg-[#121212]',
    textMain: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    accent: 'bg-[#fafafa] text-zinc-950',
    accentText: 'text-zinc-100',
    border: 'border-zinc-800',
    buttonHover: 'hover:bg-zinc-200',
    taglineFont: 'font-sans'
  },
  'neon-cyan': {
    name: 'Synth Cyberpunk Neon',
    bg: 'bg-[#020512]',
    cardBg: 'bg-[#090e26]',
    textMain: 'text-cyan-100',
    textMuted: 'text-cyan-400/70',
    accent: 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    accentText: 'text-cyan-400',
    border: 'border-cyan-500/20',
    buttonHover: 'hover:bg-cyan-400',
    taglineFont: 'font-mono'
  },
  'warm-sunset': {
    name: 'Organic Warm Sunset',
    bg: 'bg-[#fbf7f2]',
    cardBg: 'bg-white',
    textMain: 'text-[#3c2f2f]',
    textMuted: 'text-[#8c7a7a]',
    accent: 'bg-[#e06a55] text-white',
    accentText: 'text-[#e06a55]',
    border: 'border-[#ebdcd0]',
    buttonHover: 'hover:bg-[#cd5c47]',
    taglineFont: 'font-serif'
  },
  'royal-emerald': {
    name: 'Premium Royal Emerald',
    bg: 'bg-[#001710]',
    cardBg: 'bg-[#00271b]',
    textMain: 'text-emerald-50',
    textMuted: 'text-emerald-300/60',
    accent: 'bg-[#e2b76c] text-[#001710] font-semibold',
    accentText: 'text-[#e2b76c]',
    border: 'border-emerald-600/20',
    buttonHover: 'hover:bg-[#d6a555]',
    taglineFont: 'font-serif font-medium'
  }
};
