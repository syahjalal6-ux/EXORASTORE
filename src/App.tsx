/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_SHOPS, 
  INITIAL_PRODUCTS, 
  INITIAL_STREAM_POSTS, 
  PREMIUM_ADDONS, 
  INITIAL_ADMINS 
} from './data/mockData';
import { Shop, Product, Order, StreamPost, PremiumAddon, AdminUser, RealtimeNotification, ChatMessage } from './types';
import ExplorePage from './components/ExplorePage';
import BuyerStoreView from './components/BuyerStoreView';
import SellerDashboard from './components/SellerDashboard';
import WizardStoreCreate from './components/WizardStoreCreate';
import GoogleLoginCard from './components/GoogleLoginCard';
import BillingModal from './components/BillingModal';
import { AdminPanel } from './components/AdminPanel';
import { dbService } from './lib/supabaseClient';
import { Store, ShoppingBag, Shield, Terminal, ArrowRight, Sparkles, ExternalLink, RefreshCw, Layers, Chrome, LogOut, Zap, X, Share2 } from 'lucide-react';

export default function App() {
  // Global States
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // Initialize some completed orders to populate dashboards initially
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-881273',
      shopId: 'shop-1',
      buyerName: 'Ahmad Fauzi',
      buyerEmail: 'ahmadf@gmail.com',
      buyerPhone: '08123456782',
      buyerAddress: 'Jl. Riau No. 12, Bandung',
      items: [
        { productId: 'prod-2', productName: 'Quantum Desk Mat - Slate Grey', price: 349000, quantity: 1 }
      ],
      totalAmount: 349000,
      status: 'completed',
      pointsEarned: 34,
      createdAt: '2026-06-18T10:00:00Z'
    }
  ]);
  
  const [streamPosts, setStreamPosts] = useState<StreamPost[]>(INITIAL_STREAM_POSTS);
  const [addons, setAddons] = useState<PremiumAddon[]>(PREMIUM_ADDONS);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [followedShopIds, setFollowedShopIds] = useState<string[]>(['shop-1', 'shop-2']);
  const [currentShopId, setCurrentShopId] = useState<string>('shop-1'); // Default to Aether Studio so dashboard has data instantly
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null); // For buyer viewing individual storefront
  
  const [view, setView] = useState<'explore' | 'buyer-store' | 'seller-dashboard' | 'wizard' | 'developer' | 'admin'>('explore');

  // Real User Google Auth & Billing Tier states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accountTier, setAccountTier] = useState<'free' | 'pro'>('free');
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Progressive Web App Custom Install Banner States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaInstallPrompt, setShowPwaInstallPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTutorial, setShowIosTutorial] = useState(false);

  useEffect(() => {
    // 1. Listen to Real Supabase / local authentication changes
    const unsubscribeAuth = dbService.auth.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (user) {
        setAccountTier(user.account_tier || user.accountTier || 'free');
        
        // Auto-detect if user owns a shop, set active shop
        dbService.shops.getAll().then(allShops => {
          const matchedShop = allShops.find(s => s.ownerId === user.id);
          if (matchedShop) {
            setCurrentShopId(matchedShop.id);
          }
        });
      } else {
        setAccountTier('free');
      }
    });

    // 2. Synchronize entire state on startup
    const synchronizeData = async () => {
      try {
        let dbShops = await dbService.shops.getAll();
        let dbProds = await dbService.products.getAll();
        let dbOrders = await dbService.orders.getAll();
        let dbChats = await dbService.chats.getAll();
        let dbStreams = await dbService.streams.getAll();

        // Seed with default data if empty (very common on first load of DB)
        if (dbShops.length === 0) {
          for (const s of INITIAL_SHOPS) {
            await dbService.shops.create(s);
          }
          for (const p of INITIAL_PRODUCTS) {
            await dbService.products.create(p);
          }
          for (const s of INITIAL_STREAM_POSTS) {
            await dbService.streams.create(s);
          }
          // Re-fetch
          dbShops = await dbService.shops.getAll();
          dbProds = await dbService.products.getAll();
          dbStreams = await dbService.streams.getAll();
        }

        // PWA Routing Engine: Detect deep store links in URL query or sub-path on load
        const params = new URLSearchParams(window.location.search);
        const shopIdParam = params.get('shop') || params.get('shopId');
        const slugParam = params.get('slug');
        const viewParam = params.get('view');
        const pathname = window.location.pathname;

        let routeSlug = '';
        if (pathname.includes('/shop/')) {
          routeSlug = pathname.split('/shop/')[1]?.split('/')[0];
        }

        if (shopIdParam) {
          const found = dbShops.find(s => s.id === shopIdParam);
          if (found) {
            setSelectedShopId(found.id);
            setView('buyer-store');
          }
        } else if (slugParam || routeSlug) {
          const targetSlug = slugParam || routeSlug;
          const found = dbShops.find(s => s.slug === targetSlug || s.id === targetSlug);
          if (found) {
            setSelectedShopId(found.id);
            setView('buyer-store');
          }
        } else if (viewParam) {
          if (['explore', 'seller-dashboard', 'wizard', 'developer'].includes(viewParam)) {
            setView(viewParam as any);
          }
        }

        setShops(dbShops);
        setProducts(dbProds);
        setOrders(dbOrders);
        setChatMessages(dbChats);
        setStreamPosts(dbStreams);
      } catch (err) {
        console.error('Data sync failed:', err);
      } finally {
        setIsDbLoading(false);
      }
    };

    synchronizeData();

    // 3. Register real-time stream subscription for chat messages
    const unsubscribeChats = dbService.chats.subscribeToChats((newMsg) => {
      setChatMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Show real-time notification
      if (newMsg.sender === 'buyer') {
        const liveNotif: RealtimeNotification = {
          id: 'notif-chat-' + Math.random(),
          title: '💬 PESAN CHAT MASUK (REAL-TIME)',
          message: `Pelanggan mengirim: "${newMsg.text.substring(0, 30)}..."`,
          type: 'chat',
          isRead: false,
          timestamp: new Date().toISOString()
        };
        setNotifications(prev => [liveNotif, ...prev]);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeChats();
    };
  }, []);

  // 4. Capture native PWA install triggers & identify Apple devices
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Identify iOS specifically to render beautiful Apple Home Screen instruction drawers
    const userAgent = window.navigator.userAgent;
    const isAppleIos = /iPhone|iPad|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isAppleIos);

    // Check if running inside installed standalone PWA window mode
    const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    // Show native prompt fallback for iOS if not yet installed
    if (isAppleIos && !isPwaInstalled) {
      setTimeout(() => {
        setShowPwaInstallPrompt(true);
      }, 3500); // Friendly delayed display on iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 5. Keep URL address bar updated dynamically with active store view
  useEffect(() => {
    if (isDbLoading) return;

    try {
      const params = new URLSearchParams(window.location.search);
      if (view === 'buyer-store' && selectedShopId) {
        params.set('shop', selectedShopId);
        params.delete('view');
      } else {
        params.delete('shop');
        if (view !== 'explore') {
          params.set('view', view);
        } else {
          params.delete('view');
        }
      }
      const newQuery = params.toString();
      const updatedUrl = `${window.location.pathname}${newQuery ? '?' + newQuery : ''}`;
      window.history.replaceState(null, '', updatedUrl);
    } catch (e) {
      console.warn('[PWA URL Sync Error] Syncing parameter is restricted:', e);
    }
  }, [view, selectedShopId, isDbLoading]);

  // Handle installer trigger
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[Exora PWA] User 선택 outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowPwaInstallPrompt(false);
    } else if (isIos) {
      setShowIosTutorial(true);
    } else {
      // General fallbacks if standard install isn't programmatically ready
      alert("Aplikasi PWA siap pasang! Silakan klik tombol Menu Tiga Titik di browser Anda (Chrome/Firefox/Edge) lalu pilih 'Instal Aplikasi' atau 'Tambahkan ke Layar Utama'.");
    }
  };

  const [notifications, setNotifications] = useState<RealtimeNotification[]>([
    {
      id: 'notif-1',
      title: 'Selamat Datang!',
      message: 'Toko online Anda telah didaftarkan di cluster Exora Node 2026.',
      type: 'system',
      isRead: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 'notif-2',
      title: 'Order demo sedia didaftar',
      message: 'Gunakan tombol Simulator Lab di dashboard untuk memicu simulasi order.',
      type: 'system',
      isRead: false,
      timestamp: new Date().toISOString()
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'buyer',
      text: 'Ready gak min keyboardnya?',
      timestamp: new Date().toISOString(),
      shopId: 'shop-1',
      buyerId: 'buyer-demo'
    }
  ]);

  // Handler functions
  const handleCreateShopComplete = async (newShopData: Partial<Shop>) => {
    const newId = 'shop-' + Math.floor(Math.random() * 900000 + 100000);
    const completeShop: Shop = {
      id: newId,
      name: newShopData.name || 'Untitled Shop',
      slug: newShopData.slug || 'untitled',
      tagline: newShopData.tagline || '',
      category: newShopData.category || 'Fashion & Pakaian',
      logo: newShopData.logo || '🛍️',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      theme: newShopData.theme || 'minimal',
      rating: 5.0,
      followersCount: 0,
      contactEmail: newShopData.contactEmail || '',
      contactWhatsapp: newShopData.contactWhatsapp || '',
      isCustomDomainActive: false,
      points: 0,
      createdAt: new Date().toISOString(),
      ownerId: currentUser?.id || 'user-current'
    };

    await dbService.shops.create(completeShop);
    setShops(prev => [completeShop, ...prev]);
    setCurrentShopId(newId);
    
    // Add default products into the newly created shop for direct testing
    const defaultProducts: Product[] = [
      {
        id: `prod-new-1-${newId}`,
        shopId: newId,
        name: `${completeShop.name} Classic Mug`,
        price: 85000,
        category: completeShop.category,
        stock: 50,
        description: 'Premium merchandise mug with crisp custom laser prints.',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
        badge: 'New Release',
        rating: 5.0,
        salesCount: 0
      },
      {
        id: `prod-new-2-${newId}`,
        shopId: newId,
        name: `${completeShop.name} Premium Hoody`,
        price: 349000,
        category: completeShop.category,
        stock: 12,
        description: 'Cotton fleece signature comfortable streetwear outerwear with robust zippers.',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
        rating: 5.0,
        salesCount: 0
      }
    ];

    for (const p of defaultProducts) {
      await dbService.products.create(p);
    }
    setProducts(prev => [...defaultProducts, ...prev]);
    
    // Trigger system notification
    const newNotif: RealtimeNotification = {
      id: 'notif-' + Math.random(),
      title: 'Toko Sukses Terdaftar! ✨',
      message: `Toko "${completeShop.name}" berhasil diluncurkan. Kami menambahkan 2 produk default di katalog Anda!`,
      type: 'system',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    setView('seller-dashboard');
  };

  const handleAddProduct = async (prodData: Partial<Product>) => {
    const newProd: Product = {
      id: 'prod-' + Math.floor(Math.random() * 900000 + 100000),
      shopId: prodData.shopId || currentShopId,
      name: prodData.name || 'Produk Baru',
      price: prodData.price || 0,
      category: prodData.category || 'Lain-lain',
      stock: prodData.stock || 0,
      description: prodData.description || '',
      imageUrl: prodData.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      images: prodData.images || [],
      rating: 5.0,
      salesCount: 0
    };
    await dbService.products.create(newProd);
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateProductStock = async (pid: string, newStock: number) => {
    const findProd = products.find(p => p.id === pid);
    if (findProd) {
      const updated = { ...findProd, stock: newStock };
      await dbService.products.update(updated);
      setProducts(prev => prev.map(p => p.id === pid ? updated : p));
    }
  };

  const handleDeleteProduct = async (pid: string) => {
    await dbService.products.delete(pid);
    setProducts(prev => prev.filter(p => p.id !== pid));
  };

  const handleUpdateOrderStatus = async (oid: string, nextStatus: Order['status']) => {
    const findOrd = orders.find(o => o.id === oid);
    if (findOrd) {
      const updated = { ...findOrd, status: nextStatus };
      await dbService.orders.updateStatus(oid, nextStatus);
      setOrders(prev => prev.map(o => o.id === oid ? updated : o));
      
      // Add notification depending on status
      if (nextStatus === 'completed') {
        const activeShop = shops.find(s => s.id === findOrd.shopId);
        if (activeShop) {
          const updatedShop = { ...activeShop, points: activeShop.points + findOrd.pointsEarned * 2 };
          await dbService.shops.update(updatedShop);
          setShops(prev => prev.map(s => s.id === findOrd.shopId ? updatedShop : s));
        }
      }
    }
  };

  const handleAddStreamPost = async (content: string, mediaType?: 'image' | 'audio', mediaUrl?: string) => {
    const activeShop = shops.find(s => s.id === currentShopId);
    if (!activeShop) return;

    const newPost: StreamPost = {
      id: 'post-' + Math.floor(Math.random() * 900000 + 100000),
      shopId: activeShop.id,
      shopName: activeShop.name,
      shopLogo: activeShop.logo,
      content,
      mediaType,
      mediaUrl,
      likes: 0,
      hasLiked: false,
      comments: [],
      createdAt: new Date().toISOString()
    };
    await dbService.streams.create(newPost);
    setStreamPosts(prev => [newPost, ...prev]);
  };

  const handleAddStreamComment = async (postId: string, commentText: string) => {
    const activeShop = shops.find(s => s.id === currentShopId);
    const author = activeShop ? activeShop.name : 'Exora Partner';
    const targetPost = streamPosts.find(p => p.id === postId);
    if (targetPost) {
      const newComment = {
        id: 'c-' + Math.floor(Math.random() * 90000),
        authorName: author,
        content: commentText,
        createdAt: new Date().toISOString(),
        replies: []
      };
      const updated = {
        ...targetPost,
        comments: [...(targetPost.comments || []), newComment]
      };
      await dbService.streams.update(updated);
      setStreamPosts(prev => prev.map(p => p.id === postId ? updated : p));

      // Push real-time notification
      const newNotif: RealtimeNotification = {
        id: 'notif-' + Math.random(),
        title: 'Komentar Baru Dikirim 💬',
        message: `${author} berkomentar di postingan "${targetPost.content.substring(0, 20)}...": "${commentText}"`,
        type: 'chat',
        isRead: false,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleAddStreamCommentReply = async (postId: string, commentId: string, replyText: string) => {
    const activeShop = shops.find(s => s.id === currentShopId);
    const author = activeShop ? activeShop.name : 'Exora Partner';
    const targetPost = streamPosts.find(p => p.id === postId);
    if (targetPost) {
      const updatedComments = (targetPost.comments || []).map(comm => {
        if (comm.id === commentId) {
          const newReply = {
            id: 'r-' + Math.floor(Math.random() * 90000),
            authorName: author,
            content: replyText,
            createdAt: new Date().toISOString()
          };
          return {
            ...comm,
            replies: [...(comm.replies || []), newReply]
          };
        }
        return comm;
      });

      const updated = {
        ...targetPost,
        comments: updatedComments
      };
      await dbService.streams.update(updated);
      setStreamPosts(prev => prev.map(p => p.id === postId ? updated : p));

      // Push real-time notification
      const parentComment = targetPost.comments.find(c => c.id === commentId);
      const parentAuthor = parentComment ? parentComment.authorName : 'user';
      const newNotif: RealtimeNotification = {
        id: 'notif-' + Math.random(),
        title: 'Balasan Berhasil Dikirim 🔄',
        message: `${author} membalas komentar ${parentAuthor}: "${replyText}"`,
        type: 'chat',
        isRead: false,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleLikeStreamPost = async (postId: string) => {
    const targetPost = streamPosts.find(p => p.id === postId);
    if (targetPost) {
      const isCurrentlyLiked = targetPost.hasLiked;
      const updated = {
        ...targetPost,
        likes: targetPost.likes + (isCurrentlyLiked ? -1 : 1),
        hasLiked: !isCurrentlyLiked
      };
      await dbService.streams.update(updated);
      setStreamPosts(prev => prev.map(p => p.id === postId ? updated : p));
    }
  };

  const handleToggleAddon = (addonId: string) => {
    setAddons(prev => prev.map(ad => ad.id === addonId ? { ...ad, isUnlocked: !ad.isUnlocked } : ad));
  };

  const handleAddAdmin = (adminData: Partial<AdminUser>) => {
    const newAdmin: AdminUser = {
      id: 'admin-' + (admins.length + 1),
      name: adminData.name || 'Anonymous Staff',
      email: adminData.email || '',
      role: adminData.role || 'manager',
      status: 'invited'
    };
    setAdmins(prev => [...prev, newAdmin]);
  };

  const handleAddOrder = async (orderData: Partial<Order>) => {
    const newOrder: Order = {
      id: orderData.id || 'ORD-' + Math.floor(Math.random() * 900000 + 100000),
      shopId: orderData.shopId || '',
      buyerName: orderData.buyerName || 'Demo Customer',
      buyerEmail: orderData.buyerEmail || 'customer@example.com',
      buyerPhone: orderData.buyerPhone || '0812',
      buyerAddress: orderData.buyerAddress || 'Jl. Dago, Bandung',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: 'new',
      pointsEarned: orderData.pointsEarned || 0,
      createdAt: orderData.createdAt || new Date().toISOString()
    };

    await dbService.orders.create(newOrder);
    setOrders(prev => [newOrder, ...prev]);

    // Push real-time notification to the seller dashboard
    const newNotif: RealtimeNotification = {
      id: 'notif-' + Math.random(),
      title: '🛍️ PESANAN BARU MASUK!',
      message: `${newOrder.buyerName} mendaftarkan pesanan baru senilai Rp ${newOrder.totalAmount.toLocaleString('id-ID')}`,
      type: 'order',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Update active products stock based on purchased counts in db & local state
    for (const purchasedItem of newOrder.items) {
      const matchProd = products.find(p => p.id === purchasedItem.productId);
      if (matchProd) {
        const updatedProd = {
          ...matchProd,
          stock: Math.max(0, matchProd.stock - purchasedItem.quantity),
          salesCount: matchProd.salesCount + purchasedItem.quantity
        };
        await dbService.products.update(updatedProd);
        setProducts(prev => prev.map(p => p.id === purchasedItem.productId ? updatedProd : p));
      }
    }
  };

  const handleSendChatMessage = async (text: string) => {
    const activeShop = shops.find(s => s.id === selectedShopId);
    if (!activeShop) return;

    const newMsg: ChatMessage = {
      id: 'm-' + Math.floor(Math.random() * 90000),
      sender: 'buyer',
      text,
      timestamp: new Date().toISOString(),
      shopId: activeShop.id,
      buyerId: 'buyer-demo'
    };

    await dbService.chats.send(newMsg);
    setChatMessages(prev => [...prev, newMsg]);

    // Push real-time notification to warning seller
    const newNotif: RealtimeNotification = {
      id: 'notif-' + Math.random(),
      title: '💬 CHAT PELANGGAN BARU',
      message: `Buyer mengirim pesan: "${text.substring(0, 30)}..."`,
      type: 'chat',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Auto-reply simulation powered by Shop AI Autopilot
    setTimeout(async () => {
      try {
        const customKey = localStorage.getItem('exora_custom_groq_key') || '';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (customKey) {
          headers['X-Groq-Api-Key'] = customKey;
        }
        const res = await fetch('/api/groq/product-assistant', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            productName: "Bantuan Umum Pelanggan",
            productDescription: activeShop.tagline || activeShop.name,
            productPrice: 0,
            question: text,
            chatHistory: [...chatMessages, newMsg],
            shopPaymentRequisite: activeShop.paymentRequisite,
            shopAiInstructions: activeShop.aiInstructions
          })
        });

        let aiAnswer = 'Terima kasih atas pesanan Anda! Admin kami sedang memverifikasi detail Anda secara langsung.';
        if (res.ok) {
          const result = await res.json();
          if (result.answer) {
            aiAnswer = result.answer;
          }
        }

        const autoReply: ChatMessage = {
          id: 'mr-' + Math.floor(Math.random() * 90000),
          sender: 'seller',
          text: aiAnswer,
          timestamp: new Date().toISOString(),
          shopId: activeShop.id,
          buyerId: 'buyer-demo'
        };
        await dbService.chats.send(autoReply);
        setChatMessages(prev => [...prev, autoReply]);
      } catch (err) {
        console.error('Error generating AI chat response:', err);
      }
    }, 2000);
  };

  const handleSendSellerMessage = async (buyerId: string, text: string) => {
    const msg: ChatMessage = {
      id: 'm-' + Math.floor(Math.random() * 90000),
      sender: 'seller',
      text,
      timestamp: new Date().toISOString(),
      shopId: currentShopId,
      buyerId
    };
    await dbService.chats.send(msg);
    setChatMessages(prev => [...prev, msg]);
  };

  const handleToggleFollow = async (shopId: string) => {
    const targetShop = shops.find(s => s.id === shopId);
    if (!targetShop) return;

    const currentlyFollowing = followedShopIds.includes(shopId);
    const updatedShop = {
      ...targetShop,
      followersCount: Math.max(0, targetShop.followersCount + (currentlyFollowing ? -1 : 1))
    };

    await dbService.shops.update(updatedShop);

    if (currentlyFollowing) {
      setFollowedShopIds(prev => prev.filter(id => id !== shopId));
      setShops(prev => prev.map(s => s.id === shopId ? updatedShop : s));
    } else {
      setFollowedShopIds(prev => [...prev, shopId]);
      setShops(prev => prev.map(s => s.id === shopId ? updatedShop : s));

      // Notification
      const newNotif: RealtimeNotification = {
        id: 'notif-' + Math.random(),
        title: '⭐️ PENGANGKATAN FOLLOW BARU!',
        message: 'Pengguna anonim baru saja mem-follow toko Anda!',
        type: 'follow',
        isRead: false,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const triggerMockDemoOrder = () => {
    const activeProducts = products.filter(p => p.shopId === currentShopId);
    if (activeProducts.length === 0) return;

    // Pick random product
    const randProd = activeProducts[Math.floor(Math.random() * activeProducts.length)];
    const randQty = Math.floor(Math.random() * 2) + 1;
    const total = randProd.price * randQty;
    const points = Math.floor(total / 10000);

    const mockupNames = ['Aria Sastrabudi', 'Bella Kusuma', 'Carolus Gading', 'Doni Hermawan', 'Elisa Fitriani'];
    const selectedBuyerName = mockupNames[Math.floor(Math.random() * mockupNames.length)];

    handleAddOrder({
      id: 'ORD-' + Math.floor(Math.random() * 800000 + 100000),
      shopId: currentShopId,
      buyerName: selectedBuyerName,
      buyerEmail: `${selectedBuyerName.toLowerCase().replace(/ /g, '')}@gmail.com`,
      buyerPhone: '+6281200' + Math.floor(Math.random() * 90000 + 10000),
      buyerAddress: 'Jl. Surya Kencana No. ' + Math.floor(Math.random() * 80 + 1) + ', Bogor',
      items: [
        { productId: randProd.id, productName: randProd.name, price: randProd.price, quantity: randQty }
      ],
      totalAmount: total,
      pointsEarned: points,
      createdAt: new Date().toISOString()
    });
  };

  const handleUpdateShopConfig = async (updatedShop: Shop) => {
    setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
    try {
      await dbService.shops.update(updatedShop);
    } catch (err) {
      console.error("Failed to persist shop configurations:", err);
    }
  };

  const activeShopDetail = shops.find(s => s.id === currentShopId) || shops[0];
  const activeBuyerShop = (view === 'buyer-store' && selectedShopId) ? shops.find(s => s.id === selectedShopId) : null;

  return (
    <div id="exora-global-wrapper" className="min-h-screen flex flex-col justify-between">
      {/* GLOBAL HEAD NAVIGATION BAR */}
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setView('explore')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-zinc-100 flex items-center justify-center group-hover:scale-105 transition-all bg-white">
              <img src="/icon.jpg" alt="Exora Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-zinc-900 text-sm md:text-base">EXORA</span>
              <p className="text-[9px] text-zinc-400 font-medium tracking-wide">Indie Branding OS 2026</p>
            </div>
          </div>

          <nav className="hidden md:flex lg:flex items-center gap-1">
            {[
              { id: 'explore', label: 'Eksplorasi Toko', icon: 'Explore' },
              { id: 'seller-dashboard', label: 'Dashboard Penjual', icon: 'Dashboard' },
              { id: 'wizard', label: 'Buka Toko Baru ⚡', icon: 'Create' },
              { id: 'admin', label: 'Panel Admin 🛠️', icon: 'Admin' },
              { id: 'developer', label: 'Skema Database Supabase', icon: 'Developer' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id as any)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-250 ${
                  view === item.id 
                    ? 'bg-blue-50 text-blue-500 shadow-xs' 
                    : 'text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick Stats user account representation */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right">
                  <span className="text-xs font-bold text-zinc-900 block font-display">
                    {currentUser.name}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setIsBillingOpen(true)}
                    className="flex items-center gap-1 text-[10px] text-zinc-550 font-mono font-bold uppercase tracking-wider hover:text-indigo-600 transition"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${accountTier === 'pro' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-400'}`} />
                    Plan: <span className="underline">{accountTier === 'pro' ? 'EXORA PRO' : 'FREE'}</span>
                  </button>
                </div>
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Avatar" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border bg-zinc-50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await dbService.auth.signOut();
                    setView('explore');
                  }}
                  className="p-1.5 text-zinc-450 hover:text-red-500 rounded-lg hover:bg-zinc-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setView('seller-dashboard')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Masuk
              </button>
            )}
            <button
              type="button"
              onClick={() => setView('developer')}
              className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl hover:bg-zinc-100 transition relative"
              title="Lihat Supabase SQL Schema"
            >
              <Terminal className="w-4 h-4 text-zinc-650" />
            </button>
          </div>
        </div>

        {/* Short Banner Mobile Layout Nav */}
        <div className="md:hidden flex items-center justify-around border-t py-2 bg-white text-[11px] font-bold">
          <button type="button" onClick={() => setView('explore')} className={`p-2 ${view === 'explore' ? 'text-blue-500' : 'text-zinc-650'}`}>Eksplorasi</button>
          <button type="button" onClick={() => setView('seller-dashboard')} className={`p-2 ${view === 'seller-dashboard' ? 'text-blue-500' : 'text-zinc-650'}`}>Dashboard</button>
          <button type="button" onClick={() => setView('wizard')} className={`p-2 ${view === 'wizard' ? 'text-blue-500' : 'text-zinc-650'}`}>Buka Toko ⚡</button>
          <button type="button" onClick={() => setView('admin')} className={`p-2 ${view === 'admin' ? 'text-blue-500' : 'text-zinc-650'}`}>Admin 🛠️</button>
          <button type="button" onClick={() => setView('developer')} className={`p-2 ${view === 'developer' ? 'text-blue-500' : 'text-zinc-650'}`}>SQL</button>
        </div>
      </header>

      {/* RENDER VIEW SWITCH CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        {isDbLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-bold text-zinc-500 font-mono">Menyelaraskan Klaster Database Supabase Exora...</p>
          </div>
        ) : (
          (() => {
            // Guard private dashboard actions with Google Login
            if ((view === 'seller-dashboard' || view === 'wizard') && !currentUser) {
              return (
                <div className="max-w-md mx-auto py-12">
                  <GoogleLoginCard />
                </div>
              );
            }

            return (
              <>
                {view === 'explore' && (
                  <ExplorePage
                    shops={shops}
                    products={products}
                    onSelectShop={(shopId) => {
                      setSelectedShopId(shopId);
                      setView('buyer-store');
                    }}
                    followedShopIds={followedShopIds}
                    onToggleFollow={handleToggleFollow}
                  />
                )}

                {view === 'buyer-store' && selectedShopId && (
                  (() => {
                    const currentSelection = shops.find(s => s.id === selectedShopId) || shops[0];
                    return (
                      <BuyerStoreView
                        shop={currentSelection}
                        products={products}
                        onBack={() => setView('explore')}
                        onAddOrder={handleAddOrder}
                        isFollowed={followedShopIds.includes(currentSelection.id)}
                        onToggleFollow={() => handleToggleFollow(currentSelection.id)}
                        onSendChatMessage={handleSendChatMessage}
                        chatMessages={chatMessages}
                      />
                    );
                  })()
                )}

                {view === 'seller-dashboard' && activeShopDetail && (
                  <SellerDashboard
                    currentShop={activeShopDetail}
                    shops={shops}
                    products={products}
                    orders={orders}
                    streamPosts={streamPosts}
                    addons={addons}
                    admins={admins}
                    notifications={notifications}
                    onUpdateShop={handleUpdateShopConfig}
                    onAddProduct={handleAddProduct}
                    onUpdateProductStock={handleUpdateProductStock}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onAddStreamPost={handleAddStreamPost}
                    onAddStreamComment={handleAddStreamComment}
                    onAddStreamCommentReply={handleAddStreamCommentReply}
                    onLikeStreamPost={handleLikeStreamPost}
                    onSendSellerMessage={handleSendSellerMessage}
                    onToggleAddon={handleToggleAddon}
                    onAddAdmin={handleAddAdmin}
                    onDismissNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                    onClearNotifications={() => setNotifications([])}
                    onTriggerDemoOrder={triggerMockDemoOrder}
                    currentTier={accountTier}
                    onOpenBilling={() => setIsBillingOpen(true)}
                    onOpenBuyerView={() => {
                      setSelectedShopId(currentShopId);
                      setView('buyer-store');
                    }}
                  />
                )}

                {view === 'wizard' && (
                  <WizardStoreCreate
                    onComplete={handleCreateShopComplete}
                    onCancel={() => setView('explore')}
                  />
                )}

                {view === 'admin' && (
                  <AdminPanel
                    onBackToExplore={() => setView('explore')}
                    onRefreshGlobalData={async () => {
                      try {
                        let dbShops = await dbService.shops.getAll();
                        let dbProds = await dbService.products.getAll();
                        let dbOrders = await dbService.orders.getAll();
                        let dbChats = await dbService.chats.getAll();
                        let dbStreams = await dbService.streams.getAll();
                        
                        setShops(dbShops);
                        setProducts(dbProds);
                        setOrders(dbOrders);
                        setChatMessages(dbChats);
                        setStreamPosts(dbStreams);

                        const freshUser = await dbService.auth.getCurrentUser();
                        if (freshUser) {
                          setCurrentUser(freshUser);
                          setAccountTier(freshUser.account_tier || freshUser.accountTier || 'free');
                        }
                      } catch (err) {
                        console.error('Refresh global data error:', err);
                      }
                    }}
                    currentUserId={currentUser?.id}
                  />
                )}
              </>
            );
          })()
        )}

        {/* DEVELOPER SECTION TAB: EXPORTS SUPABASE METADATA MIGRATION SQL */}
        {view === 'developer' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 space-y-4 border border-zinc-900 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-semibold uppercase tracking-wider font-mono">
                <Terminal className="w-3.5 h-3.5" /> Supabase Schema Hub
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight">Backend Tersertifikasi & Siap Rilis</h2>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                Kami merancang skema database PostgreSQL real-time dan andal yang mengintegrasikan autentikasi profil, metadata logistik toko, andal terhadap perlindungan Row Level Security (RLS), and sistem point rewards.
              </p>
              <div className="p-4 bg-[#0a0f1d] border border-blue-900/30 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="font-bold text-blue-400 block">Daftar Tabulasi Relasional DB Aktif:</span>
                  <span className="text-zinc-550 mt-1 block">profiles, shops, products, orders, streams, chats, addons, followers, Team admins.</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Skema file SUPABASE_SCHEMA.sql ada di directory root proyek Anda!')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer"
                >
                  Salin File SQL Migrasi
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-150 overflow-hidden p-6 shadow-sm space-y-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Cuplikan PostgreSQL Migrations (SUPABASE_SCHEMA.sql)</span>
              
              <pre className="bg-zinc-50 text-zinc-800 p-4 rounded-xl text-[11px] font-mono whitespace-pre-wrap overflow-x-auto border border-zinc-150 max-h-[300px] leading-relaxed select-all">
{`-- Create table profile & shops 
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  points_balance INT DEFAULT 0
);

CREATE TABLE public.shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'minimal'
);

-- Row Level Security (RLS) configuration
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view any shop" ON public.shops
  FOR SELECT USING (true);`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* PLATFORM GLOBAL FOOTER */}
      <footer className="bg-zinc-950 text-white py-12 mt-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 bg-white shadow-xs flex items-center justify-center">
                <img src="/icon.jpg" alt="Exora Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="font-display font-black tracking-tight text-white text-sm">EXORA</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Membangun fondasi digital independen bagi ribuan kreator lokal di tahun 2026.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider mb-2">Platform</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); setView('explore'); }} className="text-zinc-400 hover:text-white block">Eksplorasi Toko</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setView('wizard'); }} className="text-zinc-400 hover:text-white block">Buka Toko Baru</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setView('seller-dashboard'); }} className="text-zinc-400 hover:text-white block">Dashboard Seller</a>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider mb-2">Keunggulan</h4>
            <span className="text-zinc-400 block">✓ Supabase Backend Integrator</span>
            <span className="text-zinc-400 block">✓ 0% Komisi Transaksi</span>
            <span className="text-zinc-400 block">✓ Progressive Web Apps Ready</span>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Keamanan & Performa</h4>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 max-w-xs text-[10px]">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              All Systems Operational (Node 2026)
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-zinc-900 mt-10 pt-6 text-center text-xs text-zinc-500 font-mono">
          &copy; 2026 Exora Inc. Platform modern all-in-one untuk toko independen Anda. All Rights Reserved.
        </div>
      </footer>

      {isBillingOpen && (
        <BillingModal
          isOpen={isBillingOpen}
          onClose={() => setIsBillingOpen(false)}
          currentTier={accountTier}
          onUpgrade={async (upgradePlan) => {
            setAccountTier(upgradePlan);
            await dbService.auth.updateAccountTier(upgradePlan);
            setIsBillingOpen(false);
          }}
        />
      )}

      {/* PWA FLOATING PROMPT CARD */}
      {showPwaInstallPrompt && (
        <div id="pwa-install-banner" className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-zinc-950/95 border border-zinc-800 text-white rounded-2xl shadow-2xl p-5 flex flex-col gap-3 animate-slide-up backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl shadow-md border border-indigo-400/20 select-none shrink-0 overflow-hidden">
                {activeBuyerShop ? (
                  <span className="text-xl flex items-center justify-center w-full h-full bg-zinc-900 font-emoji leading-none">{activeBuyerShop.logo}</span>
                ) : (
                  <img src="/icon.jpg" alt="Exora App" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase block font-mono">Progressive Web App</span>
                <h4 className="text-xs font-bold font-display text-zinc-100 truncate">
                  {activeBuyerShop ? `Instal Toko ${activeBuyerShop.name}` : 'Pasang Aplikasi Exora'}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                  {activeBuyerShop ? `Tambahkan toko ini ke layar utama HP Anda untuk transaksi instan layaknya aplikasi bawaan!` : 'Kelola toko online Anda & akses platform lebih cepat dari Home Screen.'}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setShowPwaInstallPrompt(false)}
              className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition shrink-0"
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2 items-center justify-end mt-1">
            <button 
              type="button" 
              onClick={() => setShowPwaInstallPrompt(false)}
              className="px-3 py-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-white text-[11px] font-bold rounded-lg transition"
            >
              Nanti Saja
            </button>
            <button 
              type="button" 
              onClick={handleInstallPwa}
              className="px-3 md:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" />
              {isIos ? 'Cara Pasang' : 'Instal Sekarang'}
            </button>
          </div>
        </div>
      )}

      {/* iOS MANUAL INSTALLATION TUTORIAL DIALOG */}
      {showIosTutorial && (
        <div id="ios-pwa-tutorial" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-2xl p-6 text-white text-center space-y-4 shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setShowIosTutorial(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition"
              title="Tutup tutorial"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 mx-auto bg-zinc-850 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner select-none border border-zinc-800">
              📱
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-black font-display tracking-tight text-white uppercase">Pasang Instan di iOS / iPhone</h3>
              <p className="text-xs text-zinc-400">Ikuti langkah sederhana berikut untuk menginstal aplikasi toko di HP Anda:</p>
            </div>
            
            <div className="bg-zinc-950/50 rounded-xl p-4 text-left space-y-3.5 border border-zinc-800/80 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-indigo-400 font-mono select-none shrink-0 border border-zinc-700">1</span>
                <span>Buka halaman ini lewat browser <b>Safari</b> di iPhone Anda.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-indigo-400 font-mono select-none shrink-0 border border-zinc-700">2</span>
                <span className="flex items-center gap-1.5 flex-wrap">Tekan tombol <b>Bagikan (Share)</b> <Share2 className="w-4 h-4 text-zinc-400 shrink-0 animate-bounce" /> di bagian bawah layar Safari Anda.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-indigo-400 font-mono select-none shrink-0 border border-zinc-700">3</span>
                <span>Scroll ke bawah lalu pilih opsi <b>Tambah ke Layar Utama (Add to Home Screen)</b>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-indigo-400 font-mono select-none shrink-0 border border-zinc-700">4</span>
                <span>Klik <b>Tambah (Add)</b> di pojok kanan atas, selesai!</span>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={() => setShowIosTutorial(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/25"
            >
              Saya Mengerti, Mulai Pasang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
