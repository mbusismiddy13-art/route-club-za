
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id uuid NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_ride ON public.messages(ride_request_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a participant of the ride?
CREATE OR REPLACE FUNCTION public.is_ride_participant(_ride uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ride_requests r
    LEFT JOIN public.drivers d ON d.id = r.driver_id
    WHERE r.id = _ride
      AND (r.passenger_id = _user OR d.user_id = _user)
  );
$$;

CREATE POLICY "participants read messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_ride_participant(ride_request_id, auth.uid()));

CREATE POLICY "participants send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_ride_participant(ride_request_id, auth.uid())
);

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
