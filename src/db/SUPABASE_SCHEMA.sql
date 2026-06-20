-- ==========================================
-- SUPABASE MIGRATION DATABASE SCHEMA
-- PLATFORM: EXORA SHOP (Startup Ecommerce Builder 2026)
-- DESCRIPTION: Production-ready Postgres SQL with Row Level Security (RLS), Profiles, Shops, Products, Orders, Comments, Followers, and Addon settings.
-- ==========================================

-- Enable Necessary Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILES TABLE (Extensions to Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  points_balance INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. SHOPS TABLE (Each user owns one or more shops)
CREATE TABLE public.shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) >= 3),
  slug TEXT NOT NULL UNIQUE CHECK (char_length(slug) >= 3 AND slug ~ '^[a-z0-9-]+$'),
  tagline TEXT,
  category TEXT NOT NULL,
  logo TEXT DEFAULT '🛒',
  banner_url TEXT,
  theme TEXT NOT NULL DEFAULT 'minimal',
  rating NUMERIC(3,2) DEFAULT 5.0,
  followers_count INT DEFAULT 0,
  contact_email TEXT,
  contact_whatsapp TEXT,
  is_custom_domain_active BOOLEAN DEFAULT false,
  custom_domain TEXT UNIQUE,
  points INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Shops
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view any shop" ON public.shops
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage their shops" ON public.shops
  FOR ALL USING (auth.uid() = owner_id);

-- 3. PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INT NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  image_url TEXT,
  badge TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  sales_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Shop owners can manage their products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- 4. ORDERS TABLE
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  items JSONB NOT NULL, -- Array of products: [{productId, productName, price, quantity}]
  total_amount INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'processing', 'shipped', 'completed', 'cancelled')) DEFAULT 'new',
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Shop owners/admins can view and update orders of their shops" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- 5. STREAM POSTS TABLE (Seller Hub)
CREATE TABLE public.stream_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'audio', 'video_doc')),
  media_url TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Stream Posts
ALTER TABLE public.stream_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seller posts" ON public.stream_posts
  FOR SELECT USING (true);

CREATE POLICY "Shop owners can create/delete posts" ON public.stream_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = stream_posts.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- 6. CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('buyer', 'seller')),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Chats
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can manage their own chats" ON public.chat_messages
  FOR ALL USING (auth.uid() = buyer_id);

CREATE POLICY "Shop owners can manage chats for their shop" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = chat_messages.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- 7. PLUGINS AND ADDONS TABLE
CREATE TABLE public.premium_addons_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  addon_slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(shop_id, addon_slug)
);

ALTER TABLE public.premium_addons_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owner can manage addons" ON public.premium_addons_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = premium_addons_config.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- 8. SHOP FOLLOWERS RELATION
CREATE TABLE public.shop_followers (
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (shop_id, profile_id)
);

ALTER TABLE public.shop_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check follower counts" ON public.shop_followers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can toggle follow status" ON public.shop_followers
  FOR ALL USING (auth.uid() = profile_id);

-- 9. MULTI-ADMINS AND ROLES TABLE
CREATE TABLE public.shop_admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'editor', 'finance')),
  status TEXT NOT NULL CHECK (status IN ('active', 'invited')) DEFAULT 'invited',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(shop_id, email)
);

ALTER TABLE public.shop_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view team members" ON public.shop_admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_admins.shop_id AND shops.owner_id = auth.uid()
    ) OR email = (SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Owners can modify team members" ON public.shop_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_admins.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- ==========================================
-- AUTOMATION TRIGGER FOR FOLLOWERS COUNT INCREMENTATION
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_follower_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.shops
    SET followers_count = followers_count + 1
    WHERE id = NEW.shop_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.shops
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.shop_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follower_registration
  AFTER INSERT OR DELETE ON public.shop_followers
  FOR EACH ROW EXECUTE FUNCTION public.handle_follower_change();

-- ==========================================
-- REGISTER USER PROFILE TRIGGER ON AUTH.SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
