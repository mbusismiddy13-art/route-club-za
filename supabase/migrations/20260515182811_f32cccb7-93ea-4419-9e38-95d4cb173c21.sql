
-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable by all authenticated" on public.profiles for select to authenticated using (true);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id);

-- Drivers
create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  vehicle_make text,
  vehicle_model text,
  vehicle_plate text,
  seats integer not null default 4,
  rating numeric(3,2) not null default 5.0,
  is_online boolean not null default false,
  current_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.drivers enable row level security;
create policy "drivers readable by authenticated" on public.drivers for select to authenticated using (true);
create policy "users insert own driver" on public.drivers for insert to authenticated with check (auth.uid() = user_id);
create policy "drivers update own row" on public.drivers for update to authenticated using (auth.uid() = user_id);

-- Ride requests
create type public.ride_status as enum ('pending','accepted','declined','cancelled','completed');

create table public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references auth.users(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  pickup text not null,
  dropoff text not null,
  notes text,
  status public.ride_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.ride_requests (driver_id, status);
create index on public.ride_requests (passenger_id, status);

alter table public.ride_requests enable row level security;

create policy "passenger sees own requests" on public.ride_requests for select to authenticated
  using (auth.uid() = passenger_id);

create policy "driver sees own requests" on public.ride_requests for select to authenticated
  using (driver_id in (select id from public.drivers where user_id = auth.uid()));

create policy "passenger creates request" on public.ride_requests for insert to authenticated
  with check (auth.uid() = passenger_id);

create policy "passenger cancels own" on public.ride_requests for update to authenticated
  using (auth.uid() = passenger_id);

create policy "driver updates own request" on public.ride_requests for update to authenticated
  using (driver_id in (select id from public.drivers where user_id = auth.uid()));

-- Updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at_column();
create trigger trg_drivers_updated before update on public.drivers
  for each row execute function public.update_updated_at_column();
create trigger trg_ride_requests_updated before update on public.ride_requests
  for each row execute function public.update_updated_at_column();

-- Auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (user_id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Realtime
alter publication supabase_realtime add table public.ride_requests;
alter publication supabase_realtime add table public.drivers;
alter table public.ride_requests replica identity full;
alter table public.drivers replica identity full;
