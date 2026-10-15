-- YAGELA Collection Hub Supabase schema.
-- Safe to run again after the initial setup to apply policy and seed updates.

create extension if not exists pgcrypto;

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text not null check (category in ('personal', 'home', 'fashion', 'ppe', 'fragrance', 'juice')),
    price numeric(12, 2) not null check (price >= 0),
    image_url text,
    badge text,
    description text,
    active boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_phone text not null,
    delivery_address text not null,
    items jsonb not null check (jsonb_typeof(items) = 'array'),
    payment_method text not null default 'momo'
        check (payment_method in ('momo', 'card', 'transfer')),
    total numeric(12, 2) not null check (total >= 0),
    status text not null default 'pending'
        check (status in ('pending', 'processing', 'completed', 'cancelled')),
    created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    created_at timestamptz not null default now()
);

-- Admin dashboard access is explicitly granted per Supabase Auth user.
create table if not exists public.admin_users (
    user_id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.subscribers enable row level security;
alter table public.admin_users enable row level security;

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.subscribers to authenticated;
grant all on public.products, public.orders, public.subscribers, public.admin_users to service_role;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
    on public.products for select
    to anon, authenticated
    using (active = true);

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
    on public.products for all
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
    on public.orders for select
    to authenticated
    using ((select public.is_admin()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
    on public.orders for update
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

drop policy if exists "Admins can read subscribers" on public.subscribers;
create policy "Admins can read subscribers"
    on public.subscribers for select
    to authenticated
    using ((select public.is_admin()));

-- The admin_users table intentionally has no client policies. Manage its rows
-- from the Supabase SQL editor using the project owner account.

-- Keep existing rows but correct image paths left by the previous catalog seed.
update public.products
set image_url = case lower(image_url)
    when 'assets/picture1.jpg' then 'assets/courosels.jpeg'
    when 'assets/picture2.jpg' then 'assets/SCRap.jpeg'
    when 'assets/toilet.png' then 'assets/toilet.jpg'
    when 'assets/toilet stamp gel small.png' then 'assets/toilet stamp gel small.jpg'
    when 'assets/down.jpeg' then 'assets/down.jpg'
    when 'assets/mouth fresh.jpeg' then 'assets/mouth fresh.jpg'
    when 'assets/tongue.png' then 'assets/tongue.jpg'
    else image_url
end
where lower(image_url) in (
    'assets/picture1.jpg',
    'assets/picture2.jpg',
    'assets/toilet.png',
    'assets/toilet stamp gel small.png',
    'assets/down.jpeg',
    'assets/mouth fresh.jpeg',
    'assets/tongue.png'
);

update public.products
set category = 'fashion'
where name = 'Shape wear' and category = 'personal';

-- Correct the two Veyes products seeded before the current storefront updates.
update public.products
set price = 70.00,
    image_url = 'assets/veyes red.jpeg',
    badge = 'New'
where name = 'Veyes Reed Diffuser perfume'
  and image_url like 'https://images.unsplash.com/photo-1541643600914-%';

update public.products
set name = 'Veyes Reed Diffuser perfume 150ML',
    image_url = 'assets/veyes mango.jpeg',
    badge = 'New'
where name = 'Veyes Reed Diffuser perfume. 150ML'
  and image_url like 'https://images.unsplash.com/photo-1611078489935-%';

update public.products
set image_url = case
    when name = 'Gift Box Perfume' then 'assets/diffuser one.jpeg'
    when name = 'Ikeda air freshener 120g' then 'assets/IKEDA ONE.jpeg'
    when name = 'Perfume Detergent' then 'assets/detergent.jpeg'
    else image_url
end
where (name = 'Gift Box Perfume'
       and image_url like 'https://images.unsplash.com/photo-1592945403244-%')
   or (name = 'Ikeda air freshener 120g'
       and image_url like 'https://images.unsplash.com/photo-1585386959984-%')
   or (name = 'Perfume Detergent'
       and image_url like 'https://images.unsplash.com/photo-1581578731548-%');

-- Add products introduced in the current storefront without overwriting products
-- that an administrator has already edited.
insert into public.products (name, category, price, image_url, badge, description, sort_order)
select v.name, v.category, v.price, v.image_url, v.badge, v.description, v.sort_order
from (values
    ('Metal Steel Tongue Scraper', 'personal', 65.00, 'assets/courosels.jpeg', 'New', null, 0),
    ('Metal tongue scraper with plastic handle', 'personal', 30.00, 'assets/SCRap.jpeg', 'New', null, 1),
    ('Shape wear', 'fashion', 100.00, 'assets/shape.jpg', 'Popular', null, 2),
    ('Toilet Stamp Gel', 'home', 20.00, 'assets/toilet.jpg', 'Sale', 'In packages-Big', 3),
    ('Toilet Stamp Gel', 'home', 12.00, 'assets/Toilet stamp gel small.jpg', 'Sale', 'In packages-Small', 4),
    ('Laundry Pods', 'home', 85.00, 'assets/Pod.jpeg', 'Sale', null, 5),
    ('Reflector shirt', 'ppe', 165.00, 'assets/top.jpg', 'Safety', 'TYPE: Long Sleeve and Short sleeve Sizes: M, L, XL, XXL', 6),
    ('Reflector trousers', 'ppe', 265.00, 'assets/down.jpg', 'Safety', 'TYPE: Long trousers Sizes: M, L, XL, XXL', 7),
    ('DIFFUSER 130ML', 'fragrance', 70.00, 'assets/Picture9.jpg', 'New', null, 8),
    ('4 in Box Mini Perfumes', 'fragrance', 120.00, 'assets/perfume.jpg', 'Hot', '75ml', 9),
    ('Sellion perfume', 'fragrance', 320.00, 'assets/sellion-perfume-1.jpg.jpg', 'New', null, 10),
    ('Veyes Reed Diffuser perfume', 'fragrance', 70.00, 'assets/veyes red.jpeg', 'New', null, 11),
    ('Gift Box Perfume', 'fragrance', 150.00, 'assets/diffuser one.jpeg', 'Hot', null, 12),
    ('Veyes Reed Diffuser perfume 150ML', 'fragrance', 70.00, 'assets/veyes mango.jpeg', 'New', null, 13),
    ('Ikeda air freshener 120g', 'fragrance', 100.00, 'assets/IKEDA ONE.jpeg', 'Popular', null, 14),
    ('Perfume Detergent', 'home', 70.00, 'assets/detergent.jpeg', null, null, 15),
    ('Fresh Natural Fruit Juice', 'juice', 0.00, 'assets/fresh juice.jpg', 'Fresh', 'Made fresh on order. Price on request.', 16),
    ('Flavoured mouth fresh', 'home', 15.00, 'assets/mouth fresh.jpg', null, null, 17),
    ('Silicone tongue cleaner', 'home', 10.00, 'assets/tongue.jpg', null, null, 18)
) as v(name, category, price, image_url, badge, description, sort_order)
where not exists (
    select 1
    from public.products as existing
    where existing.name = v.name
      and existing.category = v.category
      and existing.price = v.price
);
