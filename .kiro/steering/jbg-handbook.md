---
inclusion: manual
---

# Jewels by Geetika — Complete Project Handbook

This is the master handover document. A fresh Kiro session (or a human) reading
this file end-to-end has everything needed to continue working on JBG.
Written September 2026, at the point the project moved off the original
development machine onto the owner's personal PC.

---

## 1. What JBG is

Jewels by Geetika is a curated luxury-look jewellery brand — jewelsbygeetika.com,
Instagram @jewelsbygeetika. Founder: Geetika Tyagi. Tech/ops: Divyansh Ahuja
(GitHub DA2793). Range: AD (American Diamond), kundan/temple bridal sets,
anti-tarnish everyday pieces, earrings, rings, bracelets. Prices ₹999–₹5,499.

Positioning and voice: warm, personal, first-name ("Hi Geetika!" WhatsApp
copy), champagne-and-gold visual language, never loud. Products have Indian
names (Kaveri, Raahi, Saanjh, Antara…) for heritage pieces and soft English
names (Bella, Luna, Iris, Daisy…) for the anti-tarnish line.

Brand palette in code (`tailwind.config.ts` + `globals.css`):
- gold-500 `#C8A84B` (main gold; also the Razorpay theme), gold-400 `#D4AF37`
- cream-100 `#FDFCFA` (page bg), cream-300 `#F3E9DC` (champagne accent bg),
  cream-400 `#E8D9C5` (borders)
- charcoal-800 `#111111` text grounds
- Fonts: `font-display` Cinzel, `font-serif` Cormorant Garamond, `font-sans`
  Jost (body). Loaded via `next/font/google` in `src/app/layout.tsx`.
- Utility classes worth knowing: `.glass-card`, `.gradient-champagne`,
  `.text-gold-gradient`, `.gold-shimmer`, `.marquee`, `.product-card`.

## 2. Repository and deployment

- Repo: `github.com/DA2793/jewels-by-geetika` — Next.js **14.2.x** (App
  Router, TypeScript, Tailwind 3, framer-motion, swiper). React 18.
  `AGENTS.md` carries the "read `node_modules/next/dist/docs/` first" rule —
  honour it; do not assume Next 15/16 conventions.
- Hosting: Vercel, deploys from `main`. `@vercel/analytics` is mounted in
  the root layout.
- Branches: `main` is live. `dev` exists but is behind main (last used for
  the featured-collection shuffle work). `feature/server-side-checkout` is
  fully merged into main — safe to delete.
- **Quality gate:** `npx tsc --noEmit` AND `npm run build` must pass before
  any code push. Asset-only swaps (replacing an image at the same path) may
  skip the build.
- **Never commit:** `business/` (ledgers, invoices, printables, reels,
  Razorpay key CSV), `.env.local`, `Google Console.jpg`, `Twillo Recovery.jpg`.
  All are in `.gitignore`. `.env.local.example` IS tracked and lists every
  variable the code reads.
- `public/products/` (live site images) IS committed — ~17 MB of WebP.

### Services and keys
| Service | Purpose | Where the key lives |
|---|---|---|
| Supabase | Auth (phone OTP via Twilio, email/password, Google), Postgres DB | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Razorpay | Online payments (UPI/cards/wallets) | `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Resend | All transactional email | `RESEND_API_KEY` |
| Twilio | SMS OTP provider behind Supabase phone auth | configured inside Supabase dashboard, not in code |
| Vercel | Hosting; needs the same 7 env vars | Project → Settings → Environment Variables |

Public (`NEXT_PUBLIC_*`) vars ship to the browser; the other four are
server-only and are read in `src/lib/server/*` and `src/app/api/*`.
Razorpay webhook must point at
`https://www.jewelsbygeetika.com/api/razorpay-webhook` with event
`payment.captured`.

### Dependencies to install on a new machine
1. Node.js 20 LTS+ (no `.nvmrc`; `@types/node` is ^20), then `npm install`.
2. `.env.local` restored to repo root (7 variables — see `.env.local.example`).
3. `business/` folder restored (not in git).
Verify with `npx tsc --noEmit`, `npm run build`, `npm run dev` (site on :3000).
No Python, ffmpeg, tests, or CI exist in this project — the reels in
`business/Reel/` were produced with external tooling, not scripts in the repo.

## 3. Site architecture

### Product data — `src/data/products.ts`
Single source of truth for the catalog. No CMS. Stock is NOT here (see §5).
```ts
interface Product {
  id: string; name: string; category: Category; categories?: Category[];
  price: number; originalPrice?: number; description: string;
  details: string[]; images: string[]; badge?: string;
  isNew?: boolean; isBestseller?: boolean;
}
```
- `Category` = necklaces | earrings | rings | bracelets | bridal-sets |
  anti-tarnish | american-diamond. `categories[]` (display order: necklaces,
  bridal-sets, anti-tarnish, american-diamond, bracelets, earrings, rings)
  drives the homepage grid, navbar, footer and `/collections?category=`.
- A product's `category` is its primary; `categories` lists every filter it
  appears under (`getProductsByCategory` checks both).
- Helpers: `getProductById`, `getProductsByCategory`, `getFeaturedProducts`
  (shuffled bestsellers+new, first 6), `getShuffledProducts` (Fisher-Yates).
- **Image convention:** `public/products/<CapitalizedName>/<lowername>-1..4.webp`
  — exactly 4 WebP images per product (e.g. `/products/Kaveri/kaveri-1.webp`).
  Convert source images to WebP before adding (commit 9dc8305 took the folder
  from 247 MB to 17 MB). Each product folder also holds a `<name>.txt` with
  the marketing copy and "Price - NNNN" (source copy, not read by code).
- Ids are numeric strings "1"–"30", hand-assigned, must match the
  `stock.product_id` rows in Supabase.

### Catalog snapshot (Sept 2026)
| id | name | ₹ | categories | flags |
|---|---|---|---|---|
| 1 | Kaveri Necklace Set | 1999 | necklaces, bridal-sets | bestseller |
| 2 | Raahi Necklace Set | 4499 | necklaces, bridal-sets | |
| 3 | Saanjh Choker Set | 5499 | bridal-sets, necklaces | bestseller |
| 4 | Adaa Necklace Set | 3999 | necklaces, american-diamond | bestseller |
| 5 | Ruhani Necklace Set | 3999 | necklaces, american-diamond | |
| 6 | Kanak Necklace Set | 1999 | necklaces, bridal-sets | |
| 7 | Sunehri Ring | 999 | rings | |
| 8 | Virasat Ring | 999 | rings | |
| 9 | Antara Temple Necklace Set | 3999 | necklaces, bridal-sets | bestseller |
| 10 | Chandni Necklace Set | 3999 | necklaces, american-diamond | |
| 11 | Rajsi Necklace Set | 2999 | necklaces, bridal-sets, american-diamond | |
| 12 | Bella Necklace | 1999 | anti-tarnish, necklaces | New Launch, bestseller |
| 13 | Blossom Necklace | 1499 | anti-tarnish | New Launch |
| 14 | Ziya Earrings | 1499 | earrings, anti-tarnish | New Launch |
| 15 | Grace Earrings | 1499 | earrings | New Launch, bestseller |
| 16 | Iris Earrings | 1999 | earrings | New Launch |
| 17 | Stella Necklace | 2999 | anti-tarnish | New Launch, bestseller |
| 18 | Hope Necklace | 2499 | anti-tarnish | New Launch |
| 19 | Luna Necklace | 1499 | anti-tarnish | New Launch |
| 20 | Lily Necklace | 1499 | anti-tarnish | New Launch |
| 21 | Daisy Bracelet | 1499 | bracelets, anti-tarnish | New Launch |
| 22 | Zahara Bracelet | 999 | bracelets | New Launch, bestseller |
| 23 | Dove Necklace Set | 1499 | anti-tarnish | New Launch |
| 24 | Halo Pendant | 1199 | anti-tarnish | New Launch |
| 25 | Trinity Pendant | 1199 | anti-tarnish | New Launch |
| 26 | Sundrop Earrings | 1499 | earrings | New Launch |
| 27 | Evergreen Pendant | 1199 | anti-tarnish | New Launch |
| 28 | Loveknot Pendant | 1199 | anti-tarnish | New Launch |
| 29 | Duet Necklace | 1199 | anti-tarnish | New Launch |
| 30 | Aarvi Bracelet & Ring Set | 1249 | bracelets, rings, anti-tarnish | New Launch |

Ids 12–30 all carry `badge: "New Launch"` + `isNew` (the anti-tarnish launch
wave). No product sets `originalPrice`. Iris Earrings (16) was sold offline at
₹1,499 against a ₹1,999 list price — recorded as a ₹500 discount, not a price change.

### Adding a product (checklist)
1. Add 4 WebP images to `public/products/<Name>/`.
2. Append the entry in `products.ts` with the next id.
3. Insert a `stock` row in Supabase: `insert into stock (product_id, quantity) values ('31', N);`
   — without it, checkout says "Could not verify stock".
4. `product/[id]/layout.tsx` picks up metadata/JSON-LD and `sitemap.ts` the URL automatically.

### Pages (`src/app`)
- `/` — HeroSection (Unsplash bg, allowed in `next.config.js`), MarqueeStrip,
  FeaturedProducts, CategoriesSection, BrandStory, InstagramCTA.
- `/collections` — grid with `?category=` filter, new/bestseller filters,
  price sort, session shuffle.
- `/product/[id]` — client page + server `layout.tsx` (generateStaticParams,
  per-product metadata, schema.org Product JSON-LD — always says InStock).
  Composes a WhatsApp enquiry string and shows 3 related products.
- `/about` (founder page, uses `/Geetika.JPG`), `/contact` (mailto form,
  no backend), `/policies` (shipping, COD, cancellation ≤24h, no returns
  after delivery, refunds 1–3 / 5–7 business days).
- `/wishlist`, `/checkout` (§6), `/order-success?id=`, `/invoice/[id]`
  (printable; owner or admin only), `/account` (profile / orders / addresses).
- `/auth/login`, `/auth/signup` — phone OTP is the default mode; email+password
  and Google also work.
- `/admin` — §8.
- `sitemap.ts` → `/sitemap.xml`; `public/robots.txt` allows all.

### API routes (`src/app/api/*/route.ts`, all POST, all `force-dynamic`)
- `create-order` — the checkout entry point (§6).
- `verify-payment` — HMAC check of Razorpay response, finalizes order.
- `razorpay-webhook` — `payment.captured` safety net, finalizes order.
- `validate-promo` — promo preview against the real cart (login required).
- `send-email` — `welcome` (own email only) and `order-shipped` (admin only).

### Contexts (`src/context`)
- `AuthContext` — user/session, `signUp`, `signIn`, `signInWithGoogle`,
  `sendOtp`, `verifyOtp`, `signOut`. Fires the welcome email once for
  brand-new users (localStorage `jbg-welcome-sent`).
- `CartContext` — cart in localStorage `jbg-cart`, re-priced from the catalog
  on load; `stockLevels` map fetched once and on window focus; `addToCart`
  returns `"added" | "out-of-stock" | "stock-limit"`; writes abandoned carts
  (§10); `markCartRecovered()` on successful checkout.
- `WishlistContext` — `wishlist` table, logged-in users only.

### Components (`src/components`)
Navbar, Footer, Logo, HeroSection, MarqueeStrip, FeaturedProducts,
CategoriesSection, BrandStory, InstagramCTA, InstagramFloater (fixed
bottom-right), CartSidebar, ProductCard, WishlistButton.
Unused but present: `Testimonials`, `WhatsAppButton` (wa.me/919289890426),
`ComingSoonOverlay` (pre-launch gate).

### Adding a category touches
`products.ts` (Category type + `categories[]`), and nothing else — Navbar,
Footer, CategoriesSection and the collections filter all iterate `categories[]`.

## 4. Business rules (server is the source of truth)

All in `src/lib/server/checkout.ts`; the checkout page mirrors them for display only.
- **Shipping:** subtotal > ₹999 → free; ₹799–999 → ₹49; below ₹799 → ₹79.
- **Express:** +₹99, only when `isExpressEligible(pincode)`
  (`src/lib/express-pincodes.ts`: Delhi NCR, Mumbai, Bengaluru, Hyderabad,
  Chennai, Pune, Ahmedabad, Kolkata, Chandigarh, Jaipur, Lucknow, Indore,
  Kochi, Surat — inclusive pincode ranges). 2–3 business days.
- **COD:** +₹99 fee, only when subtotal ≤ ₹1,999.
- **Max 10 units per line item.**
- **Promo codes** (`promo_codes` table): checks in order — exists & active →
  not expired → `used_count < max_uses` → `first_time_only` (user has 0 prior
  orders) → `min_order`. Types: `percentage` (ceil, capped by `max_discount`),
  `price_to` (discount = subtotal − value), anything else = fixed amount.
- `total = subtotal − discount + shipping + codFee`.
- Pricing formula for new stock (business/README.md): Selling Price =
  (Supplier Cost + Packaging + Shipping) × Markup; 4–5× standard, 6–8×
  bridal; always round to ₹X99.

## 5. Supabase data model

**The live database is the source of truth. `supabase/schema.sql` is the
original bootstrap and is stale.** `supabase/migrations/` holds changes made
after that; keep adding dated files there when you alter the live DB.

Tables the code uses:
- `profiles` — id (= auth.users.id), full_name, phone, email, address, city,
  state, pincode. Auto-created by trigger `on_auth_user_created`.
- `orders` — id, user_id, status (`pending|confirmed|shipped|delivered|cancelled`),
  total, shipping_cost, discount, promo_code, shipping_* (name, email, phone,
  address, city, state, pincode), payment_method (`prepaid|cod`),
  payment_status (`created` = awaiting Razorpay, `paid`, `pending` = COD),
  payment_id, razorpay_order_id, cod_fee, tracking_number, courier_partner,
  items jsonb `[{product_id, name, quantity, price}]`, created_at, updated_at.
- `stock` — product_id (text, matches catalog id), quantity.
- `promo_codes` — code, active, expires_at, max_uses, used_count,
  first_time_only, min_order, type, value, max_discount.
- `abandoned_carts` — user_id, user_phone, user_email, items, total,
  last_updated, recovered, reminder_sent.
- `wishlist` — user_id, product_id (text catalog id).
- `products` — exists in schema.sql, unused (catalog is hardcoded).

RPCs: `decrement_stock(p_product_id, p_quantity)` → boolean;
`increment_promo_usage(p_code)`.

**Live-only objects (not in any SQL file in the repo):** `stock`,
`promo_codes`, `abandoned_carts`, both RPCs, `orders.discount /
promo_code / razorpay_order_id`, `profiles.email`, and the admin RLS
policies that let ADMIN_EMAILS read all orders/profiles/carts. If the
project is ever recreated, dump the live schema first
(Supabase → Database → Schema Visualizer, or `pg_dump --schema-only`).

Schema drift bit us once: the server-side checkout commit added
`payment_method` and `cod_fee` to the insert but the columns were never
created, so every order failed with "Could not place order" until the
2026-08-23 migration was run. When adding a column in code, add the
migration in the same commit and run it before deploying.

### Useful one-off SQL patterns
- Look up a phone-signup customer:
  `select u.id, p.full_name from auth.users u left join profiles p on p.id=u.id
   where regexp_replace(u.phone,'\D','','g') = '91XXXXXXXXXX';`
- Record an offline sale against an account: insert into `orders` with
  `status 'delivered'`, `payment_method 'prepaid'`, `payment_status 'paid'`,
  `payment_id 'offline_YYYYMMDD'`, `created_at` = sale date, and decrement
  `stock` in the same statement. Done once for Iris Earrings, order
  `8f824ee2-83fc-4c92-b3c4-3996071a4671`.
- The SQL editor's "Potential issue detected / RLS" popup on such queries is
  a false positive (no table is created) — "Run without RLS" is correct.

## 6. Checkout and payments (end to end)

1. `/checkout` requires login. Form: first/last name, email (optional), phone,
   address, city, state (select), pincode. Payment method: Pay Online
   (recommended) or COD.
2. Client POSTs `{items:[{id,quantity}], promoCode, expressShipping,
   paymentMethod, customer}` to `/api/create-order`. **Nothing the client
   sends about price is trusted.**
3. Server: `sanitizeCustomer` → `priceOrder` (catalog prices, promo, shipping,
   COD) → `validateStockServer` (409 on shortfall) → insert.
   - COD: row inserted as `confirmed / cod / pending`, `payment_id cod_<ts>`,
     side effects run immediately, client gets `{orderId}`.
   - Prepaid: `razorpay.orders.create` (amount in paise, receipt `jbg_<ts>`),
     row inserted as `pending / prepaid / created` with `razorpay_order_id`.
4. Client opens Razorpay checkout.js with the order id; on success POSTs the
   response to `/api/verify-payment` (HMAC-SHA256 of `order_id|payment_id`,
   `timingSafeEqual`).
5. `finalizePrepaidOrder` does one UPDATE `set payment_status='paid',
   status='confirmed' where razorpay_order_id=? and payment_status='created'`.
   Only the caller whose update hits a row runs side effects — so verify and
   webhook can race safely. Webhook (`payment.captured`) is the safety net if
   the browser closes.
6. `runPostOrderSideEffects`: decrement stock (RPC per item, failures become
   warnings in the admin email, never block the order) → increment promo
   usage → admin notification email → customer confirmation email with
   invoice link.
7. Client clears cart, marks abandoned cart recovered, routes to
   `/order-success?id=<orderId>`.

Invoice numbers: `JBG-<YYYY>-<MMDD>-<first 4 of order uuid, uppercased>`
(`src/lib/invoice-template.ts`). Printable at `/invoice/<orderId>`.

## 7. Emails (`src/lib/server/emails.ts`, Resend)

| Function | From | Trigger |
|---|---|---|
| `sendWelcomeEmail` | hello@jewelsbygeetika.com | new signup (client → `/api/send-email`) |
| `sendOrderConfirmationEmail` | orderconfirmation@jewelsbygeetika.com | order finalized (server) |
| `sendOrderShippedEmail` | orders@jewelsbygeetika.com | admin saves tracking |
| `sendAdminOrderNotification` | notification@jewelsbygeetika.com → ADMIN_EMAILS | order finalized (server) |

Reply-to everywhere: contact@jewelsbygeetika.com. HTML is inline-styled in
brand colours and escaped via `escapeHtml`. If `RESEND_API_KEY` is missing
the send is skipped with a console log, never thrown.
`src/lib/admin-emails.ts`: `ADMIN_EMAILS = ["da.2793@yahoo.com", "geetikatyagi75@gmail.com"]`
— this list gates the admin panel too.

## 8. Admin panel (`/admin`)

Gated twice: `src/middleware.ts` (matcher `/admin`, `/admin/:path*`)
redirects non-logged-in users to `/auth/login` and non-admins to `/`; the page
repeats the check client-side. Data is read with the anon client under admin
RLS policies.
- **Orders tab:** stats (total/pending/confirmed/shipped/delivered), expandable
  rows, "View Invoice", status buttons, and — once `shipped` — tracking number
  + courier inputs whose Save sends the shipped email.
- **Customers tab:** `profiles` list.
- **Abandoned tab:** `abandoned_carts` with `recovered=false`; manual
  "Send WhatsApp Reminder" `wa.me` link. Nothing sets `reminder_sent`.
There is no "create order" in the admin — offline sales are recorded via SQL (§5).

## 9. Auth

Supabase Auth via `@supabase/ssr`. Browser client `src/lib/supabase/client.ts`
(cached), server client `src/lib/supabase/server.ts` (cookies, used by API
routes to identify the caller), service-role client
`src/lib/server/supabase-admin.ts` (never import from client code).
- Phone OTP: number normalised to `+91…`, `signInWithOtp` → `verifyOtp(sms)`.
  SMS goes through Twilio configured in the Supabase dashboard
  (`Twillo Recovery.jpg` at repo root holds the Twilio account recovery codes
  — gitignored, transfer manually, never commit).
- Phone-only accounts have no email; the account page lets them add one and
  fires the welcome email once.
- Google OAuth redirects to `/account`.

## 10. Abandoned carts

Entirely client-side in `CartContext`: 5 s after the last cart change (logged-in
users only) the cart is upserted into `abandoned_carts` (`recovered=false`).
Checkout success calls `markCartRecovered()`. There is no cron and no automated
reminder — the owner sends WhatsApp reminders by hand from the admin panel.

## 11. SEO

Root metadata in `layout.tsx` (`metadataBase` https://www.jewelsbygeetika.com,
title template `%s | Jewels by Geetika`, OG/Twitter image `/logo.png`).
Per-product metadata + JSON-LD in `product/[id]/layout.tsx`. `sitemap.ts`
covers static pages, every category and every product. `Google Console.jpg`
(gitignored) is the Search Console verification screenshot.

## 12. Business folder (`business/`, NOT in git, ~180 MB)

- `inventory-ledger.xlsx` — stock ledger (mirror `stock` table by hand).
- `orders-ledger.xlsx` — orders with tracking.
- `pricing-calculator.xlsx` — cost/margin maths (formula in §4).
- `expenses-ledger.csv` — expenses.
- `rzp-key.csv` — Razorpay API key export. **Credential — keep private.**
- `Invoice/` — generated invoice PDFs (e.g. `JBG-2026-0601-B464.pdf`).
- `Printables/` — HTML sources + PDFs for box label, sticker, rubber stamp,
  QR codes, thank-you cards (postcard + business-card size), pamphlet,
  invoice sample. Edit the `.html`, print to PDF.
- `Reel/` — Instagram reel source frames (PNG) + finished MP4s: Festive
  Teaser, Antara Devotional, Kanak Festive, Raahi. Each folder has a `build/`
  scratch dir.
- `README.md` — ledger usage + pricing formula.

## 13. Hardcoded values a maintainer must know

- Domain `https://www.jewelsbygeetika.com` is hardcoded in layout.tsx,
  sitemap.ts, product layout, checkout.ts (invoice URL), emails.ts,
  admin/page.tsx, invoice-template.ts, robots.txt.
- Instagram `https://www.instagram.com/jewelsbygeetika/`.
- WhatsApp `+91 92898 90426` (unused component + admin reminder text).
- Contact `contact@jewelsbygeetika.com`.
- localStorage keys: `jbg-cart`, `jbg-welcome-sent`, `jbg-welcome-sent-<uid>`.
- Razorpay theme colour `#C8A84B`.

## 14. Working with the owner (conventions that matter)

- Short messages, fast iterations. Give file paths for anything they need to
  open and exact SQL for anything they need to run in Supabase.
- Non-technical operator: explain Supabase popups, confirm which button to
  click, and read back what a query returned.
- Locked decisions stay locked (pricing tiers, COD limit, brand palette,
  product names). Don't relitigate.
- Verify plainly: probe the live DB (a `select <column>` per column with the
  anon key reveals missing columns without needing the service key) before
  claiming a fix works.
- Clean up temporary diagnostic scripts after use (`scripts/` is meant to
  stay empty).

## 15. Known gaps and loose ends (Sept 2026)

- `BrandStory.tsx` referenced two `.png` product images after the WebP
  conversion (commit 9dc8305) — fixed in the handover commit. When renaming
  assets, grep `src/` for the old extension.
- `supabase/schema.sql` is stale (see §5). A live schema dump would fix it.
- `eslint-config-next` is v16 while Next is v14 — lint may complain about
  rules that don't apply; don't upgrade Next to satisfy lint.
- Product JSON-LD always reports `InStock` regardless of the `stock` table.
- `abandoned_carts.reminder_sent` is displayed but never written.
- `wishlist.product_id` is declared `uuid` in schema.sql but the code inserts
  catalog string ids — the live column must be text; keep it that way.
- `public/JBG.png` (1.4 MB) is committed but unreferenced — brand mark for
  social/print use.
- Iris Earrings (16) stock hit 0 on 2026-09-08 after the offline sale was
  recorded; bump `stock` if more units exist.
- `Twillo Recovery.jpg` was tracked in git until the September 2026 handover
  commit removed it; it remains in git history. Rotate the Twilio recovery
  codes if the repo is or ever becomes public.
