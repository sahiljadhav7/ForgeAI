import { expect, test, type Page } from "@playwright/test";

// Signed-out smoke tests for the pages a visitor can reach without an
// account. Anything that would call Gemini is blocked so a run can never
// spend credits.
test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/(gen-ai-code|improve)/, (route) => route.abort());
});

function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

// Clerk's modals exist only once clerk-js has loaded. Before that, submit
// falls back to navigating to sign-in (a deliberate path, see ticket 05).
async function waitForClerk(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as { Clerk?: { loaded?: boolean } }).Clerk?.loaded === true,
    undefined,
    { timeout: 15_000 },
  );
}

const composer = (page: Page) => page.getByRole("textbox", { name: "Describe your app" });
const sendButton = (page: Page) => page.getByRole("button", { name: "Build it" });
const chips = (page: Page) => page.locator("form button[type=button]");

test.describe("landing page", () => {
  test("renders the hero with one main and a banner outside it", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/");

    await expect(page).toHaveTitle("Daybreak — Describe an app. We'll build it.");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Describe an app. We'll build it.");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.locator("main header")).toHaveCount(0);
    for (const id of ["examples", "how-it-works", "features", "pricing"]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test("has no horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("send is disabled until the prompt has text", async ({ page }) => {
    await page.goto("/");
    await expect(sendButton(page)).toBeDisabled();
    await composer(page).fill("   \n  ");
    await expect(sendButton(page)).toBeDisabled();
    await composer(page).fill("A habit tracker");
    await expect(sendButton(page)).toBeEnabled();
  });

  test("shows three suggestion chips that fill and focus the composer", async ({ page }) => {
    await page.goto("/");
    await expect(chips(page)).toHaveCount(3);
    await chips(page).first().click();
    await expect(composer(page)).not.toHaveValue("");
    await expect(composer(page)).toBeFocused();
  });

  test("Enter while signed out opens the sign-in modal and keeps the prompt", async ({ page }) => {
    await page.goto("/");
    await waitForClerk(page);
    await composer(page).fill("A recipe box with tags");
    await composer(page).press("Enter");

    await expect(page.locator(".cl-modalContent .cl-signIn-root")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL("/");
    await expect(composer(page)).toHaveValue("A recipe box with tags");
  });

  test("See how it works scrolls to How it works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See how it works" }).click();
    await expect(page.locator("#how-it-works")).toBeInViewport();
  });
});

test.describe("landing nav, desktop", () => {
  test.skip(({ isMobile }) => isMobile, "desktop nav only");

  test("anchors scroll to their sections", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, id] of [["Pricing", "pricing"], ["Features", "features"], ["Examples", "examples"]]) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test("Get Started opens the sign-up modal", async ({ page }) => {
    await page.goto("/");
    await waitForClerk(page);
    await page.getByRole("banner").getByRole("button", { name: "Get Started" }).first().click();
    await expect(page.locator(".cl-modalContent .cl-signUp-root")).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("landing nav, phone", () => {
  test.skip(({ isMobile }) => !isMobile, "burger menu only");

  test("burger opens the menu sheet with the section links", async ({ page }) => {
    await page.goto("/");
    const sheet = page.locator("#landing-menu-sheet");
    await expect(sheet.getByRole("link", { name: "Pricing" })).toBeHidden();
    // The checkbox sits visually hidden under the burger icon; a keyboard
    // user toggles it with Space.
    await page.getByRole("checkbox", { name: "Menu" }).focus();
    await page.keyboard.press("Space");
    await expect(sheet.getByRole("link", { name: "Pricing" })).toBeVisible();
    await sheet.getByRole("link", { name: "Pricing" }).click();
    await expect(page.locator("#pricing")).toBeInViewport();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows the poster instead of playing the video", async ({ page }) => {
    await page.goto("/");
    const video = page.locator("video");
    await expect(video).toHaveAttribute("poster", /daybreak-hero-poster/);
    expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false);
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });
});

test.describe("other routes", () => {
  test("unknown URLs render the 404 page with the header and one title", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page doesn't exist" })).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("title")).toHaveCount(1);
  });

  test("sign-in and sign-up pages render Clerk with the header", async ({ page }) => {
    for (const [path, root] of [["/sign-in", ".cl-signIn-root"], ["/sign-up", ".cl-signUp-root"]]) {
      await page.goto(path);
      await expect(page.locator(root)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
    }
  });

  for (const path of ["/workspace", "/projects"]) {
    test(`${path} redirects signed-out visitors to sign-in`, async ({ request, baseURL }) => {
      const response = await request.get(`${path}?prompt=hello`, {
        maxRedirects: 0,
        headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36" },
      });
      expect(response.status()).toBe(307);
      // Relative (/sign-in) or Clerk's hosted page, depending on the
      // instance's sign-in URL setting.
      const location = new URL(response.headers()["location"], baseURL);
      expect(location.pathname).toContain("sign-in");
      expect(location.searchParams.get("redirect_url")).toContain(path);
    });
  }
});
