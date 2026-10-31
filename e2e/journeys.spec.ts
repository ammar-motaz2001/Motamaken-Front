import { expect, test } from "@playwright/test";
import { ADMIN, confirmIfAsked, dialogSubmit, logIn, newAccount, signUp } from "./helpers";

/**
 * The platform's main journeys, end to end in the browser, in order (each step builds on the last):
 * a visitor becomes a client and posts a project, a freelancer sends an offer that is accepted, both sides change the
 * agreement, the client pays through escrow, the work is delivered, released and reviewed, and an admin opens every
 * admin page. See e2e/README.md for the stack it needs.
 */
test.describe.configure({ mode: "serial" });

const client = newAccount("client");
const freelancer = newAccount("free");
let projectPath = "";

test("visitor signs up with an emailed code, signs in and finds projects", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /join us/i }).first()).toBeVisible();

  await signUp(page, client);
  await page.getByRole("button", { name: /go to login/i }).or(page.getByRole("link", { name: /go to login/i })).click();
  await logIn(page, client.email, client.password);

  for (const path of ["/settings/profile", "/settings/wallet", "/notifications"]) {
    await page.goto(path);
    await expect(page).not.toHaveURL(/\/login/);
  }

  await page.goto("/projects?q=design");
  await expect(page.locator("main")).toBeVisible();
});

test("client posts a project through the wizard", async ({ page }) => {
  await logIn(page, client.email, client.password);
  await page.goto("/projects/new");
  await page.getByText("Choose one").click();
  await page.getByRole("option").first().click();
  await page.getByPlaceholder("e.g. Brand identity for a restaurant").fill(`E2E project ${Date.now().toString(36)}`);
  const description = page.locator("textarea");
  await description.fill("Too short");
  await expect(page.getByText(/characters \(at least 20\)/)).toHaveClass(/text-danger/);
  await description.fill("End-to-end test project: a landing page with a contact form and analytics.");
  await expect(page.getByText(/characters \(at least 20\)/)).toHaveClass(/text-brand/);
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("input[type=number]").nth(0).fill("500");
  await page.locator("input[type=number]").nth(1).fill("1500");
  await page.getByRole("button", { name: /review/i }).click();
  await page.getByRole("button", { name: /publish/i }).click();
  await expect(page.getByText("Your project is live!")).toBeVisible();
  await page.getByRole("link", { name: "View It" }).click();
  await page.waitForURL(/\/projects\/\d+$/);
  projectPath = new URL(page.url()).pathname;
});

test("freelancer sends an offer and the client accepts it", async ({ page }) => {
  await signUp(page, freelancer);
  await logIn(page, freelancer.email, freelancer.password);
  await page.goto(projectPath);
  await page.getByLabel(/Your price/).fill("900");
  await page.getByLabel("Delivery time (days)").fill("10");
  const jobTitle = page.getByPlaceholder("e.g. Graphic designer");
  if (await jobTitle.count()) await jobTitle.fill("Web developer");
  await page.getByPlaceholder(/Explain how you will do the work/).fill("I will build the landing page in Next.js with analytics and hand over the source.");
  await page.getByRole("button", { name: "Send offer" }).click();
  await expect(page.getByRole("button", { name: "Withdraw offer" })).toBeVisible();

  await logIn(page, client.email, client.password);
  await page.goto("/notifications");
  await expect(page.getByText(/sent an offer on/).first()).toBeVisible();
  await page.goto(projectPath);
  await page.getByRole("button", { name: "Accept offer" }).click();
  await expect(page.getByRole("button", { name: "Accept offer" })).toHaveCount(0);

  await logIn(page, freelancer.email, freelancer.password);
  await page.goto("/notifications");
  await expect(page.getByText(/accepted your offer on/).first()).toBeVisible();
});

test("the freelancer asks for more time and the client accepts the change", async ({ page }) => {
  await logIn(page, freelancer.email, freelancer.password);
  await page.goto(projectPath);
  await page.getByRole("button", { name: "Request a change" }).click();
  await page.getByLabel("New delivery time (days)").fill("14");
  await page.getByRole("dialog").locator("textarea").fill("The client added two more pages, so I need a few more days.");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("button", { name: "Withdraw request" })).toBeVisible();

  await logIn(page, client.email, client.password);
  await page.goto(projectPath);
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await confirmIfAsked(page);
  await expect(page.getByText(/Agreed: .* 14 days/)).toBeVisible();
});

test("admin tops up the client, who pays through escrow; the work is delivered, released and reviewed", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());

  // The admin credits the client's wallet (no card gateway in the test stack).
  await logIn(page, ADMIN.email, ADMIN.password);
  await page.goto("/admin/users?q=" + encodeURIComponent(client.email));
  await page.locator('main a[href*="/admin/users/"]').first().click();
  await page.getByRole("button", { name: "Adjust wallet" }).click();
  await page.locator("#action-amount").fill("1000");
  await page.locator("#action-reason").fill("E2E test top-up");
  await dialogSubmit(page).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // The client splits the price into two milestones and pays both from the balance.
  await logIn(page, client.email, client.password);
  await page.goto(projectPath);
  const titles = page.getByPlaceholder("e.g. Design mockups");
  await titles.first().fill("Design");
  await page.locator("section").filter({ hasText: "Payment protection" }).locator("input[type=number]").first().fill("400");
  await page.getByRole("button", { name: "Add milestone" }).click();
  await titles.nth(1).fill("Build & launch");
  await page.getByRole("button", { name: "Set up payment protection" }).click();
  await page.getByRole("button", { name: /Fund all/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("My Balance").click();
  await page.getByRole("button", { name: "Pay Now" }).click();
  await expect(page.getByText("In progress").first()).toBeVisible({ timeout: 20_000 });

  // The freelancer delivers the first milestone.
  await logIn(page, freelancer.email, freelancer.password);
  await page.goto(projectPath);
  await page.getByRole("button", { name: "Deliver work" }).first().click();
  await page.getByRole("dialog").locator("textarea").fill("Designs are in the shared folder.");
  await dialogSubmit(page).click();
  await expect(page.getByText("Delivered").first()).toBeVisible();

  // The client releases both milestones and leaves a review.
  await logIn(page, client.email, client.password);
  await page.goto(projectPath);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Approve & release" }).first().click();
    await dialogSubmit(page).click();
    await page.waitForTimeout(1500);
  }
  await expect(page.getByText("Completed").first()).toBeVisible();
  const complete = page.getByRole("button", { name: "Mark as completed" });
  if (await complete.count()) {
    await complete.click();
    await confirmIfAsked(page);
  }
  await page.getByRole("radio", { name: "5 stars" }).or(page.getByRole("button", { name: "5 stars" })).first().click();
  await page.getByPlaceholder("Share your experience (optional)").fill("Great work, delivered on time.");
  await page.getByRole("button", { name: "Submit Review" }).click();
  await expect(page.getByText("Great work, delivered on time.").first()).toBeVisible();

  // The freelancer is told about the payment.
  await logIn(page, freelancer.email, freelancer.password);
  await page.goto("/notifications");
  await expect(page.getByText(/released|paid|review/i).first()).toBeVisible();
});

test("an admin opens every page of the admin panel without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));
  await logIn(page, ADMIN.email, ADMIN.password);

  const sections = [
    "", "analytics", "users", "staff", "audit", "kyc", "projects", "proposals", "escrows", "teams", "reviews", "disputes",
    "appeals", "reports", "messages", "deposits", "withdrawals", "ledger", "subscriptions", "plans", "promotions",
    "campaigns", "affiliate", "points", "medals", "draws", "categories", "skills", "locations", "pages", "faqs",
    "broadcasts", "templates", "mail", "support", "contact", "feedback", "settings", "site-settings", "blacklist", "integrations",
  ];
  for (const section of sections) {
    const response = await page.goto(`/admin/${section}`);
    expect(response?.status(), `/admin/${section}`).toBeLessThan(400);
    await expect(page.locator("main")).not.toContainText(/something went wrong|could not load/i);
  }
  expect(errors).toEqual([]);
});
