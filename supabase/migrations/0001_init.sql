-- ==============================================================================
-- Migration: 0001_init.sql
-- Description: Schema initial EasyLead (Types, Tables, Fonctions, Triggers, RLS)
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE search_status AS ENUM ('pending', 'running', 'ingesting', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'replied', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE message_channel AS ENUM ('whatsapp', 'email', 'call_script');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE credit_reason AS ENUM ('signup_bonus', 'purchase', 'search_reserve', 'search_refund', 'message', 'message_refund');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES

-- Profiles (utilisateurs SaaS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company_name text,
  offer_description text,
  target_description text,
  default_language text DEFAULT 'fr' CHECK (default_language IN ('fr', 'en')),
  country_code text DEFAULT 'CM',
  credits_balance integer DEFAULT 0 CHECK (credits_balance >= 0),
  onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Searches (sessions de scraping Apify)
CREATE TABLE IF NOT EXISTS public.searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sector text NOT NULL,
  city text NOT NULL,
  country_code text NOT NULL DEFAULT 'CM',
  max_results integer NOT NULL DEFAULT 50,
  enrich_contacts boolean NOT NULL DEFAULT false,
  status search_status NOT NULL DEFAULT 'pending',
  apify_run_id text,
  apify_dataset_id text,
  results_count integer NOT NULL DEFAULT 0,
  credits_reserved integer NOT NULL DEFAULT 0,
  credits_charged integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Leads (entreprises extraites via Google Maps)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id text,
  name text NOT NULL,
  category text,
  address text,
  city text,
  country_code text DEFAULT 'CM',
  phone text,
  phone_e164 text,
  website text,
  email text,
  socials jsonb DEFAULT '{}'::jsonb,
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  maps_url text,
  lat numeric,
  lng numeric,
  status lead_status NOT NULL DEFAULT 'new',
  notes text,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_search_place UNIQUE (search_id, place_id)
);

-- Messages IA générés (WhatsApp, Email, Script)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel message_channel NOT NULL,
  language text NOT NULL DEFAULT 'fr',
  tone text NOT NULL DEFAULT 'professionnel',
  subject text,
  body text NOT NULL,
  model text DEFAULT 'claude-3-5-sonnet',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions de crédits (registre comptable)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason credit_reason NOT NULL,
  ref_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Paiements EasyLead (Mobile Money / CinetPay / Stripe)
CREATE TABLE IF NOT EXISTS public.easylead_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'cinetpay',
  provider_tx_id text NOT NULL UNIQUE,
  pack_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  credits integer NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  phone_number text,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_searches_user_created ON public.searches(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_searches_status ON public.searches(status);
CREATE INDEX IF NOT EXISTS idx_leads_search ON public.leads(search_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON public.leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON public.leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_lead ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_easylead_payments_user ON public.easylead_payments(user_id, created_at DESC);

-- 4. FONCTIONS ATOMIQUES (SECURITY DEFINER)

-- Débit de crédits atomique
CREATE OR REPLACE FUNCTION public.debit_credits(
  p_user uuid,
  p_amount integer,
  p_reason credit_reason,
  p_ref text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount_must_be_positive';
  END IF;

  UPDATE public.profiles
  SET credits_balance = credits_balance - p_amount,
      updated_at = now()
  WHERE id = p_user AND credits_balance >= p_amount
  RETURNING credits_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, reason, ref_id)
  VALUES (p_user, -p_amount, p_reason, p_ref);

  RETURN v_new_balance;
END;
$$;

-- Ajout de crédits atomique
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user uuid,
  p_amount integer,
  p_reason credit_reason,
  p_ref text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount_must_be_positive';
  END IF;

  UPDATE public.profiles
  SET credits_balance = credits_balance + p_amount,
      updated_at = now()
  WHERE id = p_user
  RETURNING credits_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, reason, ref_id)
  VALUES (p_user, p_amount, p_reason, p_ref);

  RETURN v_new_balance;
END;
$$;

-- Trigger à la création d'un utilisateur Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bonus integer := 50;
  v_name text;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id,
    full_name,
    credits_balance,
    onboarded
  ) VALUES (
    NEW.id,
    v_name,
    v_bonus,
    false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    reason,
    ref_id
  ) VALUES (
    NEW.id,
    v_bonus,
    'signup_bonus',
    'welcome_bonus'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.easylead_payments ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Sécurité stricte du solde de crédits : les utilisateurs ne peuvent pas modifier leur solde directement
REVOKE UPDATE (credits_balance) ON public.profiles FROM authenticated;

-- Politiques Searches
DROP POLICY IF EXISTS "searches_select_own" ON public.searches;
CREATE POLICY "searches_select_own" ON public.searches
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Politiques Leads
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;
CREATE POLICY "leads_select_own" ON public.leads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "leads_update_status_notes" ON public.leads;
CREATE POLICY "leads_update_status_notes" ON public.leads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques Messages
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Politiques Credit Transactions
DROP POLICY IF EXISTS "credit_transactions_select_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Politiques Payments
DROP POLICY IF EXISTS "easylead_payments_select_own" ON public.easylead_payments;
CREATE POLICY "easylead_payments_select_own" ON public.easylead_payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
