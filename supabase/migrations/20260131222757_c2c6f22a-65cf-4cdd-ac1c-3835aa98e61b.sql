-- User Roles System
create type public.app_role as enum ('admin', 'client');

-- User Roles Table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null default 'client',
    created_at timestamp with time zone not null default now(),
    unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Security Definer Function for Role Check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Get current user role
create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = _user_id
  limit 1
$$;

-- Profiles Table
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null unique,
    full_name text,
    email text,
    phone text,
    avatar_url text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

-- Properties Table
create table public.properties (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    location text,
    price numeric(12,2),
    beds integer,
    baths integer,
    area numeric(10,2),
    image_url text,
    status text not null default 'under_construction' check (status in ('under_construction', 'delivered')),
    progress_percent integer default 0 check (progress_percent >= 0 and progress_percent <= 100),
    assigned_user_id uuid references auth.users(id) on delete set null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.properties enable row level security;

-- Documents Table (for property contracts/PDFs)
create table public.documents (
    id uuid primary key default gen_random_uuid(),
    property_id uuid references public.properties(id) on delete cascade not null,
    name text not null,
    file_path text not null,
    file_type text default 'application/pdf',
    uploaded_by uuid references auth.users(id) on delete set null,
    created_at timestamp with time zone not null default now()
);

alter table public.documents enable row level security;

-- Resale Requests Table
create table public.resale_requests (
    id uuid primary key default gen_random_uuid(),
    property_id uuid references public.properties(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected', 'completed')),
    notes text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.resale_requests enable row level security;

-- Leads/Inquiries Table
create table public.leads (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    phone text,
    message text,
    property_id uuid references public.properties(id) on delete set null,
    status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'closed')),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.leads enable row level security;

-- Settings Table (for company WhatsApp number, etc.)
create table public.settings (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    value text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.settings enable row level security;

-- Insert default WhatsApp number setting
insert into public.settings (key, value) values ('whatsapp_number', '+201234567890');

-- ============ RLS POLICIES ============

-- User Roles Policies
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Profiles Policies
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage all profiles"
on public.profiles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Properties Policies
create policy "Users can view their assigned properties"
on public.properties for select
to authenticated
using (assigned_user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage all properties"
on public.properties for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Documents Policies
create policy "Users can view documents for their properties"
on public.documents for select
to authenticated
using (
    exists (
        select 1 from public.properties p
        where p.id = property_id
        and (p.assigned_user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
);

create policy "Admins can manage all documents"
on public.documents for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Resale Requests Policies
create policy "Users can view their own resale requests"
on public.resale_requests for select
to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users can create resale requests for their properties"
on public.resale_requests for insert
to authenticated
with check (
    user_id = auth.uid()
    and exists (
        select 1 from public.properties p
        where p.id = property_id and p.assigned_user_id = auth.uid()
    )
);

create policy "Admins can manage all resale requests"
on public.resale_requests for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Leads Policies (only admins)
create policy "Admins can manage leads"
on public.leads for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Public can insert leads (contact form)
create policy "Anyone can submit leads"
on public.leads for insert
to anon, authenticated
with check (true);

-- Settings Policies
create policy "Authenticated users can view settings"
on public.settings for select
to authenticated
using (true);

create policy "Admins can manage settings"
on public.settings for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- ============ TRIGGERS ============

-- Update timestamp trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql set search_path = public;

-- Apply triggers
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

create trigger update_properties_updated_at
before update on public.properties
for each row execute function public.update_updated_at_column();

create trigger update_resale_requests_updated_at
before update on public.resale_requests
for each row execute function public.update_updated_at_column();

create trigger update_leads_updated_at
before update on public.leads
for each row execute function public.update_updated_at_column();

create trigger update_settings_updated_at
before update on public.settings
for each row execute function public.update_updated_at_column();

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (user_id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();