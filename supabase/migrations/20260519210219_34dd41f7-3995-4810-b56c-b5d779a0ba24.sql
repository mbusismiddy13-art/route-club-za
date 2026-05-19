
REVOKE EXECUTE ON FUNCTION public.is_ride_participant(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_ride_participant(uuid, uuid) TO authenticated;
