# End-to-end journeys

Browser tests of the platform's main journeys (`e2e/journeys.spec.ts`), run with Playwright against a **local** stack:
sign-up with an emailed code, posting a project, an offer accepted, a change to the agreement, payment through escrow,
delivery, release and review, and every admin page. They create accounts and move (test) money, so never point them at
production.

## What it needs

1. The API running locally (`docker compose up -d` in the backend repo) with Mailpit on `http://localhost:8025` and no
   reCAPTCHA secret in its `.env`.
2. An admin account: `docker compose exec app php artisan admin:create qa.admin@qa.test --password='Qa!Admin#2026x'`
   (or set `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`).
3. The website built against the local API, without reCAPTCHA:

   ```sh
   API_URL=http://localhost:8000/api NEXT_PUBLIC_API_URL=http://localhost:8000/api NEXT_PUBLIC_RECAPTCHA_SITE_KEY= npm run build
   API_URL=http://localhost:8000/api PORT=3000 npm start
   ```

## Run

```sh
npx playwright install chromium   # once
npm run e2e                       # E2E_BASE_URL=http://localhost:3000 by default
```

A failed step keeps a screenshot and a trace in `e2e/report` (`npx playwright show-report e2e/report`).
