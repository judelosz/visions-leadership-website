const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const root = path.resolve(__dirname, "..");
const primaryPages = ["index.html", "course.html", "travel.html", "transitional-health.html", "about.html", "testimonials.html", "events.html", "store.html", "contact.html"];
const viewports = [
  { width: 390, height: 844, label: "mobile" },
  { width: 768, height: 1024, label: "tablet" },
  { width: 1024, height: 900, label: "small-desktop" },
  { width: 1440, height: 1000, label: "desktop" },
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const redirectRules = fs.readFileSync(path.join(root, "_redirects"), "utf8");
assert(!/visionsleadershipclc\.com/.test(redirectRules), "Custom-domain redirect rules conflict with Netlify's primary-domain redirect");

(async () => {
  const browserErrors = [];
  const browser = await chromium.launch({ headless: true });

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(`${viewport.label} console: ${message.text()}`);
    });
    page.on("pageerror", (error) => browserErrors.push(`${viewport.label} pageerror: ${error.message}`));

    for (const file of primaryPages) {
      const response = await page.goto(`${baseUrl}/${file}`, { waitUntil: "domcontentloaded" });
      assert(response && response.ok(), `Failed to load ${file} at ${viewport.width}px`);
      await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
      await page.waitForFunction(() => [...document.images].every((image) => image.complete), null, { timeout: 10000 });
      assert((await page.locator("main").count()) === 1, `Missing main on ${file}`);
      assert((await page.locator("h1").count()) === 1, `Expected one h1 on ${file}`);
      assert((await page.locator("nav a").count()) === 9, `Expected nine navigation destinations on ${file}`);

      const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      assert(metrics.content <= metrics.viewport, `Horizontal overflow on ${file} at ${viewport.width}px: ${JSON.stringify(metrics)}`);

      const imageProblems = await page.locator("img").evaluateAll((images) => images
        .filter((image) => !image.complete || image.naturalWidth === 0 || !image.hasAttribute("alt"))
        .map((image) => image.getAttribute("src")));
      assert(imageProblems.length === 0, `Broken or unlabeled images on ${file}: ${imageProblems.join(", ")}`);

      const localLinks = await page.locator("a[href]").evaluateAll((links) => links
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && !/^(https?:|mailto:|tel:|#)/.test(href)));
      for (const href of localLinks) {
        const localFile = href.split(/[?#]/)[0].replace(/^\/+/, "");
        const localCandidates = [
          path.join(root, localFile),
          path.join(root, `${localFile}.html`),
          path.join(root, localFile, "index.html"),
        ];
        assert(!localFile || localCandidates.some((candidate) => fs.existsSync(candidate)), `Broken local link on ${file}: ${href}`);
      }
    }

    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: `/tmp/visions-home-${viewport.label}.png`, fullPage: true });
    if (viewport.width <= 820) {
      await page.locator(".nav-toggle").click();
      const menuState = await page.locator(".site-nav").evaluate((menu) => {
        const rect = menu.getBoundingClientRect();
        const link = menu.querySelector("a");
        return {
          display: getComputedStyle(menu).display,
          background: getComputedStyle(menu).backgroundColor,
          linkColor: link ? getComputedStyle(link).color : "",
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });
      assert(menuState.display === "block", `Mobile menu did not open at ${viewport.width}px`);
      assert(menuState.left <= 1 && menuState.width >= viewport.width - 2, `Mobile menu did not cover the viewport at ${viewport.width}px: ${JSON.stringify(menuState)}`);
      assert(menuState.height >= viewport.height - 80, `Mobile menu was constrained to the header at ${viewport.width}px: ${JSON.stringify(menuState)}`);
      assert(menuState.background === "rgb(16, 58, 50)" && menuState.linkColor === "rgb(255, 254, 250)", `Mobile menu contrast is incorrect at ${viewport.width}px: ${JSON.stringify(menuState)}`);
      await page.screenshot({ path: `/tmp/visions-menu-${viewport.label}.png`, fullPage: false });
      await page.locator(".nav-toggle").click();
    }
    await page.close();
  }

  const interactionPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  await interactionPage.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
  assert((await interactionPage.locator(".announcement-slide").count()) === 1, "Expected one current homepage event");
  assert(await interactionPage.locator(".announcement-slide").nth(0).isVisible(), "First announcement was not visible");
  assert((await interactionPage.getByText("Pink & Purple Out Tea", { exact: true }).count()) === 1, "Current Pink & Purple Out Tea was not shown");

  await interactionPage.goto(`${baseUrl}/course.html`, { waitUntil: "domcontentloaded" });
  assert((await interactionPage.getByText("Individual plan", { exact: true }).count()) === 1, "Individual pricing plan was not shown");
  assert((await interactionPage.getByText("Organization plan", { exact: true }).count()) === 1, "Organization pricing plan was not shown");
  assert((await interactionPage.locator("#organizations").count()) === 1, "Organization content was not combined into the course page");
  assert((await interactionPage.locator(".course-coaching-card").count()) === 0, "Retired standalone coaching offers are still shown");
  const expectedKajabiOffers = ["2iG2qEMr"];
  const kajabiLinks = await interactionPage.locator('a[href*="monique-foster.mykajabi.com/offers/"]').evaluateAll((links) => links.map((link) => link.href));
  for (const offerId of expectedKajabiOffers) {
    assert(kajabiLinks.some((href) => href.includes(`/offers/${offerId}/checkout`)), `Missing Kajabi checkout offer ${offerId}`);
  }
  const firstQuestion = interactionPage.locator(".faq-item").first();
  await firstQuestion.locator("summary").click();
  assert(await firstQuestion.getAttribute("open") !== null, "Course FAQ did not open");
  await interactionPage.screenshot({ path: "/tmp/visions-course-desktop.png", fullPage: true });

  await interactionPage.goto(`${baseUrl}/contact.html?interest=organization`, { waitUntil: "domcontentloaded" });
  assert((await interactionPage.locator("#interest").inputValue()) === "organization", "Query-based interest selection failed");
  const contactForm = interactionPage.locator('form[name="contact"]');
  assert((await contactForm.getAttribute("method")) === "POST", "Contact form is not configured for POST");
  assert((await contactForm.getAttribute("data-netlify")) === "true", "Contact form is not configured for Netlify Forms");
  assert((await contactForm.getAttribute("action")) === "/thank-you.html", "Contact form success route is missing");
  assert((await contactForm.locator('input[name="bot-field"]').count()) === 1, "Contact form spam field is missing");

  await interactionPage.goto(`${baseUrl}/course.html#organization-inquiry`, { waitUntil: "domcontentloaded" });
  const organizationForm = interactionPage.locator('form[name="organization-inquiry"]');
  assert((await organizationForm.getAttribute("data-netlify")) === "true", "Organization form is not configured for Netlify Forms");
  assert((await interactionPage.getByText("Are coaching sessions included?", { exact: true }).count()) === 1, "Separate coaching purchase answer is missing");

  await interactionPage.goto(`${baseUrl}/testimonials.html`, { waitUntil: "domcontentloaded" });
  assert((await interactionPage.getByText("Justin", { exact: true }).count()) === 1, "Justin's Transitional Living testimonial was not shown");
  assert((await interactionPage.getByText("Transitional living", { exact: true }).count()) === 2, "Expected both Transitional Living testimonials to be labeled");
  await interactionPage.screenshot({ path: "/tmp/visions-testimonials-desktop.png", fullPage: true });

  await interactionPage.goto(`${baseUrl}/impact.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.waitForURL(/about\.html#impact/);
  assert(interactionPage.url().endsWith("about.html#impact"), "Legacy impact page did not redirect");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await mobile.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
  await mobile.getByRole("button", { name: "Menu" }).click();
  assert(await mobile.locator("#site-nav").isVisible(), "Mobile navigation did not open");
  assert((await mobile.getByRole("button", { name: "Close" }).getAttribute("aria-expanded")) === "true", "Mobile toggle state is incorrect");
  await mobile.keyboard.press("Escape");
  assert(!(await mobile.locator("#site-nav").isVisible()), "Escape did not close mobile navigation");
  assert(await mobile.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), "Reduced-motion emulation is not active");
  await mobile.goto(`${baseUrl}/transitional-health.html`, { waitUntil: "domcontentloaded" });
  await mobile.screenshot({ path: "/tmp/visions-transitional-health-mobile.png", fullPage: true });

  await interactionPage.goto(`${baseUrl}/organizations.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.waitForURL(/course\.html#organizations/);
  assert(interactionPage.url().endsWith("course.html#organizations"), "Legacy organization page did not redirect");
  await interactionPage.goto(`${baseUrl}/services.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.waitForURL(/course\.html$/);
  assert(interactionPage.url().endsWith("course.html"), "Retired services page did not redirect");
  await interactionPage.goto(`${baseUrl}/about.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.screenshot({ path: "/tmp/visions-story-desktop.png", fullPage: true });
  await interactionPage.goto(`${baseUrl}/events.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.screenshot({ path: "/tmp/visions-events-desktop.png", fullPage: true });
  await interactionPage.goto(`${baseUrl}/travel.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.screenshot({ path: "/tmp/visions-travel-desktop.png", fullPage: true });
  await interactionPage.goto(`${baseUrl}/store.html`, { waitUntil: "domcontentloaded" });
  assert((await interactionPage.locator('a[href*="visionsleadershipclc.com/product-page"]').count()) === 0, "Store still depends on former-site product links");
  assert((await interactionPage.locator('[data-product-id="praise-god-im-free-journal"] .store-row__price').textContent()).trim() === "$24.99", "Journal price does not match the migrated catalog");
  assert((await interactionPage.locator('[data-product-id="praise-god-im-free-book"] .store-row__price').textContent()).trim() === "$9.99", "Praise God book price does not match the migrated catalog");
  assert((await interactionPage.locator('[data-product-id="far-from-temptation"] .store-row__price').textContent()).trim() === "$15.99", "Book price does not match the migrated catalog");
  assert((await interactionPage.getByText("Free U.S. shipping and handling", { exact: true }).count()) === 2, "Free shipping is not shown for the journal and Praise God book");
  assert((await interactionPage.getByText(/Free U\.S\. shipping and handling/, { exact: false }).count()) === 3, "Free shipping is not shown for all three available titles");
  assert((await interactionPage.locator('[data-product-id="anger-management-journal"] .store-row__status').textContent()).trim() === "Out of stock", "Out-of-stock journal status is missing");
  assert((await interactionPage.locator('[data-product-action][href^="mailto:"]').count()) === 3, "Book email fallbacks are missing before secure checkout links are approved");
  await interactionPage.screenshot({ path: "/tmp/visions-store-desktop.png", fullPage: true });
  await interactionPage.goto(`${baseUrl}/transitional-health.html`, { waitUntil: "domcontentloaded" });
  await interactionPage.screenshot({ path: "/tmp/visions-transitional-health-desktop.png", fullPage: true });

  await mobile.close();
  await interactionPage.close();
  await browser.close();

  assert(browserErrors.length === 0, `Browser errors:\n${browserErrors.join("\n")}`);
  console.log(`Verified nine primary pages and three compatibility redirects at ${viewports.map((item) => `${item.width}px`).join(", ")}.`);
  console.log("Verified responsive overflow, images, links, navigation, current event, FAQs, query selection, production form configuration, and reduced motion.");
  console.log("Screenshots saved in /tmp/visions-*.png");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
