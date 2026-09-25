# Motamakin Web

Next.js frontend for the Motamakin platform.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- next-intl (English / Arabic)
- next-themes (light / dark)
- react-phone-number-input
- lucide-react, react-icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL. When empty, the auth service returns mock responses. |

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run start` – run the production build
- `npm run lint` – lint the project
