import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { chromium } from "playwright";

// Run against the finished export. The temporary server and browser close in this command.
const require = createRequire(import.meta.url);
const root = process.cwd();
const output = path.join(root, "artifacts");
const dist = path.join(root, "dist");
const checks = [];
const record = (name, detail = "Passed") => {
  checks.push({ name, detail });
  console.log(`PASS ${name}: ${detail}`);
};
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
};
await mkdir(output, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/preview/")) {
      res.writeHead(404);
      res.end();
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice("/preview/".length)) ||
      "index.html";
    const file = path.resolve(dist, relative);
    if (!file.startsWith(dist + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/preview/`;
let browser;
const consoleErrors = [];
const failedRequests = [];
const responseFailures = [];
const reports = {};
const ids = [
  "2106085777407164654",
  "2104546260195713113",
  "2102344092659134834",
  "2105396759342059873",
  "2103142412000600159",
  "2102729939543863754",
  "2103456907730276751",
];

try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.SWAMP_CHROMIUM
      ? { executablePath: process.env.SWAMP_CHROMIUM }
      : {}),
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText,
    }),
  );
  page.on("response", (response) => {
    if (response.status() >= 400)
      responseFailures.push({ url: response.url(), status: response.status() });
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const cards = () => page.locator(".read-card");
  const count = async (expected) =>
    assert.equal(await cards().count(), expected);
  await count(7);
  assert.deepEqual(
    await cards().evaluateAll((nodes) =>
      nodes.map((node) => node.dataset.readId),
    ),
    ids,
  );
  for (const id of ids)
    assert.equal(
      await page
        .locator(`article[data-read-id="${id}"] a[href$="${id}"]`)
        .count(),
      2,
    );
  record(
    "All seven original posts and curated order",
    "Each card has two links to its exact supplied X status URL.",
  );
  const externalLinks = await page
    .locator('a[target="_blank"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => ({ href: node.href, rel: node.rel })),
    );
  assert.ok(
    externalLinks.every(
      (link) =>
        link.rel.includes("noopener") && link.rel.includes("noreferrer"),
    ),
  );
  record(
    "External link behavior",
    "Original sources open in a new tab with noopener and noreferrer; external X availability is not assumed.",
  );

  for (const [width, height, filename] of [
    [1440, 1000, "desktop.jpg"],
    [820, 1000, "tablet.jpg"],
    [390, 844, "mobile.jpg"],
    [320, 740, "mobile-320.jpg"],
  ]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const pageHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    for (let position = 0; position < pageHeight; position += 600) {
      await page.evaluate((position) => window.scrollTo(0, position), position);
      await page.waitForTimeout(35);
    }
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete),
    );
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
      images: [...document.images].map((img) => ({
        src: img.getAttribute("src"),
        loaded: img.naturalWidth > 0,
      })),
      fonts: [...document.fonts].map((font) => ({
        family: font.family,
        status: font.status,
      })),
      gridColumns: getComputedStyle(document.querySelector(".read-grid"))
        .gridTemplateColumns,
    }));
    assert.ok(
      layout.content <= width,
      `Overflow at ${width}px: ${layout.content}`,
    );
    assert.ok(
      layout.images.every((img) => img.loaded),
      "All local images should decode",
    );
    assert.ok(layout.fonts.every((font) => font.status === "loaded"));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(output, filename),
      fullPage: true,
      type: "jpeg",
      quality: 88,
    });
    if (width === 320)
      await page.screenshot({
        path: path.join(output, "mobile-firstfold.jpg"),
        type: "jpeg",
        quality: 88,
      });
    reports[`${width}px`] = layout;
    record(
      `Responsive export at ${width} × ${height}`,
      `No horizontal overflow; all images and fonts loaded. Screenshot: artifacts/${filename}`,
    );
  }

  const axeSource = await readFile(
    require.resolve("axe-core/axe.min.js"),
    "utf8",
  );
  await page.addScriptTag({ content: axeSource });
  const audit = () =>
    page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      });
      return {
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((node) => node.target),
        })),
        passes: result.passes.length,
        incomplete: result.incomplete.map((v) => v.id),
      };
    });
  reports.axeMobile = await audit();
  assert.deepEqual(reports.axeMobile.violations, []);
  record(
    "Automated accessibility at 320px",
    `${reports.axeMobile.passes} passing axe rules; zero violations. This is not a complete accessibility certification.`,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  reports.axeDesktop = await audit();
  assert.deepEqual(reports.axeDesktop.violations, []);
  record(
    "Automated accessibility at desktop",
    `${reports.axeDesktop.passes} passing axe rules; zero violations.`,
  );

  await page
    .getByRole("link", { name: "Explore the collection", exact: true })
    .click();
  assert.equal(new URL(page.url()).hash, "#collection");
  record("Primary collection navigation");
  for (const [name, expected] of [
    ["Articles", 4],
    ["Threads", 1],
    ["Posts", 2],
  ]) {
    await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await count(expected);
  }
  await page.getByRole("button", { name: /^All reads/ }).click();
  await page.getByLabel("Search collection", { exact: true }).fill("BANKLESS");
  await count(1);
  assert.match(await cards().innerText(), /Bankless/);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await count(7);
  assert.equal(
    await page
      .locator("#search")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page
    .getByLabel("Search collection", { exact: true })
    .fill("no-such-swamp-topic");
  await count(0);
  assert.equal(
    await page
      .getByRole("heading", { name: "No reads in this part of the pond." })
      .count(),
    1,
  );
  await page
    .getByRole("button", { name: "Browse all reads", exact: true })
    .click();
  await count(7);
  await page
    .getByLabel("Search collection", { exact: true })
    .fill("AI oracles");
  await count(1);
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await count(7);
  record(
    "Format filters, author/topic search, clear, empty state, reset",
    "4 articles, 1 thread, 2 posts; case-insensitive author and topic searches return expected content.",
  );
  await page.getByLabel("Sort by", { exact: true }).selectOption("oldest");
  assert.equal(await cards().first().getAttribute("data-read-id"), ids[2]);
  await page.getByLabel("Sort by", { exact: true }).selectOption("newest");
  assert.equal(await cards().first().getAttribute("data-read-id"), ids[0]);
  await page.getByLabel("Sort by", { exact: true }).selectOption("curated");
  record(
    "Chronological sorting",
    "Oldest starts with nftimm; newest starts with washed; curated restores the original order.",
  );

  await page.getByRole("button", { name: /^Saved/ }).click();
  await count(0);
  assert.equal(
    await page
      .getByRole("heading", { name: "A little quiet in here." })
      .count(),
    1,
  );
  await page
    .getByRole("button", { name: "Browse all reads", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save A Better Factory", exact: true })
    .click();
  await page.reload();
  assert.equal(
    await page
      .getByRole("button", { name: "Unsave A Better Factory", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: /^Saved/ }).click();
  await count(1);
  await page
    .getByRole("button", { name: "Unsave A Better Factory", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await count(0);
  await page.waitForFunction(() =>
    document.activeElement?.textContent?.includes("Browse all reads"),
  );
  await page.keyboard.press("Enter");
  await count(7);
  record(
    "Bookmark persistence and saved-only view",
    "Save survives reload; unsave updates count and returns keyboard focus to the empty-state recovery button.",
  );

  const about = page.getByRole("button", {
    name: "About the swamp",
    exact: true,
  });
  await about.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), true);
  await page
    .getByRole("button", { name: "Close about the swamp", exact: true })
    .focus();
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page
      .getByRole("button", { name: "Back to the reads", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator("dialog")
        .evaluate((el) => el.contains(document.activeElement)),
      true,
    );
  }
  await page.keyboard.press("Escape");
  assert.equal(
    await about.evaluate((el) => el === document.activeElement),
    true,
  );
  record(
    "Dialog keyboard behavior",
    "Enter opens; Tab stays inside the native modal; Escape closes and returns focus to the opener.",
  );
  await about.click();
  await page.addScriptTag({ content: axeSource });
  reports.axeDialog = await audit();
  assert.deepEqual(reports.axeDialog.violations, []);
  await page.screenshot({
    path: path.join(output, "about.jpg"),
    type: "jpeg",
    quality: 88,
  });
  await page
    .getByRole("button", { name: "Back to the reads", exact: true })
    .click();

  await page.goto(url);
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.textContent),
    "Skip to content",
  );
  await page.screenshot({
    path: path.join(output, "keyboard-focus.jpg"),
    type: "jpeg",
    quality: 88,
  });
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#main");
  await page.getByRole("button", { name: /^Articles/ }).focus();
  await page.keyboard.press("Space");
  await count(4);
  await page.getByLabel("Search collection", { exact: true }).focus();
  await page.keyboard.type("Bankless");
  await count(1);
  record(
    "Keyboard collection controls",
    "Skip link, format button with Space, typed author search, bookmark with Enter, modal traversal and recovery tested.",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  reports.reducedMotion = await page.evaluate(() => ({
    scrolling: getComputedStyle(document.documentElement).scrollBehavior,
    buttonTransition: getComputedStyle(
      document.querySelector(".primary-button"),
    ).transitionDuration,
  }));
  assert.equal(reports.reducedMotion.scrolling, "auto");
  assert.equal(reports.reducedMotion.buttonTransition, "0s");
  record("Reduced motion", "Smooth scrolling and button transitions disabled.");
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await page.setViewportSize({ width: 820, height: 1000 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await count(7);
  record(
    "200% root text enlargement at 820px",
    "No horizontal overflow; all seven reads remain. This is not native browser zoom.",
  );
  await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  await page.setViewportSize({ width: 1440, height: 1000 });

  reports.contrast = await page.evaluate(() => {
    const rgb = (value) =>
      value
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    const luminance = (color) =>
      rgb(color)
        .map((value) => {
          const c = value / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    return [
      ["Hero body", ".hero-copy>p", "body"],
      ["Card excerpt", ".excerpt", ".read-card"],
      ["Primary action", ".primary-button", ".primary-button"],
      ["Card metadata", ".topic", ".read-card"],
      ["Page metadata", ".collection-footnote", "body"],
    ].map(([name, fg, bg]) => {
      const foreground = getComputedStyle(document.querySelector(fg)).color;
      const background = getComputedStyle(
        document.querySelector(bg === "body" ? ":root" : bg),
      ).backgroundColor;
      const values = [luminance(foreground), luminance(background)].sort(
        (a, b) => b - a,
      );
      return {
        name,
        foreground,
        background,
        ratio: +((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2),
      };
    });
  });
  assert.ok(reports.contrast.every((pair) => pair.ratio >= 4.5));
  record(
    "Measured rendered text contrast",
    reports.contrast.map((pair) => `${pair.name}: ${pair.ratio}:1`).join("; "),
  );

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Disabled for validation", "QuotaExceededError");
    };
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(url);
  await blockedPage
    .getByRole("button", { name: "Save A Better Factory", exact: true })
    .click();
  assert.equal(
    await blockedPage
      .getByText(/Saved for this visit. Browser storage is unavailable/)
      .count(),
    1,
  );
  await blockedPage.getByRole("button", { name: /^Saved/ }).click();
  assert.equal(await blockedPage.locator(".read-card").count(), 1);
  await blocked.close();
  record(
    "Unavailable browser storage",
    "Saving still works for the visit and exposes a persistent explanation.",
  );
  const corrupt = await browser.newContext();
  await corrupt.addInitScript(() =>
    localStorage.setItem("the-swamp:saved:v1", "{invalid-json"),
  );
  const corruptPage = await corrupt.newPage();
  await corruptPage.goto(url);
  assert.equal(await corruptPage.locator(".read-card").count(), 7);
  assert.equal(await corruptPage.locator(".saved-count").textContent(), "0");
  await corrupt.close();
  record(
    "Malformed stored data",
    "An invalid saved value falls back to an empty library without blocking the site.",
  );

  await page.goto(url);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole("button", { name: /^Threads/ }).click();
  await count(1);
  await page.getByRole("button", { name: /^Save “bro/ }).click();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await count(1);
  await page.getByRole("button", { name: /^Unsave “bro/ }).click();
  await count(0);
  await page
    .getByRole("button", { name: "Browse all reads", exact: true })
    .click();
  await count(7);
  await about.click();
  assert.equal(
    await page
      .locator("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
    true,
  );
  await page
    .getByRole("button", { name: "Back to the reads", exact: true })
    .click();
  record(
    "Mobile interaction at 320px",
    "Thread filter, save, saved-only view, unsave, reset, and scrollable About dialog all usable.",
  );

  await page.emulateMedia({ forcedColors: "active" });
  await page.getByRole("button", { name: /^Articles/ }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  reports.forcedColors = await page
    .getByRole("button", { name: /^Articles/ })
    .evaluate((el) => ({
      outlineStyle: getComputedStyle(el).outlineStyle,
      outlineWidth: getComputedStyle(el).outlineWidth,
    }));
  assert.equal(reports.forcedColors.outlineWidth, "3px");
  assert.equal(reports.forcedColors.outlineStyle, "solid");
  record(
    "Forced colors focus style",
    "Computed 3px solid system focus outline retained; not a physical high-contrast device test.",
  );
  await page.emulateMedia({ forcedColors: "none" });

  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(failedRequests, []);
  assert.deepEqual(responseFailures, []);
  record(
    "Console and local resources",
    "Zero console/page errors, failed requests, or HTTP errors during the main browser session.",
  );
  await writeFile(
    path.join(output, "browser-results.json"),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        browser: await browser.version(),
        export: "dist/ served under /preview/",
        checks,
        reports,
        consoleErrors,
        failedRequests,
        responseFailures,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Completed ${checks.length} checks. Evidence saved in artifacts/.`,
  );
} catch (error) {
  await writeFile(
    path.join(output, "browser-failure.json"),
    JSON.stringify(
      {
        message: String(error),
        checks,
        reports,
        consoleErrors,
        failedRequests,
        responseFailures,
      },
      null,
      2,
    ) + "\n",
  );
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
