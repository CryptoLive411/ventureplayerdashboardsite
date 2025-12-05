-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'athlete');

-- Create user roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'athlete',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create player status enum
CREATE TYPE public.player_status AS ENUM ('active', 'in_placement', 'placed', 'archived');

-- Create division enum
CREATE TYPE public.division_type AS ENUM ('NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'NJCAA');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    nationality TEXT,
    date_of_birth DATE,
    position TEXT,
    current_club TEXT,
    height_cm INTEGER,
    weight_kg INTEGER,
    graduation_year INTEGER,
    gpa DECIMAL(3,2),
    gpa_scale TEXT DEFAULT '4.0',
    sat_score INTEGER,
    act_score INTEGER,
    toefl_score INTEGER,
    ielts_score DECIMAL(2,1),
    budget_per_year INTEGER,
    target_intake TEXT,
    target_divisions division_type[] DEFAULT '{}',
    target_regions TEXT[] DEFAULT '{}',
    additional_notes TEXT,
    highlight_video_url TEXT,
    status player_status DEFAULT 'active',
    assigned_admin_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create checklist items table
CREATE TABLE public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on checklist_items
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Create college contact status enum
CREATE TYPE public.college_status AS ENUM ('not_contacted', 'contacted', 'interested', 'communication', 'offer_made', 'not_interested', 'rejected');

-- Create college tracking table
CREATE TABLE public.college_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    college_name TEXT NOT NULL,
    division division_type,
    state TEXT,
    city TEXT,
    coach_name TEXT,
    coach_email TEXT,
    coach_phone TEXT,
    status college_status DEFAULT 'not_contacted',
    last_action_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on college_tracking
ALTER TABLE public.college_tracking ENABLE ROW LEVEL SECURITY;

-- Create offers table
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    college_tracking_id UUID REFERENCES public.college_tracking(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    scholarship_amount INTEGER,
    scholarship_percentage INTEGER,
    offer_type TEXT CHECK (offer_type IN ('athletic', 'academic', 'combined')),
    deadline DATE,
    status TEXT DEFAULT 'considering' CHECK (status IN ('considering', 'accepted', 'declined')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create admin notes table (internal, not visible to players)
CREATE TABLE public.admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_notes
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles: users can view their own roles, admins can view all
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: athletes see own, admins see all
CREATE POLICY "Athletes can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Athletes can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Checklist items: athletes see own, admins manage all
CREATE POLICY "Athletes can view own checklist" ON public.checklist_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = checklist_items.player_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all checklists" ON public.checklist_items
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- College tracking: athletes see own, admins manage all
CREATE POLICY "Athletes can view own colleges" ON public.college_tracking
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = college_tracking.player_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all colleges" ON public.college_tracking
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Offers: athletes see own, admins manage all
CREATE POLICY "Athletes can view own offers" ON public.offers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = offers.player_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all offers" ON public.offers
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin notes: only admins can see and manage
CREATE POLICY "Only admins can view admin notes" ON public.admin_notes
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage admin notes" ON public.admin_notes
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  
  -- Add default athlete role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'athlete');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_tracking_updated_at BEFORE UPDATE ON public.college_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();