ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS is_in_house boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS service_areas text,
  ADD COLUMN IF NOT EXISTS price_per_trip numeric(10,2),
  ADD COLUMN IF NOT EXISTS retainer_weekly numeric(10,2),
  ADD COLUMN IF NOT EXISTS retainer_monthly numeric(10,2);

CREATE OR REPLACE FUNCTION public.protect_driver_in_house()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN NEW.is_in_house := false;
    ELSE NEW.is_in_house := OLD.is_in_house; END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.protect_driver_in_house() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_protect_driver_in_house ON public.drivers;
CREATE TRIGGER trg_protect_driver_in_house BEFORE INSERT OR UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.protect_driver_in_house();