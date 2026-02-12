-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (to extend auth.users with app-specific data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create Roles Table (optional but good for RBAC)
-- If we only need string-based roles, we can skip this, but strict RBAC benefits from this.
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- 'owner', 'admin', 'editor', 'viewer', 'superadmin'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed basic roles
INSERT INTO public.roles (name, description) VALUES
('superadmin', 'System Administrator with full access'),
('owner', 'Business Owner with full access to their business'),
('admin', 'Business Administrator with management access'),
('editor', 'Can edit content but not manage business settings'),
('viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- 3. Create Business Members (Linking Users to Businesses with Roles)
-- This replaces/enhances 'user_roles' if it was ambiguous.
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')), -- Simplified without FK if preferred, or use role_id UUID REFERENCES public.roles(id)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(business_id, user_id)
);

-- 4. Super Admin Management
-- We can use a specific role in `auth.users` metadata or a flag in `profiles`.
-- Let's use a flag in `profiles` for simplicity and security (it's separate from business logic).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 5. Helper Funcs
-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role in a business
CREATE OR REPLACE FUNCTION public.get_user_role(business_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.business_members
  WHERE user_id = auth.uid() AND business_id = business_uuid AND is_active = TRUE;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies (Row Level Security) - Crucial for security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile. Super admins can read all.
CREATE POLICY "Users can verify own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_super_admin());

-- Business Members: Members of a business can see other members.
CREATE POLICY "Members can view business members" ON public.business_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid()
    ) OR
    public.is_super_admin()
  );

-- Only Business Admin/Owner can manage members
CREATE POLICY "Admins can manage members" ON public.business_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = business_members.business_id 
      AND bm.user_id = auth.uid() 
      AND bm.role IN ('owner', 'admin')
    ) OR
    public.is_super_admin()
  );

-- Businesses: Members can view their businesses.
CREATE POLICY "Members can view their businesses" ON public.businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = id AND bm.user_id = auth.uid() AND bm.is_active = TRUE
    ) OR
    public.is_super_admin()
  );

-- Only Super Admins can create/delete businesses
CREATE POLICY "Super Admins can manage businesses" ON public.businesses
  FOR ALL USING (public.is_super_admin());
