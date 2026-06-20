/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Shop, Product, Order, ChatMessage, StreamPost, AdminUser, RealtimeNotification } from '../types';

// Safe LocalStorage wrapper to prevent iframe DOMException / SecurityError crashes
const safeLocalStorage = {
  memoryStore: {} as Record<string, string>,
  
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // ignore security error
    }
    return this.memoryStore[key] || null;
  },
  
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // ignore security error
    }
    this.memoryStore[key] = value;
  },
  
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // ignore security error
    }
    delete this.memoryStore[key];
  }
};

// Environment variables (with local storage optional user overrides)
const getSupabaseConfig = () => {
  let url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  let key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const customUrl = safeLocalStorage.getItem('exora_custom_supabase_url');
  const customKey = safeLocalStorage.getItem('exora_custom_supabase_key');
  if (customUrl && customKey) {
    url = customUrl;
    key = customKey;
  }
  return { url, key };
};

const config = getSupabaseConfig();
const supabaseUrl = config.url;
const supabaseAnonKey = config.key;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

// Real client initialization if keys exist
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// PubSub for real-time reactivity when fallback is used
class SimplePubSub {
  private listeners: { [key: string]: Function[] } = {};

  subscribe(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  publish(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }
}

export const dbPubSub = new SimplePubSub();

// Helper to load/save fallback localStorage state
const localGet = (key: string, defaultValue: any) => {
  const data = safeLocalStorage.getItem(`exora_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

const localSet = (key: string, value: any) => {
  safeLocalStorage.setItem(`exora_${key}`, JSON.stringify(value));
  dbPubSub.publish(`change:${key}`, value);
};

// Initial setup helper for local fallback database
const initLocalStorageDB = () => {
  if (!safeLocalStorage.getItem('exora_setup')) {
    // Populate some initially completed orders & dummy items
    localSet('profile', {
      id: 'fathur-google-id',
      name: 'Fathur Rahman',
      email: 'Fathur48@gmail.com',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocL3-v402-example',
      account_tier: 'pro', // Default current mock partner to pro to see premium dashboard, can transition.
      points_balance: 450
    });
    
    // We already have INITIAL_SHOPS, etc. but we will load them into local persistence
    safeLocalStorage.setItem('exora_setup', 'true');
  }
};

if (!isSupabaseConfigured) {
  initLocalStorageDB();
}

/**
 * DB Core API Service (Unified Interface for Real and Sandbox Database)
 */
export const dbService = {
  // ---- AUTHENTICATION ----
  auth: {
    async getCurrentUser() {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // get user details from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) return data;

          // auto insert profile if missing
          const defaultProfile = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            account_tier: 'free',
            points_balance: 0
          };
          await supabase.from('profiles').insert(defaultProfile);
          return defaultProfile;
        }
        return null;
      } else {
        return localGet('profile', null);
      }
    },

    async signInWithGoogle() {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } else {
        // Fallback simulated interactive sign in
        const demoUser = {
          id: 'google-auth-usr-' + Math.floor(Math.random() * 100000),
          name: 'Fathur Rahman',
          email: 'Fathur48@gmail.com',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          account_tier: 'pro',
          points_balance: 2450
        };
        localSet('profile', demoUser);
        dbPubSub.publish('auth:state', demoUser);
        return demoUser;
      }
    },

    async signOut() {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      } else {
        localSet('profile', null);
        dbPubSub.publish('auth:state', null);
      }
    },

    onAuthStateChange(callback: (user: any) => void) {
      if (isSupabaseConfigured && supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            callback(data || session.user);
          } else {
            callback(null);
          }
        });
        return () => subscription.unsubscribe();
      } else {
        callback(localGet('profile', null));
        return dbPubSub.subscribe('auth:state', callback);
      }
    },

    async updateAccountTier(tier: 'free' | 'pro') {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ account_tier: tier }).eq('id', user.id);
        }
      } else {
        const profile = localGet('profile', null);
        if (profile) {
          profile.account_tier = tier;
          localSet('profile', profile);
          dbPubSub.publish('auth:state', profile);
        }
      }
    }
  },

  // ---- SHOPS ----
  shops: {
    async getAll(): Promise<Shop[]> {
      let rawShops: Shop[] = [];
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        rawShops = data || [];
      } else {
        rawShops = localGet('shops', []);
      }
      const unique: Shop[] = [];
      const ids = new Set<string>();
      for (const item of rawShops) {
        if (!ids.has(item.id)) {
          ids.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    },

    async create(shop: Shop) {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('shops').select('id').eq('id', shop.id).maybeSingle();
        if (!data) {
          const { error } = await supabase.from('shops').insert(shop);
          if (error) throw error;
        }
      } else {
        const shops = localGet('shops', []);
        if (!shops.some((s: Shop) => s.id === shop.id)) {
          shops.unshift(shop);
          localSet('shops', shops);
        }
      }
    },

    async update(shop: Shop) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('shops').update(shop).eq('id', shop.id);
        if (error) throw error;
      } else {
        const shops = localGet('shops', []);
        const updated = shops.map((s: Shop) => s.id === shop.id ? shop : s);
        localSet('shops', updated);
      }
    }
  },

  // ---- PRODUCTS ----
  products: {
    async getAll(): Promise<Product[]> {
      let rawProds: Product[] = [];
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        rawProds = data || [];
      } else {
        rawProds = localGet('products', []);
      }
      const unique: Product[] = [];
      const ids = new Set<string>();
      for (const item of rawProds) {
        if (!ids.has(item.id)) {
          ids.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    },

    async create(product: Product) {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('products').select('id').eq('id', product.id).maybeSingle();
        if (!data) {
          const { error } = await supabase.from('products').insert(product);
          if (error) throw error;
        }
      } else {
        const products = localGet('products', []);
        if (!products.some((p: Product) => p.id === product.id)) {
          products.unshift(product);
          localSet('products', products);
        }
      }
    },

    async update(product: Product) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('products').update(product).eq('id', product.id);
        if (error) throw error;
      } else {
        const products = localGet('products', []);
        const updated = products.map((p: Product) => p.id === product.id ? product : p);
        localSet('products', updated);
      }
    },

    async delete(id: string) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
      } else {
        const products = localGet('products', []);
        const filtered = products.filter((p: Product) => p.id !== id);
        localSet('products', filtered);
      }
    }
  },

  // ---- ORDERS ----
  orders: {
    async getAll(): Promise<Order[]> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Order[];
      } else {
        return localGet('orders', []);
      }
    },

    async create(order: Order) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('orders').insert(order);
        if (error) throw error;
      } else {
        const orders = localGet('orders', []);
        orders.unshift(order);
        localSet('orders', orders);
      }
    },

    async updateStatus(orderId: string, status: Order['status']) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) throw error;
      } else {
        const orders = localGet('orders', []);
        const updated = orders.map((o: Order) => o.id === orderId ? { ...o, status } : o);
        localSet('orders', updated);
      }
    }
  },

  // ---- CHAT MESSAGES ----
  chats: {
    async getAll(): Promise<ChatMessage[]> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('chat_messages').select('*').order('timestamp', { ascending: true });
        if (error) throw error;
        return data as ChatMessage[];
      } else {
        return localGet('chat_messages', []);
      }
    },

    async send(msg: ChatMessage) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('chat_messages').insert(msg);
        if (error) throw error;
      } else {
        const chats = localGet('chat_messages', []);
        chats.push(msg);
        localSet('chat_messages', chats);
      }
    },

    subscribeToChats(callback: (chat: ChatMessage) => void) {
      if (isSupabaseConfigured && supabase) {
        const sub = supabase
          .channel('realtime_chats')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
            callback(payload.new as ChatMessage);
          })
          .subscribe();
        return () => supabase.removeChannel(sub);
      } else {
        // Return clear event listener callback subscription
        return dbPubSub.subscribe('change:chat_messages', (allMsgs: ChatMessage[]) => {
          if (allMsgs && allMsgs.length > 0) {
            callback(allMsgs[allMsgs.length - 1]);
          }
        });
      }
    }
  },

  // ---- STREAM HUGS ----
  streams: {
    async getAll(): Promise<StreamPost[]> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('stream_posts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as StreamPost[];
      } else {
        return localGet('stream_posts', []);
      }
    },

    async create(post: StreamPost) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('stream_posts').insert(post);
        if (error) throw error;
      } else {
        const posts = localGet('stream_posts', []);
        posts.unshift(post);
        localSet('stream_posts', posts);
      }
    },

    async update(post: StreamPost) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('stream_posts').update(post).eq('id', post.id);
        if (error) throw error;
      } else {
        const posts = localGet('stream_posts', []);
        const updated = posts.map((p: StreamPost) => p.id === post.id ? post : p);
        localSet('stream_posts', updated);
      }
    }
  },

  // ---- STORAGE FILE UPLOAD ----
  storage: {
    async upload(file: File): Promise<string> {
      if (isSupabaseConfigured && supabase) {
        const fileExt = file.name.split('.').pop();
        const randId = Math.random().toString(36).substring(2);
        const fileName = `${Date.now()}-${randId}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        return publicUrl;
      } else {
        // For local simulation, we convert the dropped file to a local object URL or reliable local base64 data uri representing the image
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(file);
        });
      }
    }
  },

  // ---- ADMIN MANAGEMENT ----
  admin: {
    async getAllUsers() {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;
        return data;
      } else {
        // Gabungan user yang sedang login dengan beberapa mock user pembeli / partner toko
        const currentProfile = localGet('profile', null);
        const usersList = [];
        if (currentProfile) {
          usersList.push(currentProfile);
        }
        
        // Tambahkan beberapa demo user
        const mockUsers = [
          {
            id: 'demo-user-1',
            name: 'Ahmad Budi',
            email: 'ahmad@budi.com',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
            account_tier: 'free',
            points_balance: 100,
            createdAt: '2026-03-12T08:30:00Z'
          },
          {
            id: 'demo-user-2',
            name: 'Siti Handayani',
            email: 'siti@handayani.id',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
            account_tier: 'pro',
            points_balance: 1500,
            createdAt: '2026-04-01T12:15:00Z'
          },
          {
            id: 'demo-user-3',
            name: 'Rian Hidayat',
            email: 'rian@hidayat.co.id',
            avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150',
            account_tier: 'free',
            points_balance: 0,
            createdAt: '2026-05-18T16:45:00Z'
          }
        ];

        // Pastikan kita tidak duplikasi fathur atau user yang sama
        const finalUsers = [...usersList];
        mockUsers.forEach(mu => {
          if (!finalUsers.some(u => u.id === mu.id || u.email === mu.email)) {
            finalUsers.push(mu);
          }
        });

        // Simpan ke local admin_profiles agar persisten jika ada perubahan tier
        const storedProfiles = localGet('admin_profiles', []);
        if (storedProfiles.length === 0) {
          localSet('admin_profiles', finalUsers);
          return finalUsers;
        } else {
          // Cari jika currentProfile diupdate diluar, sync ke admin_profiles
          if (currentProfile) {
            const idx = storedProfiles.findIndex((u: any) => u.id === currentProfile.id);
            if (idx !== -1) {
              storedProfiles[idx].account_tier = currentProfile.account_tier;
              storedProfiles[idx].points_balance = currentProfile.points_balance;
            } else {
              storedProfiles.push(currentProfile);
            }
          }
          return storedProfiles;
        }
      }
    },

    async updateUserTier(userId: string, tier: 'free' | 'pro') {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ account_tier: tier })
          .eq('id', userId);
        if (error) throw error;
      } else {
        // Update di admin_profiles
        const storedProfiles = localGet('admin_profiles', []);
        const updated = storedProfiles.map((u: any) => {
          if (u.id === userId) {
            return { ...u, account_tier: tier };
          }
          return u;
        });
        localSet('admin_profiles', updated);

        // Jika user yang ditarget adalah diri sendiri, kita update juga state active login profile
        const currentProfile = localGet('profile', null);
        if (currentProfile && currentProfile.id === userId) {
          currentProfile.account_tier = tier;
          localSet('profile', currentProfile);
          dbPubSub.publish('auth:state', currentProfile);
        }
      }
    }
  }
};
