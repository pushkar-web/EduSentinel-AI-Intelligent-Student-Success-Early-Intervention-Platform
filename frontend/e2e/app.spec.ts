import { test, expect, type Page } from "@playwright/test";

async function signInAsAshish(page: Page) {
  await page.goto("/login");
  await page.locator("#email").fill("ashish@gmail.com");
  await page.locator("#password").fill("ashish123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL("**/admin/institution-kpis", { timeout: 15_000 });
}

async function switchPersonaViaHeader(page: Page, targetLabelSubstring: string, expectedUrlPart: string) {
  const topBanner = page.locator("header").first();
  await topBanner.locator("button").filter({ hasText: /unfold_more/i }).click();
  await topBanner.getByRole("button", { name: new RegExp(targetLabelSubstring, "i") }).click();
  await page.waitForURL(`**${expectedUrlPart}**`, { timeout: 15_000 });
}

test.describe("EduSentinel AI E2E Verification", () => {
  test("Ashish credentials validate errors and log into Admin Portal with Lenis and i18n", async ({ page }) => {
    const errors: string[] = [];
    const consoleErrors: string[] = [];
    const failedLocalRequests: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("ERR_BLOCKED_BY_ORB")) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        failedLocalRequests.push(`${url} (${req.failure()?.errorText})`);
      }
    });

    await page.goto("/login");
    await page.locator("#email").fill("ashish@gmail.com");
    await page.locator("#password").fill("wrongpass");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/invalid password for ashish@gmail\.com/i)).toBeVisible();

    await page.locator("#password").fill("ashish123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL("**/admin/institution-kpis", { timeout: 15_000 });

    await expect(page.locator("header").first()).toContainText("Ashish");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Institution KPIs/i);
    await expect(page.locator("#main-content")).toContainText("0.910 / 0.881");

    // Lenis smooth scroll & Material Symbols Outlined font loaded
    await expect
      .poll(async () => page.locator("html").evaluate((el) => el.classList.contains("lenis")))
      .toBe(true);
    await expect
      .poll(async () => page.evaluate(() => document.fonts.check('20px "Material Symbols Outlined"')))
      .toBe(true);

    // Dashboard-wide language switcher (en -> hi -> mr -> en)
    await page.getByRole("group", { name: /interface language/i }).getByRole("button", { name: "हिं" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await expect(page.locator("aside").first()).toContainText("संस्थागत KPI");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("संस्थागत KPI");
    await expect(page.locator("#main-content")).toContainText("कुल छात्र");

    await page.getByRole("group", { name: /interface language/i }).getByRole("button", { name: "मर" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "mr");
    await expect(page.locator("#main-content")).toContainText("एकूण विद्यार्थी");

    await page.getByRole("group", { name: /interface language/i }).getByRole("button", { name: "EN" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedLocalRequests).toEqual([]);
  });

  test("Student login honors consent onboarding, strengths-based copy, and RBAC escalation blocks", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("aarav.d@student.edusentinel.edu");
    await page.locator("#password").fill("student123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL("**/consent", { timeout: 15_000 });

    await page.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: /continue|proceed|acknowledge/i }).click();
    await page.waitForURL("**/student/progress", { timeout: 15_000 });

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/My Learning & Growth Journey/i);
    const bodyText = await page.locator("main").innerText();
    expect(bodyText).not.toMatch(/\b(High Risk|Critical Risk)\b/);

    // RBAC check: student visiting admin/users sees 403 Access Restricted
    await page.goto("/admin/users");
    await expect(page.getByText(/403 — Access Restricted/i)).toBeVisible();
    await expect(page.getByText(/Unauthorized Scope/i)).toBeVisible();
  });

  test("Full route crawl and link integrity across public and portal routes", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(`${page.url()}: ${err.message}`));

    // 1. Root & Public pages
    await page.goto("/");
    await page.waitForURL("**/login", { timeout: 15_000 });

    for (const pubRoute of ["/login", "/forgot-password", "/privacy-charter", "/consent", "/unauthorized"]) {
      const res = await page.goto(pubRoute);
      expect(res?.status(), `HTTP status for ${pubRoute}`).toBeLessThan(400);
      await expect(page.locator("body")).not.toBeEmpty();
    }
    const devHubRes = await page.goto("/dev/route-hub");
    expect(devHubRes?.status(), "Dev route hub disabled in production build").toBe(404);

    // 2. Authenticate as Admin (access across teacher, mentor, coordinator, admin)
    await signInAsAshish(page);

    const adminAccessibleRoutes = [
      "/admin/institution-kpis",
      "/admin/data-management",
      "/admin/configuration",
      "/admin/model-monitor",
      "/admin/users",
      "/admin/audit-log",
      "/admin/reports",
      "/mentor/dashboard",
      "/mentor/interventions",
      "/coordinator/dashboard",
      "/coordinator/reports",
      "/teacher/class-overview",
      "/teacher/students",
      "/teacher/students/STU1001",
      "/teacher/alerts",
      "/teacher/interventions",
      "/teacher/subject-analytics",
    ];

    const checkedHrefs = new Set<string>();
    for (const route of adminAccessibleRoutes) {
      const res = await page.goto(route);
      expect(res?.status(), `HTTP status for ${route}`).toBeLessThan(400);
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.getByText(/403 — Access Restricted/i)).toHaveCount(0);

      const hrefs = await page.locator('a[href^="/"]').evaluateAll((els) =>
        els.map((el) => el.getAttribute("href") || "").filter(Boolean)
      );
      for (const href of hrefs) {
        const cleanHref = href.split("#")[0];
        if (!cleanHref || checkedHrefs.has(cleanHref)) continue;
        checkedHrefs.add(cleanHref);
        const linkRes = await page.request.get(cleanHref);
        expect(linkRes.status(), `Internal link ${cleanHref} from ${route}`).toBeLessThan(400);
      }
    }

    // 3. Switch to Student and verify Student routes cleanly
    await switchPersonaViaHeader(page, "Student", "/student/progress");
    for (const stuRoute of ["/student/progress", "/student/support-plan", "/student/privacy"]) {
      const res = await page.goto(stuRoute);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator("#main-content")).toBeVisible();
    }

    expect(pageErrors).toEqual([]);
  });

  test("Interactive UI flows: Student 360 tabs, Teacher in-role modal, Management read-only lock", async ({ page }) => {
    await signInAsAshish(page);

    // Student 360 6-tab walkthrough
    await page.goto("/teacher/students/STU1001");
    for (const tabLabel of ["Academic Performance", "Attendance", "Risk Factors", "Interventions", "Notes & Observations", "Overview"]) {
      await page.getByRole("tab", { name: tabLabel }).click();
    }
    await expect(page.locator("#main-content")).toContainText("Aarav Deshmukh");

    // Teacher intervention opens in-role dialog rather than 403 redirect
    await page.goto("/teacher/interventions");
    await page.getByRole("button", { name: /Inspect \/ Update/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Touchable Administration / System Configuration breadcrumb & traceback navigation + persisted Ashish identity
    await page.goto("/admin/configuration");
    const headerBanner = page.locator("header").first();
    await expect(headerBanner).toContainText("Ashish");
    await headerBanner.getByRole("button", { name: /System Configuration/i }).click();
    await expect(headerBanner.getByRole("menu")).toBeVisible();
    await headerBanner.getByRole("menuitem", { name: /Institution KPIs/i }).click();
    await page.waitForURL("**/admin/institution-kpis", { timeout: 15_000 });
    await expect(page.locator("#main-content")).toContainText("4,892");
    await expect(page.locator("#main-content")).toContainText("252 / 328 resolved");

    await page.goto("/coordinator/dashboard");
    await expect(page.locator("#main-content")).toContainText("486");
    await expect(page.locator("#main-content")).toContainText("52");

    await page.goto("/admin/configuration");
    await headerBanner.getByRole("link", { name: /Administration/i }).click();
    await page.waitForURL("**/admin/institution-kpis", { timeout: 15_000 });

    // Switch to Management Read-Only and verify locked controls
    await switchPersonaViaHeader(page, "Exec", "/admin/institution-kpis");
    await expect(page.locator("header").first()).toContainText(/Read-Only \(Management\)/i);

    await page.goto("/coordinator/reports");
    await expect(page.getByRole("button", { name: /Generate Report/i })).toBeDisabled();
  });

  test("Responsive viewports have zero unintended horizontal page overflow", async ({ page }) => {
    await signInAsAshish(page);
    const routes = [
      "/mentor/dashboard",
      "/teacher/class-overview",
      "/coordinator/dashboard",
      "/admin/institution-kpis",
    ];
    const viewports = [
      { name: "desktop", width: 1440, height: 900 },
      { name: "laptop", width: 1036, height: 740 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "mobile", width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator("#main-content")).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow, `${vp.name} horizontal overflow on ${route}`).toBeLessThanOrEqual(2);
      }
    }
  });
});
