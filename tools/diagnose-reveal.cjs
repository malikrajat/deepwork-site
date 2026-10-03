/**
 * A one-off diagnostic for the scroll-reveal directive.
 *
 * Written because the built-site audit reported elements left in the hidden
 * (`reveal--armed`) state after a full scroll, and there are three possible
 * causes that look identical from the outside: the scroll never happened, the
 * scroll happened without an event, or the event fired and the pass did not
 * reveal anything. This separates them.
 *
 *   python tools/serve-app.py dist/deepwork-site/browser 5200
 *   NODE_PATH=<deepwork-repo>/node_modules node tools/diagnose-reveal.cjs
 */

const { chromium } = require('@playwright/test');

const BASE = process.env['SITE_URL'] || 'http://127.0.0.1:5200';

async function snapshot(page, label) {
  const state = await page.evaluate(() => {
    const armed = document.querySelectorAll('.reveal--armed').length;
    const revealed = document.querySelectorAll('.reveal--in').length;
    const total = document.querySelectorAll('.reveal').length;
    return {
      scrollY: Math.round(window.scrollY),
      docScrollY: Math.round(document.documentElement.scrollTop),
      bodyScrollTop: Math.round(document.body.scrollTop),
      scrollingElement: document.scrollingElement?.tagName ?? 'none',
      innerHeight: window.innerHeight,
      bodyScrollHeight: document.body.scrollHeight,
      docScrollHeight: document.documentElement.scrollHeight,
      total,
      armed,
      revealed,
    };
  });
  console.log(`${label}: ${JSON.stringify(state)}`);
  return state;
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  let scrollEvents = 0;
  await page.exposeFunction('reportScroll', () => {
    scrollEvents += 1;
  });
  await page.addInitScript(() => {
    window.addEventListener('scroll', () => {
      window.reportScroll?.();
    });
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await snapshot(page, 'after load        ');

  // 1. Programmatic scroll.
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(400);
  await snapshot(page, 'window.scrollTo    ');
  console.log(`    scroll events observed: ${scrollEvents}`);

  // 2. Real wheel input.
  scrollEvents = 0;
  await page.mouse.move(640, 500);
  for (let i = 0; i < 12; i += 1) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(600);
  await snapshot(page, 'mouse.wheel        ');
  console.log(`    scroll events observed: ${scrollEvents}`);

  // 3. Keyboard, which is how a keyboard user gets down the page.
  scrollEvents = 0;
  await page.keyboard.press('End');
  await page.waitForTimeout(800);
  await snapshot(page, 'keyboard End       ');
  console.log(`    scroll events observed: ${scrollEvents}`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
