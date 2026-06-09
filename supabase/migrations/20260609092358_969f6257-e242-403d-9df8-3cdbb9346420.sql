
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'passenger', 'corporate_admin');
CREATE TYPE public.sub_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');
CREATE TYPE public.txn_type AS ENUM ('topup', 'ride_payment', 'payout', 'refund', 'adjustment');
CREATE TYPE public.txn_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.recurrence AS ENUM ('once', 'daily', 'weekdays', 'weekly', 'monthly');
CREATE TYPE public.doc_type AS ENUM ('drivers_license', 'prdp', 'vehicle_registration', 'vehicle_insurance', 'roadworthy', 'id_document', 'other');
CREATE TYPE public.doc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE public.incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.incident_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');

-- ============ updated_at trigger fn already exists ============

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ COMPANIES ============
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vat_number text,
  billing_email text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company AND user_id = _user AND is_admin = true) $$;

CREATE OR REPLACE FUNCTION public.is_company_member(_company uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company AND user_id = _user) $$;

CREATE POLICY "members read company" ON public.companies FOR SELECT TO authenticated USING (public.is_company_member(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users create company" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "company admins update" ON public.companies FOR UPDATE TO authenticated USING (public.is_company_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "company admins delete" ON public.companies FOR DELETE TO authenticated USING (public.is_company_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "members read members" ON public.company_members FOR SELECT TO authenticated USING (public.is_company_member(company_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "company admins manage members" ON public.company_members FOR ALL TO authenticated USING (public.is_company_admin(company_id, auth.uid()) OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.is_company_admin(company_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- ============ SUBSCRIPTION PLANS ============
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  stripe_product_id text,
  stripe_price_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  interval text NOT NULL DEFAULT 'month',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "anyone reads active plans" ON public.subscription_plans FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status public.sub_status NOT NULL DEFAULT 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((user_id IS NOT NULL) OR (company_id IS NOT NULL))
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "users read own sub" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR (company_id IS NOT NULL AND public.is_company_member(company_id, auth.uid())) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage subs" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ INVOICES ============
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  stripe_invoice_id text UNIQUE,
  amount_cents integer NOT NULL,
  tax_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZAR',
  status public.invoice_status NOT NULL DEFAULT 'draft',
  hosted_invoice_url text,
  pdf_url text,
  issued_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "users read own invoices" ON public.invoices FOR SELECT TO authenticated USING (auth.uid() = user_id OR (company_id IS NOT NULL AND public.is_company_admin(company_id, auth.uid())) OR public.has_role(auth.uid(), 'admin'));

-- ============ WALLETS ============
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZAR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "users read own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- create wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_wallet AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- ============ WALLET TRANSACTIONS ============
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_request_id uuid REFERENCES public.ride_requests(id) ON DELETE SET NULL,
  type public.txn_type NOT NULL,
  status public.txn_status NOT NULL DEFAULT 'pending',
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  description text,
  stripe_payment_intent_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_wtxn_updated BEFORE UPDATE ON public.wallet_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "users read own txns" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ SAVED ROUTES ============
CREATE TABLE public.saved_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  pickup text NOT NULL,
  dropoff text NOT NULL,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_lat double precision,
  dropoff_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_routes TO authenticated;
GRANT ALL ON public.saved_routes TO service_role;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_saved_routes_updated BEFORE UPDATE ON public.saved_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "users manage own routes" ON public.saved_routes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ SCHEDULED RIDES ============
CREATE TABLE public.scheduled_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_route_id uuid REFERENCES public.saved_routes(id) ON DELETE SET NULL,
  pickup text NOT NULL,
  dropoff text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  recurrence public.recurrence NOT NULL DEFAULT 'once',
  seats integer NOT NULL DEFAULT 1,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_rides TO authenticated;
GRANT ALL ON public.scheduled_rides TO service_role;
ALTER TABLE public.scheduled_rides ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sched_updated BEFORE UPDATE ON public.scheduled_rides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "users manage own scheduled" ON public.scheduled_rides FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ROUTE CLUSTERS ============
CREATE TABLE public.route_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time time NOT NULL,
  days_of_week int[] NOT NULL DEFAULT '{}',
  seats_available integer NOT NULL DEFAULT 4,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZAR',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_clusters TO authenticated;
GRANT ALL ON public.route_clusters TO service_role;
ALTER TABLE public.route_clusters ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_clusters_updated BEFORE UPDATE ON public.route_clusters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "anyone reads published clusters" ON public.route_clusters FOR SELECT TO authenticated USING (is_published = true OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "drivers manage own clusters" ON public.route_clusters FOR ALL TO authenticated USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())) WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- ============ DRIVER DOCUMENTS ============
CREATE TABLE public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  doc_type public.doc_type NOT NULL,
  file_url text,
  doc_number text,
  expires_at date,
  status public.doc_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_documents TO authenticated;
GRANT ALL ON public.driver_documents TO service_role;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_docs_updated BEFORE UPDATE ON public.driver_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "driver reads own docs" ON public.driver_documents FOR SELECT TO authenticated USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "driver inserts own docs" ON public.driver_documents FOR INSERT TO authenticated WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
CREATE POLICY "driver updates own docs" ON public.driver_documents FOR UPDATE TO authenticated USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete docs" ON public.driver_documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ INCIDENTS ============
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id uuid REFERENCES public.ride_requests(id) ON DELETE SET NULL,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  severity public.incident_severity NOT NULL DEFAULT 'low',
  status public.incident_status NOT NULL DEFAULT 'open',
  description text NOT NULL,
  location text,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_incidents_updated BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "reporter or admin reads" ON public.incidents FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users report incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "admins update incidents" ON public.incidents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ RIDE RATINGS ============
CREATE TABLE public.ride_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id uuid NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ratee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ride_request_id, rater_id)
);
GRANT SELECT, INSERT ON public.ride_ratings TO authenticated;
GRANT ALL ON public.ride_ratings TO service_role;
ALTER TABLE public.ride_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read ratings" ON public.ride_ratings FOR SELECT TO authenticated USING (auth.uid() = rater_id OR auth.uid() = ratee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "participant submits rating" ON public.ride_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = rater_id AND public.is_ride_participant(ride_request_id, auth.uid()));

-- ============ VEHICLE PINGS ============
CREATE TABLE public.vehicle_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  ride_request_id uuid REFERENCES public.ride_requests(id) ON DELETE SET NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  heading double precision,
  speed_kph double precision,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.vehicle_pings TO authenticated;
GRANT ALL ON public.vehicle_pings TO service_role;
ALTER TABLE public.vehicle_pings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pings_driver_time ON public.vehicle_pings (driver_id, recorded_at DESC);
CREATE POLICY "driver inserts own pings" ON public.vehicle_pings FOR INSERT TO authenticated WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
CREATE POLICY "driver reads own pings" ON public.vehicle_pings FOR SELECT TO authenticated USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()) OR (ride_request_id IS NOT NULL AND public.is_ride_participant(ride_request_id, auth.uid())) OR public.has_role(auth.uid(), 'admin'));
