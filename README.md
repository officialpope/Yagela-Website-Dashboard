# YAGELA Collection Hub — Supabase + Netlify backend

This ZIP adds an authenticated Supabase admin dashboard and Netlify server functions to the supplied storefront.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. In Supabase Authentication > Users, create an admin email/password account. In the SQL Editor, find its user ID with `select id, email from auth.users;`, then grant dashboard access with `insert into public.admin_users (user_id) values ('AUTH-USER-UUID');`.
4. Edit `supabase-config.js` with the Supabase project URL and publishable/anon key. Never put the service_role key there.
5. In Netlify Site configuration > Environment variables, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
6. Deploy this whole folder to Netlify.
7. Open `/admin/` and sign in with the Supabase admin user.

## What is connected
- Product catalog: Supabase `products` table; active products are loaded by the storefront.
- Orders: existing storefront checkout posts to `/api/orders`; Netlify saves orders in Supabase.
- Newsletter: existing storefront form posts to `/api/newsletter`; Netlify saves subscribers.
- Admin: product CRUD, product visibility, orders/status, subscribers, revenue and dashboard stats.
- The SQL seed includes the current storefront catalog, including Sellion perfume and made-to-order fruit juice.
- Customer comments and the customer-account prompt remain browser-only; they are not stored in Supabase.

## Security
The browser only uses the Supabase anon/publishable key. Order and newsletter writes use the Netlify server-side service-role key. Keep the service-role key secret.
Row-level security restricts dashboard data access to users listed in `public.admin_users`; add or remove admins through the Supabase SQL Editor.
