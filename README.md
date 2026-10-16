# Mutamakin Web (متمكن)

Frontend for **Mutamakin**, a marketplace that connects clients with skilled freelancers and social media influencers. Clients post projects or influencer requests, providers bid on them, and payments are protected by the platform.

This repository contains the web client built with Next.js. The first delivered module is **authentication** (sign up, login, OTP verification, password recovery) together with the shared **header**, **footer**, **localization** and **theming** that every future page will reuse.

---

## Table of contents

1. [Project plan](#project-plan)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Project structure](#project-structure)
5. [Architecture](#architecture)
6. [Auth module](#auth-module)
7. [Localization](#localization)
8. [Theming and design tokens](#theming-and-design-tokens)
9. [Backend integration](#backend-integration)
10. [Conventions](#conventions)
11. [Roadmap](#roadmap)

---

## Project plan

The project is built module by module, starting from the pieces every page depends on:

| Phase | Scope | Status |
| --- | --- | --- |
| 1. Foundation | Next.js setup, Tailwind, design tokens from Figma, light / dark mode, English / Arabic with RTL | Done |
| 2. Layout | Header (top bar, search row, navigation) and footer (CTA banner, links, apps, legal) | Done |
| 3. Auth | Signup, login, OTP verification, forgot / reset password, success and error states | Done (real API) |
| 4. Placeholder pages | Every route without a page shows an "Under Construction" screen | Done |
| 5. Backend connection | Real API everywhere, sessions, protected routes, homepage, header, messages | Done |
| 6. Projects & teams | Post / edit projects and influencer requests, offers, my projects / offers, profile, teams & invitations, search, categories | Done (real API) |
| 7. Project mode | Member exit, team dispute, dispute rules, release authority, team flow states, promotion | Planned |
| 8. Marketplace | Services, categories, bidding, influencer requests | Planned |
| 9. Account area | Settings shell, payment methods, wallet (add balance, withdraw) — done; profile settings, password, 2FA, notifications, points & gifts — planned | In progress |
| 10. Trust & support | Disputes and account verification — done; evaluation, customer support — planned | In progress |
| 11. Admin dashboard | Overview, finance, users, disputes, projects, settings | Planned |

The source of truth for all screens is the Figma file **"web متمكن فريلانسر انفلونسر"**. Each module is implemented to match its Figma frames, using the shared components and tokens described below.

---

## Tech stack

| Area | Library |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Localization | [next-intl](https://next-intl.dev) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Phone input | [react-phone-number-input](https://gitlab.com/catamphetamine/react-phone-number-input) |
| Icons | [lucide-react](https://lucide.dev), [react-icons](https://react-icons.github.io/react-icons), Figma SVG exports |
| Fonts | Tajawal (Arabic + Latin), Quicksand (buttons), Mulish (hints) via `next/font` |

---

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The home route redirects to `/signup`.

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the project |

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL used by the browser, e.g. `http://localhost:8000/api`. |
| `API_URL` | No | Backend base URL used by the Next.js server (logout). Defaults to `NEXT_PUBLIC_API_URL`. |
| `NEXT_PUBLIC_PAYMENTS_SIMULATE` | No | `true` in development with the backend's fake gateway: deposits are completed with `POST /wallet/deposits/{id}/simulate` instead of redirecting to the provider's `checkoutUrl`. Never set it in production. |
| `PHONE_AUTH_ENABLED` | No | Set to `true` to offer signup, login and password reset by mobile number. Off by default to avoid SMS OTP costs; only email is shown. |

Copy `.env.example` to `.env.local` to use the local backend:

```bash
cp .env.example .env.local
```

The local backend (`motamken-back`, Laravel in Docker) runs on http://localhost:8000 and only accepts browser requests from http://localhost:3000, so run the frontend on port 3000. Emails with verification codes are caught by Mailpit at http://localhost:8025.

---

## Project structure

```
messages/                     Translation files
  en.json
  ar.json
public/images/                Assets exported from Figma
src/
  app/
    globals.css               Tailwind setup, design tokens, light / dark variables
    [locale]/
      layout.tsx              Root layout: fonts, <html lang/dir>, providers, header, footer
      page.tsx                Redirects to /signup
      not-found.tsx           Under Construction screen
      [...slug]/page.tsx      Catch-all: any route without a page shows Under Construction
      (auth)/                 Auth routes (route group, not part of the URL)
        signup/
        signup/verify/
        login/
        login/verify/
        forgot-password/
        forgot-password/verify/
        reset-password/
        reset-password/success/
        reset-password/error/
  components/
    header/                   Header, language, currency and theme switchers
    footer/                   Footer
    providers/                Client providers (theme)
    ui/                       Shared UI kit: Button, Field, PasswordField, PhoneField,
                              Checkbox, Dropdown, Modal
    under-construction/       Placeholder screen for unfinished pages
  i18n/
    routing.ts                Supported locales and URL strategy
    navigation.ts             Locale-aware Link, redirect, useRouter, usePathname
    request.ts                Loads messages for the current locale
  modules/
    auth/
      components/             Auth screens and building blocks
      lib/validation.ts       Validation rules returning translation keys
      services/auth.service.ts API client
      types.ts                Shared auth types
      index.ts                Public exports of the module
  proxy.ts                    Locale detection and routing (Next.js 16 proxy)
```

---

## Architecture

### Feature modules

Business features live in `src/modules/<feature>`. A module owns its components, validation, services and types, and exposes a small public API through `index.ts`. Pages in `src/app` stay thin: they read route params, load translations and render module components.

New features (projects, services, payments, ...) should follow the same layout as `modules/auth`.

### Shared components

`src/components/ui` is the design system. Forms and pages must build on these components instead of re-creating inputs or buttons, so styling, dark mode and RTL stay consistent:

| Component | Purpose |
| --- | --- |
| `Button` | Primary (green gradient), orange, outline and outline-orange variants; renders a locale-aware link when `href` is set; built-in loading state |
| `Field` | Labeled input with icon, hint, error and required marker |
| `PasswordField` | `Field` with show / hide toggle (lucide `Eye` / `EyeOff`) |
| `PhoneField` | International phone input with country picker, SA as default, direction-aware |
| `Checkbox` | Figma-styled checkbox |
| `Dropdown` | Accessible menu used by language and currency switchers |
| `Modal` | Dialog with overlay, Escape to close, optional title and close button |

### Server and client components

Pages and layout pieces are server components by default. Only interactive parts (forms, switchers, modals) are client components, marked with `"use client"`.

---

## Auth module

### Screens and routes

| Route | Screen |
| --- | --- |
| `/signup?method=phone\|email` | Signup with Email / Mobile tabs, username rule, password strength meter, terms, newsletter, reCAPTCHA, social signup |
| `/signup/verify?method=&to=` | 4-digit OTP with paste support, 59s resend timer, success modal |
| `/login?method=email\|phone` | Login with Email / Mobile tabs, inline error state, forgot password link, social login |
| `/login/verify?method=&to=` | Login verification code (two-step login by email) |
| `/forgot-password?method=email\|phone` | Email sends a reset link, phone sends an OTP |
| `/forgot-password/verify?method=&to=` | OTP for password reset (WhatsApp or SMS for phone) |
| `/reset-password?token=` | New password + confirmation with strength meter |
| `/reset-password/success` | "Password Reset Successful!" screen with "Go To Login" |
| `/reset-password/error` | Error screen with "Reset Password" |

### Flows

**Signup by phone**
Fill form → confirm number modal ("Is this number correct?") → OTP → "Welcome to the Community!" modal (50 welcome points) → login.

**Signup by email**
Fill form → confirm email modal ("Is this email correct?") → OTP → "Welcome to the Community!" modal → login.

**Signup error**
Server failure → error modal ("There was an error processing your registration") with "Need help?" link.

**Login by email**
Email + password → home. A verification code is asked only when the email is not verified yet, when two-factor
authentication is on, or when the backend lists `email` in `LOGIN_OTP_METHODS`.

**Login by phone**
Phone + password → home.

**Login error**
Wrong credentials → fields turn red with an inline message under the password.

**Forgot password by email**
Enter email → reset link → create new password → success or error screen.

**Forgot password by phone**
Enter phone → OTP → create new password → success or error screen.

### Phone authentication switch

Phone signup / login is disabled by default because every phone OTP is a paid SMS. The available methods come from `getAuthMethods()` in `modules/auth/lib/settings.ts`:

- When only email is enabled, the Email / Mobile tabs are hidden and `?method=phone` falls back to email on every auth page.
- It currently reads `PHONE_AUTH_ENABLED`. When the admin dashboard is ready, replace its body with a call to the backend settings endpoint so admins can toggle phone authentication without a deploy. The backend must also reject phone requests while the setting is off.

### Validation rules

Defined in `modules/auth/lib/validation.ts`. Each rule returns a translation key from the `Validation` namespace, so errors appear in the active language.

| Field | Rule |
| --- | --- |
| First / last name | Optional, letters only |
| Username | Required, letters and dots, words separated by single spaces |
| Email | Required, valid format |
| Phone | Required, valid number for the selected country |
| Password | At least 8 characters with upper and lowercase letters, a number and a symbol |
| Confirm password | Must match the new password |
| Terms | Must be accepted |

---

## Projects, offers, teams and profile

Everything below reads from and writes to the backend; there is no mock data left in the frontend.

| Route | Screen | Endpoints |
| --- | --- | --- |
| `/projects` | Browse open projects with search, type, category, location, budget and sort filters (kept in the URL) | `GET /projects` |
| `/categories`, `/categories/[slug]` | All categories, and the open work of one category | `GET /categories`, `GET /projects?category=` |
| `/search` | Advanced search: "Search By" sidebar (all, projects, influencer requests, influencers, freelancers), filters per type (text, section, budget range, skills with suggestions, minimum rating, platform, country, city, sort), result count, list / grid view, empty state with "Browse Services" / "Edit Search". `/search/advanced` redirects here | `GET /search`, `GET /search/skills` |
| `/notifications` | All notifications with group tabs and unread counts, unread-only switch, mark one / all as read, load more; the header dropdown links here. Links are built by `lib/notifications.ts` | `GET /notifications?group=&unread=`, `POST /notifications/{id}/read`, `POST /notifications/read-all` |
| `/settings/points` | Points balance, how to earn (done / each time), current draw countdown, points history | `GET /me/points`, `GET /draws/current` |
| `/settings/medals` | Earned medals and progress towards the others (also shown on public profiles) | `GET /me/medals` |
| `/settings/invite` | Invite link and code (copy, WhatsApp / X / Facebook / Telegram / email), steps, referral dashboard (visits, sign-ups, qualified, earnings, conversion), tier progress, monthly earnings, invitees and commissions | `GET /me/affiliate`, `/referrals`, `/earnings` |
| `/gifts` | Prize draw: countdown, my points / tickets / chance, buy tickets, prizes, win banner and claim (wallet or delivery address), how it works, previous winners | `GET /draws/current`, `POST /draws/{id}/entries`, `POST /draw-winners/{id}/claim`, `GET /draws/history` |
| `/signup?ref=CODE` | Invite links: the code is remembered for 30 days, the visit is counted once per session and the code is sent with the sign-up | `POST /affiliate/visits`, `POST /auth/signup` (`referralCode`) |
| Error pages | `not-found.tsx` (404), `error.tsx` (500 with retry), `forbidden.tsx` (403, via `forbidden()`; needs `experimental.authInterrupts` in `next.config.ts`) | — |
| `/projects/new`, `/influencers/new` | 3-step wizard: details → budget & location → review & publish | `POST /projects` |
| `/projects/[id]` | Project page. Owner: offers with accept / decline / message, edit, close, complete, delete. Others: send, edit or withdraw an offer (optionally as a team) | `GET /projects/{id}`, `GET /projects/{id}/proposals`, `POST /projects/{id}/proposals`, `PATCH /proposals/{id}`, `POST /proposals/{id}/(accept\|decline\|withdraw)`, `POST /projects/{id}/(close\|complete)`, `DELETE /projects/{id}` |
| `/projects/[id]/edit` | Same wizard, prefilled | `PATCH /projects/{id}` |
| `/my-projects`, `/offers` | My projects and my offers, filtered by status | `GET /me/projects`, `GET /me/proposals` |
| `/profile` | Add / edit the freelancer or influencer profile needed to send offers | `GET /me/profile`, `PUT /me/profile` |
| `/teams`, `/teams/[id]` | Create a team, invite freelancers (live search), set roles and shares, publish, unpublish, disband, leave; accept or decline invitations | `/teams/*`, `/me/team-invitations`, `/team-invitations/{id}/(accept\|decline)` |
| `/projects/invitations/[id]` | A single team invitation | `GET /me/team-invitations` |
| `/settings` | Settings shell (`modules/settings`): sidebar with every account section; redirects to `/settings/payment` | — |
| `/users/[id]` | Public profile: personal card (rating, location, online / last seen, hire, verification badges, skills, languages, report), tabs Overview (statistics, about, experience, education, certificates, latest reviews), Portfolio (gallery with lightbox and report), Reviews (paginated), Social accounts (influencers), Projects (open projects) | `GET /users/{id}`, `GET /users/{id}/reviews`, `POST /reports` |
| `/profile` | Work profile form plus section editors: skills, languages, experience, education, certificates, social accounts (influencers) and portfolio with image upload | `PUT /me/profile`, `POST/PATCH/DELETE /me/portfolio` |
| `/projects/[id]` → Reviews | After completion, the client and the hired freelancer rate each other (stars + comment) | `GET/POST /projects/{id}/reviews` |
| `/settings/reports` | Content I reported, with status counts and decisions | `GET /me/reports` |
| `/settings/profile` | Photo (upload / camera / crop, remove), first and last name, username, newsletter; email and phone shown with their verified state; "Changes saved successfully" screen | `PATCH /me`, `POST/DELETE /me/avatar` |
| `/settings/notifications` | Which notification groups are also emailed (account & security always on) | `GET/PATCH /me/notification-settings` |
| `/settings/password` | Change password with strength meter; other devices are logged out | `POST /me/password` |
| `/settings/security` | Two-factor authentication by SMS or email (method → password → number / email → confirm → code → result), turn off with password, login devices with logout one / all others | `GET /me/security`, `POST /me/two-factor`, `/resend`, `/confirm`, `/disable`, `DELETE /me/sessions/{id}`, `POST /me/sessions/logout-others` |
| `/settings/payment` | Saved cards / PayPal, add (validated card form) and remove with confirmation, preferred method, display currency | `GET/POST /me/payment-methods`, `POST /me/payment-methods/{id}/default`, `DELETE /me/payment-methods/{id}`, `PATCH /me/preferences` |
| `/premium` and homepage "Add Your Profile" / "Add Your Project" | Feature a project (pick an open project → package) or the profile (current photo / upload / camera → crop → package), then the shared payment popup (`modules/payments/PayModal`: summary → My Balance or card → processing → result → quick feedback). My promotions list on `/premium` (`modules/promotions`) | `GET /me/projects?status=open`, `GET /promotions/packages`, `POST /me/avatar`, `POST /promotions`, `GET /me/promotions` |
| `/projects/[id]` → Payment protection panel | Client and hired freelancer / team (`modules/escrow`): set up milestones (must add up to the accepted offer), summary cards + progress, fund one / all (shared PayModal), deliver with note, approve & release (confirmation), request changes, open dispute, team payout split approval / objection, tip after a release (5 / 10 / 15 % or custom, no fee), cancel while nothing is funded | `GET/POST /projects/{id}/escrow`, `/escrow/fund`, `/escrow/cancel`, `/escrow/split/(approve\|object)`, `/escrow/tip`, `POST /milestones/{id}/(fund\|submit\|approve\|request-changes\|dispute)` |
| `/settings/escrow` | Every escrow the user pays for or is paid on, with totals and progress | `GET /me/escrows` |
| `/settings/verification` | Trust checklist (email, phone, identity, payment method) and identity verification: document type / number / name / birth date, front, back and selfie uploads; pending, approved and rejected (with reason) states (`modules/verification`) | `GET/POST /me/kyc`, `GET /me/payment-methods` |
| `/disputes`, `/disputes/[id]` | My disputes; case page with summary, status steps, decision, timeline (messages, system events, image / file evidence), composer with attachment, withdraw and concede with confirmation (`modules/disputes`). Opened from a milestone on the project page | `GET /disputes`, `GET /disputes/{id}`, `POST /disputes/{id}/messages`, `POST /disputes/{id}/(withdraw\|concede)`, `POST /milestones/{id}/dispute` |
| `/settings/wallet` | Balances per currency, monthly income / spending chart, transactions (type filter, paginated), pending withdrawals (cancel), Add Balance and Withdraw flows with processing screen, result and quick feedback (`modules/wallet`) | `GET /wallet`, `/wallet/stats`, `/wallet/transactions`, `/wallet/withdrawals`, `POST /wallet/deposits`, `POST /wallet/withdrawals`, `POST /wallet/withdrawals/{id}/cancel`, `POST /feedback` |

Validation errors from the backend (`errors`) are shown under the matching field; refusals with a `code` are handled where they matter (for example `profile_required` links to `/profile`).

## Localization

- Supported locales: **English (`en`, default)** and **Arabic (`ar`)**.
- URL strategy `as-needed`: English has no prefix (`/signup`), Arabic is prefixed (`/ar/signup`).
- `src/proxy.ts` detects the locale and routes the request.
- `<html>` receives `lang` and `dir` (`rtl` for Arabic). Layouts use logical Tailwind utilities (`ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `rounded-s-*`) so they mirror automatically.
- Phone numbers, country codes and OTP digits are always rendered left to right.
- The language menu in the header switches locale and keeps the current page and query.

### Adding text

1. Add the key to both `messages/en.json` and `messages/ar.json` under the right namespace.
2. Use `useTranslations("Namespace")` in components or `getTranslations("Namespace")` in server code.
3. Always use `Link`, `redirect` and `useRouter` from `@/i18n/navigation` so URLs keep the active locale.

---

## Theming and design tokens

Colors come from the Figma variables and are defined once in `src/app/globals.css`.

| Token | Light | Usage |
| --- | --- | --- |
| `brand` | `#188D4A` | Titles, links, active states |
| `brand-border` / `brand-light` | `#188A47` / `#0BBB89` | Green gradient (primary buttons) |
| `orange` / `orange-light` | `#D24005` / `#DC7A04` | Secondary actions, hints, orange gradient |
| `danger` | `#EC0000` | Errors |
| `foreground` | `#303030` | Body text |
| `muted` | `#686868` | Secondary text |
| `border` | `#E7E4E4` | Inputs, dividers |
| `placeholder` | `#A2A2A2` | Placeholders |
| `subtle` | `#A09F99` | Separators, helper text |
| `nav` | `#303030` | Navigation bar, footer banner |

Surface tokens (`background`, `surface`, `surface-muted`, `foreground`, `border`, ...) have light and dark values. Components only use tokens, never raw hex values, so dark mode works everywhere.

Custom utilities: `bg-gradient-brand`, `bg-gradient-orange`, `bg-gradient-strength`, `text-gradient-brand`, `page-container`, and shadows `shadow-card`, `shadow-tab`, `shadow-social`, `shadow-check`.

**Dark mode** is handled by `next-themes` with the `.dark` class. The default is light, matching Figma. The header toggle switches themes and the choice is remembered. Monochrome Figma icons use `dark:invert`.

---

## Backend integration

All API calls go through `src/modules/auth/services/auth.service.ts`. When `NEXT_PUBLIC_API_URL` is set, requests are sent as `POST` JSON with `Accept: application/json`, `credentials: "include"` and an `Accept-Language` header matching the active locale, so backend messages come back in the user's language. Error responses return `{ "message": "..." }` (and `errors` for validation), and the message is shown to the user.

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `signup` | `POST /auth/signup` | `method, firstName, lastName, username, email?, phone?, password, subscribe` | `{ target }` |
| `login` | `POST /auth/login` | `method, identifier, password` | `{ accessToken?, otpRequired? }` |
| `verifyOtp` | `POST /auth/otp/verify` | `purpose (signup \| login \| reset), method, target, code` | login: `{ accessToken, user }` · reset: `{ token }` |
| `resendOtp` | `POST /auth/otp/resend` | `purpose, method, target` | `{ sent }` |
| `requestPasswordReset` | `POST /auth/password/forgot` | `method, target` | `{ sent }` — a reset code is sent, then `/forgot-password/verify` |
| `resetPassword` | `POST /auth/password/reset` | `token, password` | `{ success }` |
| `logout` | `POST /auth/logout` | — (`Authorization: Bearer <accessToken>`) | `{ success }` — called by the `deleteSession` server action |

Phone numbers are sent in E.164 format (e.g. `+966555555555`).

### Calling the API from pages

| Where | Helper | How the token is sent |
| --- | --- | --- |
| Server components | `apiGet` / `apiGetOrNull` in `src/lib/api/server.ts` | Read from the `motamakin_session` cookie |
| Client components | `api` in `src/lib/api/client.ts` | Requests go to `/api/backend/*` (`src/app/api/backend/[...path]/route.ts`), which adds the token and forwards to `API_URL`. JSON and `multipart/form-data` both pass through. A `401` clears the session cookie. |

Response types live in `src/lib/api/types.ts`.

### Homepage, header and messages

| Area | Endpoints used |
| --- | --- |
| Homepage `/` (`modules/home`) | `GET /home`; tabs and "Show All" use `GET /projects?type=&category=&page=&perPage=5` |
| Header (`components/header`) | `GET /me/summary` (wallet, points, unread badges), `GET /currencies`, `GET /countries`, `GET /countries/{id}/cities`, `GET /categories`, `GET /notifications`, `POST /notifications/{id}/read`, `POST /notifications/read-all`, `PATCH /me/preferences` (language, currency, theme) |
| Messages `/messages` (`modules/messages`) | `GET /conversations?sort=&q=`, `GET /conversations/{id}/messages` (`before` for older, `after` for polling every 4 s), `POST /conversations/{id}/read`, `POST /conversations/{id}/messages` (text, file, voice recorded with the mic), `POST /conversations` ("Hire Me") |

`/messages?c=<id>` opens a conversation directly. `/messages` is a protected route.

### Session and protected pages

- After a successful login (or login verification code), the access token is stored in an `httpOnly` cookie named `motamakin_session` by the server actions in `modules/auth/actions.ts`.
- `src/proxy.ts` protects private routes listed in `PROTECTED_PATHS` (`src/lib/session.ts`), currently `/projects/*`. Guests are redirected to `/login?next=<page>` and sent back to that page after logging in.
- Signed-in users who open the login, signup, forgot or reset password pages are redirected to `/projects/new`.
- The header shows **My account · Logout** when signed in, and **Join us or Login** otherwise.
- Below the `lg` breakpoint the top bar shows only the logo, notifications and a burger (☰) button. The burger opens a side drawer (`components/header/MobileMenu.tsx`) with the main navigation, account links, language, currency and theme; the horizontal navigation bar is desktop only.
- To protect a new section, add its pattern to `PROTECTED_PATHS`.
- When the backend answers `401` to a server-side request made with a session (password changed, device logged out, token expired), `apiGet` redirects to `/api/session/expired`, which deletes the cookie and opens `/login`.
- With two-factor authentication on, `POST /auth/login` returns `twoFactor: {method, target}`; the login page passes it to `/login/verify` (`tf`, `hint`) so the screen says where the code was sent.

When `otpRequired` is `true`, the user is sent to `/login/verify`. For `purpose: reset`, `token` is the password reset token.

`NEXT_PUBLIC_API_URL` is required: there is no mock mode, every screen uses the backend.

---

## Conventions

- TypeScript everywhere, no `any`.
- Tailwind utilities only; no CSS modules or inline hex colors outside `globals.css`.
- Logical properties for spacing and alignment to keep RTL correct.
- No hard-coded user-facing text; every string lives in `messages/*.json`.
- Code is self-explanatory without comments.
- Figma assets go in `public/images`; icons that are not in Figma come from `lucide-react` or `react-icons`.
- Import from a module through its `index.ts` (e.g. `@/modules/auth`).

---

## Roadmap

**Short term**
- Connect the auth module to the real backend and store the session.
- Replace temporary icons (footer socials, store badges, success / error icons, welcome modal illustration, loading screen) with the original Figma exports.
- Make the header menu, categories dropdown, notifications and search functional.

**Next modules**
- Home page, services and categories.
- Post a project and post an influencer request.
- Bidding and request system.
- User account: profile, my projects, payments, points & gifts, invite a friend.
- Evaluation, disputes, account verification and customer support.
- Static pages: guide, sitemap, black list, guarantee of rights, user agreement, privacy policy, terms & conditions.

## Environment: visitor details for the API

Set `API_PROXY_SECRET` (server-only) to the same value as `FRONTEND_PROXY_SECRET` in the backend. The API proxy
(`src/app/api/backend`) and server-side fetches use it to pass on the visitor's IP, browser and country, which the API
needs for rate limits and to count campaign and affiliate visits correctly. See `src/lib/api/visitor.ts`.

## Pages added with the backend

- `/settings/campaigns`, `/settings/campaigns/new`, `/settings/campaigns/[id]`: promotion campaigns (advertiser)
- `/settings/promoter`: promote campaigns and earn (promoter)
- `/r/[code]`: a promoter's link; reports the visit, then opens the promoted project or profile
- `/favorites` and the heart button on project and profile cards
- Footer information pages (`/terms`, `/guide`, `/site-fees`, ...): served by the API and edited by admins; any other
  unknown address still shows "under construction"
- `/contact` (form) and `/sitemap`

## Admin panel

`/admin` (also linked from the account menu) is only visible to accounts with `isAdmin: true`; everyone else gets a 404 and
guests are sent to log in. Sections: overview, users (suspend, wallet adjustment), identity checks, reports, contact messages,
projects (feature / close), categories, disputes (take, private note, settle), campaigns, withdrawals, ledger, plans,
affiliate, draws, payment feedback, info pages (bilingual Markdown editor with preview) and fees & limits.
Code: `src/app/[locale]/admin` (pages) and `src/modules/admin` (shared table, filters, action dialogs, editors).

The logo is `public/images/logo.png`; the browser icons are `src/app/favicon.ico`, `icon.png` and `apple-icon.png`.

## Card payments (Moyasar)

Set `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY` (pk_…) and `NEXT_PUBLIC_PAYMENTS_SIMULATE=false`; the API needs
`PAYMENTS_DRIVER=moyasar` and the secret key (see the backend README). Card details go from the browser straight to
Moyasar (`src/lib/moyasar.ts`); 3-D Secure opens in a small window (or this tab, if popups are blocked) and comes back
to `/payments/return`. Without the key the site keeps the development flow with simulated payments.
