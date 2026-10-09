# playwright-cli cheat-sheet

Running record of UI element names, routes, form shapes, and flow gotchas discovered while testing with `playwright-cli`. Consult before scanning snapshots. Append new learnings as they are discovered.

Always run `playwright-cli --help` first to see all available commands. Always use `--headed` mode, never headless. Use seed logins from `prisma/seed.ts` (`ADMIN_EMAIL` role admin, `USER_EMAIL` role user). Remove all test data plus `.playwright-cli/` artifacts after complete test.

## Routes

- `/` Fluxgate marketing landing (hero with CSS dashboard mock, features, how-it-works, stats, closing CTA, no footer, no demo buttons).
- `/sign-in` split-screen with brand panel, redirects logged-in users to role home. Contains `SignInForm` with footer link to sign-up.
- `/sign-up` split-screen with brand panel, redirects logged-in users to role home. Contains `SignUpForm` with footer link to sign-in.
- `/browse` private, requires session else `/sign-in`. Product catalog with category filter, search, currency prices, add to cart, ratings, my recent orders.
- `/seller` private, seller or admin else `/browse`. Product CRUD, orders received with status flow, payment methods CRUD, ratings received.
- `/settings` private, requires session. Currency (USD, INR, PKR, BDT, USDT) plus payment method preferences.
- `/admin` private admin-only layout with sidebar (Overview, Users, Taxonomy, Moderation, Analytics, Requests, Visitors, Coupons and Rates). Overview has revenue plus activity. Users manage roles, bans, removal. Taxonomy manages categories and tags. Moderation handles reports, hidden ratings, takedowns. Analytics uses shadcn chart AreaCharts. Requests handle approvals, tickets, disputes. Visitors show IP, country, VPN yes or no with filters. Ops manages coupons, fallback rates, audit log.
- `/api/auth/[...all]` BetterAuth handler, callbacks `{BETTER_AUTH_URL}/api/auth/callback/google` and `/discord`.
- `/api/cart`, `/api/ratings`, `/api/orders` (couponCode applies active percent), `/api/products` (sellers create pending), `/api/payment-methods`, `/api/settings`, `/api/reports`, `/api/tickets`, `/api/disputes`, `/api/visits` ingest plus admin list, `/api/admin/*` guarded ops.
- SignUpForm has a Join as buyer or seller picker, seller sign-ups land on `/seller` via claim endpoint. SignInForm routes buyer to `/browse`, seller to `/seller`, admin to `/admin`.
- Global floating `DockNav` on every page (brand, Home, Browse, conditional Seller and Admin, cart with count badge, Settings, UserMenu avatar, circle `ThemeToggler`), tooltips with 200ms delay, active route highlight. Cart opens via `open-cart` window event, count refreshes on `cart-updated`.
- Currency prefs read fresh from DB in `getSessionUser`, never trust the session cookie cache for role, currency, or payment method. Pure money helpers live in `src/lib/money.ts`, never import `@/server/currency` into client components.
- Dates always go through `src/lib/dates.ts` date-fns helpers. Orders show placed dates, ratings show relative times.
- Product and avatar images are always online URLs pasted into URL fields, never uploads. URL fields store null when blank. Plain `img` with lazy loading is used for arbitrary seller hosts (next/image cannot optimize unlisted hosts).
- Proxy must live at `src/proxy.ts` (same level as `src/app`), never root, or Next silently ignores it including its matcher. Use `event.waitUntil` for visit logging, never await fetches in the proxy body.

## UI element names

- Dock `Fluxgate home`, `Browse`, `Admin dashboard`, `Sign in`, `Sign up`, `User menu`, `Toggle theme`. `DropdownMenuTrigger` and `TooltipTrigger` use Base UI `render` prop, not `asChild`.
- SignInForm Card title Sign in, divider label or continue with email, Show password toggle, submit Sign in with icon toggle.
- SignUpForm Card title Create account, same divider and toggle, submit Sign up with icon toggle.
- Social buttons with inline Google and Discord icons, pending labels Opening Google and Opening Discord.
- Admin stat cards Total users, Admins, Verified. Table columns Name, Email, Role, Verified with badges. Search users field filters by name or email.
- `ThemeToggler` uses mounted guard (`useSyncExternalStore`) to avoid hydration mismatch, circle 400ms from button.

## Form shapes

- `signInSchema`: email required email, password min 8, rememberMe optional boolean default true. No rememberMe checkbox in UI.
- `signUpSchema`: name required, email required email, password min 8 max 128.
- Both use `react-hook-form` plus `zodResolver`, `mode: all`, per-field `Controller` to `Field`, `FieldLabel`, `Input`, `FieldError`, form `noValidate`, submit disabled while `isSubmitting`.
- Server errors render in destructive `Alert`.

## Flow gotchas

- Proxy is optimistic cookie only, edge safe. It never imports Prisma auth config. Role redirects happen per page and in `(public)` layout.
- Social sign-in uses `callbackURL: /browse`, browse then forwards admins to `/admin`.
- Email sign-in pushes by client role read after `authClient.getSession()`.
- OAuth buttons render even without secrets configured, server returns error shown in Alert. Configure secrets in local `.env` only.
- Sign-up always creates role user, `input: false` on role blocks escalation. Seed sets roles directly via Prisma plus `emailVerified: true`.
- `proxy.ts` matcher covers `/browse/:path*`, `/admin/:path*`, `/sign-in`, `/sign-up`.
- shadcn CLI writes `from "cn"` imports plus a stray `cn` dependency, fix to `@/lib/utils` and `bun remove cn` after every add.
- `AnimatedThemeToggler` with next-themes needs a mounted guard or the Sun and Moon icons hydrate mismatched.
- Next `Link` with `typedRoutes` rejects plain `string` hrefs, type dynamic hrefs as `Route` from `next`.
- `@magicui/animated-theme-toggler` appends view-transition CSS to `globals.css`, keep it formatted with trailing newline.
