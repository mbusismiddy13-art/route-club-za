ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS approval_note text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE OR REPLACE FUNCTION public.protect_driver_in_house()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_in_house := false;
      NEW.approval_status := 'pending';
      NEW.approval_note := NULL;
      NEW.reviewed_at := NULL;
    ELSE
      NEW.is_in_house := OLD.is_in_house;
      NEW.approval_status := OLD.approval_status;
      NEW.approval_note := OLD.approval_note;
      NEW.reviewed_at := OLD.reviewed_at;
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE POLICY "admins update drivers" ON public.drivers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "creator adds self as first admin" ON public.company_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.created_by = auth.uid()));

CREATE POLICY "creator reads company" ON public.companies FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE OR REPLACE FUNCTION public.add_company_member_by_email(_company uuid, _email text, _is_admin boolean DEFAULT false)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid; _id uuid;
BEGIN
  IF NOT (public.is_company_admin(_company, auth.uid()) OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Only company admins can add members';
  END IF;
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF _uid IS NULL THEN RAISE EXCEPTION 'No account found with that email. Ask them to sign up first.'; END IF;
  INSERT INTO public.company_members (company_id, user_id, is_admin) VALUES (_company, _uid, _is_admin)
    ON CONFLICT (company_id, user_id) DO UPDATE SET is_admin = EXCLUDED.is_admin
    RETURNING id INTO _id;
  RETURN _id;
END $$;
REVOKE EXECUTE ON FUNCTION public.add_company_member_by_email(uuid, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_company_member_by_email(uuid, text, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.company_member_emails(_company uuid)
RETURNS TABLE(user_id uuid, email text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.user_id, u.email::text FROM public.company_members m JOIN auth.users u ON u.id = m.user_id
  WHERE m.company_id = _company AND (public.is_company_member(_company, auth.uid()) OR public.has_role(auth.uid(), 'admin'))
$$;
REVOKE EXECUTE ON FUNCTION public.company_member_emails(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.company_member_emails(uuid) TO authenticated;