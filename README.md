# Motamakin Web (متمكن)

Frontend for **Motamakin**, a marketplace that connects clients with skilled freelancers and social media influencers. Clients post projects or influencer requests, providers bid on them, and payments are protected by the platform.

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
| 3. Auth | Signup, login, OTP verification, forgot / reset password, success and error states | Done (UI + mock API) |
| 4. Placeholder pages | Every route without a page shows an "Under Construction" screen | Done |
| 5. Backend connection | Replace mock responses with the real API, sessions, protected routes | Next |
| 6. Post a project | Project wizard (individual / team), team & split shares, invitations, share negotiation | In progress (UI + mock data) |
| 7. Project mode | Member exit, team dispute, dispute rules, release authority, team flow states, promotion | Planned |
| 8. Marketplace | Services, categories, bidding, influencer requests | Planned |
| 9. Account area | Profile, my projects, payments, points & gifts, notifications | Planned |
| 10. Trust & support | Evaluation, disputes, account verification, customer support | Planned |
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
| `NEXT_PUBLIC_API_URL` | No | Backend base URL, e.g. `https://api.motamakin.com`. When empty, the auth service returns mock responses so the UI can be developed without a backend. |

Create a `.env.local` file to set it locally.

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
      services/auth.service.ts API client (real or mock)
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
Email + password → verification code → home.

**Login by phone**
Phone + password → home.

**Login error**
Wrong credentials → fields turn red with an inline message under the password.

**Forgot password by email**
Enter email → reset link → create new password → success or error screen.

**Forgot password by phone**
Enter phone → OTP → create new password → success or error screen.

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

## Projects module

Lives in `src/modules/projects`.

| Route | Screen |
| --- | --- |
| `/projects/new` | Post a project wizard |
| `/projects/invitations/[id]` | Team invitation for an invited member (accept, decline, negotiate share) |

**Wizard steps**

| Mode | Steps |
| --- | --- |
| Individual | Project details → Budget & duration → Publish |
| Team | Project details → Budget & duration → Team & split → Publish |

- Choosing a mode opens a confirmation modal explaining what changes (steps, escrow, chat, editing members).
- The team step shows the members table with share controls, the total (must equal 100%), members waiting to accept (publishing is blocked until everyone accepts), split rules, and an invite form.
- The negotiation modal lets an invited member propose a different share with a reason and shows the impact on the team total.

Data is mocked in `modules/projects/lib/data.ts` until the projects API is available. Amounts are always shown in USD (`$1,440`).

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

All API calls go through `src/modules/auth/services/auth.service.ts`. When `NEXT_PUBLIC_API_URL` is set, requests are sent as `POST` JSON with `credentials: "include"` and an `Accept-Language` header matching the active locale. Error responses should return `{ "message": "..." }`, which is shown to the user.

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `signup` | `POST /auth/signup` | `method, firstName, lastName, username, email?, phone?, password, subscribe` | `{ target }` |
| `login` | `POST /auth/login` | `method, identifier, password` | `{ accessToken?, otpRequired? }` |
| `verifyOtp` | `POST /auth/otp/verify` | `purpose (signup \| login \| reset), method, target, code` | `{ token?, accessToken? }` |
| `resendOtp` | `POST /auth/otp/resend` | `purpose, method, target` | `{ sent }` |
| `requestPasswordReset` | `POST /auth/password/forgot` | `method, target` | `{ token? }` |
| `resetPassword` | `POST /auth/password/reset` | `token, password` | `{ success }` |
| Social login | `GET /auth/oauth/{google\|apple\|x\|facebook}` | — | Redirect |

Phone numbers are sent in E.164 format (e.g. `+966555555555`).

### Session and protected pages

- After a successful login (or login verification code), the access token is stored in an `httpOnly` cookie named `motamakin_session` by the server actions in `modules/auth/actions.ts`.
- `src/proxy.ts` protects private routes listed in `PROTECTED_PATHS` (`src/lib/session.ts`), currently `/projects/*`. Guests are redirected to `/login?next=<page>` and sent back to that page after logging in.
- Signed-in users who open the login, signup, forgot or reset password pages are redirected to `/projects/new`.
- The header shows **My account · Logout** when signed in, and **Join us or Login** otherwise.
- To protect a new section, add its pattern to `PROTECTED_PATHS`.

When `otpRequired` is `true`, the user is sent to `/login/verify`. For `purpose: reset`, `token` is the password reset token.

**Mock mode** (no `NEXT_PUBLIC_API_URL`): every call succeeds after a short delay. Email login asks for a verification code, phone login signs in directly, and the OTP code `0000` simulates a wrong code.

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
- Replace the reCAPTCHA placeholder image with Google reCAPTCHA.
- Replace temporary icons (footer socials, store badges, success / error icons, welcome modal illustration, loading screen) with the original Figma exports.
- Make the header menu, categories dropdown, notifications and search functional.

**Next modules**
- Home page, services and categories.
- Post a project and post an influencer request.
- Bidding and request system.
- User account: profile, my projects, payments, points & gifts, invite a friend.
- Evaluation, disputes, account verification and customer support.
- Static pages: guide, sitemap, black list, guarantee of rights, user agreement, privacy policy, terms & conditions.
