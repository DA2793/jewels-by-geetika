# Jewels by Geetika

E-commerce site for [jewelsbygeetika.com](https://www.jewelsbygeetika.com) — Next.js 14 (App Router), Supabase (auth + DB), Razorpay (payments), Resend (email). Deployed on Vercel from `main`.

The full project handbook (architecture, data model, business rules, conventions, known gaps) lives at
[`.kiro/steering/jbg-handbook.md`](.kiro/steering/jbg-handbook.md). Read it first.

## Set up on a new machine

1. Install Node.js 20 LTS or newer, then:
   ```bash
   git clone https://github.com/DA2793/jewels-by-geetika.git
   cd jewels-by-geetika
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill in the real values
   (Supabase, Razorpay, Resend). Without `SUPABASE_SERVICE_ROLE_KEY` checkout returns
   "Checkout is temporarily unavailable".
3. Restore the private, non-git folders from the old machine (see handbook §12):
   `business/` and the two credential screenshots at the repo root.
4. Verify:
   ```bash
   npx tsc --noEmit
   npm run build
   npm run dev      # http://localhost:3000
   ```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (must pass before pushing)
- `npm run start` — serve the production build
- `npm run lint` — eslint

## Database

`supabase/schema.sql` is the original bootstrap and is **stale**; `supabase/migrations/` holds later
changes applied to the live project. The live Supabase database is the source of truth — see handbook §5
for the objects that exist only there.
