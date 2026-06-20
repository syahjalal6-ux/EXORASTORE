/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ShopTheme = 'minimal' | 'modern-dark' | 'neon-cyan' | 'warm-sunset' | 'royal-emerald';

export interface Shop {
  id: string;
  name: string;
  slug: string; // subdomain/slug: name.exora.shop
  tagline: string;
  category: string;
  logo: string;
  banner: string;
  theme: ShopTheme;
  rating: number;
  followersCount: number;
  contactEmail: string;
  contactWhatsapp: string;
  isCustomDomainActive: boolean;
  customDomain?: string;
  points: number;
  createdAt: string;
  ownerId: string;
  paymentRequisite?: string;
  aiInstructions?: string;
  announcementText?: string;
  announcementAudioUrl?: string;
  announcementVideoUrl?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  imageUrl: string;
  images?: string[]; // Multiple photos supported (Free: max 2, Pro: Unlimited)
  badge?: string; // e.g. "Best Seller", "10% OFF"
  rating: number;
  salesCount: number;
  colors?: string[]; // Color variants cth: ["Hitam", "Putih", "Navy"]
  sizes?: string[];  // Size variants cth: ["S", "M", "L", "XL"]
}

export interface Order {
  id: string;
  shopId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
  totalAmount: number;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  pointsEarned: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  shopId: string;
  buyerId: string;
}

export interface StreamPost {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string;
  content: string;
  mediaType?: 'image' | 'audio' | 'video_doc';
  mediaUrl?: string;
  likes: number;
  hasLiked?: boolean;
  comments: {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
    replies?: {
      id: string;
      authorName: string;
      content: string;
      createdAt: string;
    }[];
  }[];
  createdAt: string;
}

export interface PremiumAddon {
  id: string;
  name: string;
  description: string;
  price: number; // e.g. 50000 / month or Exora Points
  category: 'marketing' | 'infrastructure' | 'operations';
  icon: string;
  isUnlocked: boolean;
  pointsCost: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'editor' | 'finance';
  status: 'active' | 'invited';
}

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'follow' | 'chat' | 'system';
  isRead: boolean;
  timestamp: string;
}
