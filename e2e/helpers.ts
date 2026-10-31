import { expect, type Page } from "@playwright/test";

const MAILPIT = process.env.E2E_MAILPIT_URL ?? "http://localhost:8025";
export const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "qa.admin@qa.test", password: process.env.E2E_ADMIN_PASSWORD ?? "Qa!Admin#2026x" };
const PASSWORD = "Qa!Strong#2026x";

/** A fresh, unique account for this run (usernames allow letters and dots only). */
export function newAccount(role: string) {
  const stamp = Date.now().toString(36);
  const letters = stamp.replace(/[0-9]/g, (digit) => "abcdefghij"[Number(digit)]);
  return { email: `${role}.${stamp}@qa.test`, username: `qa.${role}${letters}`, password: PASSWORD };
}

/** The latest verification code Mailpit received for an address. */
async function latestCode(to: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const list = await (await fetch(`${MAILPIT}/api/v1/search?query=to:${encodeURIComponent(to)}`)).json();
    if (list.messages?.length) {
      const message = await (await fetch(`${MAILPIT}/api/v1/message/${list.messages[0].ID}`)).json();
      // The code sits on a line of its own in the plain-text part (bold in older Markdown emails).
      const code = String(message.Text ?? "").match(/^\s*\*{0,2}(\d{4,6})\*{0,2}\s*$/m);
      if (code) return code[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`No verification email for ${to}`);
}

/** Ticks the terms box: the privacy policy opens and must be scrolled to the end before "I Agree". */
async function agreeToPolicy(page: Page, scope = page.locator("body")) {
  await scope.getByRole("checkbox").first().click({ force: true });
  const agree = page.getByRole("button", { name: "I Agree" });
  await agree.waitFor();
  for (let attempt = 0; attempt < 20 && !(await agree.isEnabled()); attempt++) {
    await page.evaluate(() =>
      document.querySelectorAll("[role=dialog] *").forEach((element) => {
        if (element.scrollHeight > element.clientHeight + 5) element.scrollTop = element.scrollHeight;
      }),
    );
    await page.waitForTimeout(300);
  }
  await agree.click();
}

/** Signs up by email through the form and enters the emailed code, ending on the welcome screen. */
export async function signUp(page: Page, account: { email: string; username: string; password: string }) {
  await page.goto("/signup?method=email");
  await page.getByPlaceholder("Enter you first name").fill("Qa");
  await page.getByPlaceholder("Enter you last name").fill("User");
  await page.getByPlaceholder("Enter a username").fill(account.username);
  await page.getByPlaceholder("Enter email address").fill(account.email);
  await page.getByPlaceholder("********").fill(account.password);
  await agreeToPolicy(page);
  await page.getByRole("button", { name: "Send Verification Code" }).click();
  await page.getByRole("button", { name: /yes/i }).click();
  await page.waitForURL(/signup\/verify/);
  const boxes = page.locator('input[aria-label^="Digit"]');
  await boxes.first().click();
  await page.keyboard.type(await latestCode(account.email));
  await expect(page.getByText("Welcome to the Community!")).toBeVisible();
}

/** Signs in by email (clearing any previous session first). */
export async function logIn(page: Page, email: string, password: string) {
  await page.context().clearCookies();
  await page.goto("/login?method=email");
  await page.getByPlaceholder("Enter email address").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"));
  // Let the post-sign-in navigation finish, so it cannot land after the test's next page.goto().
  await page.waitForLoadState("networkidle");
}

/** The last button in the open dialog (its confirm/submit button). */
export const dialogSubmit = (page: Page) => page.getByRole("dialog").getByRole("button").last();

/** Presses "Confirm" in the site's confirm dialog when one opens (it replaced the browser's native confirm box). */
export async function confirmIfAsked(page: Page) {
  const confirm = page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true });
  if (await confirm.waitFor({ timeout: 3000 }).then(() => true, () => false)) await confirm.click();
}
