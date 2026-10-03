/**
 * Generates `public/llms-full.txt` — the whole page as Markdown.
 *
 * The `/llms.txt` convention has two halves: a short curated index at
 * `llms.txt`, and an optional `llms-full.txt` holding the actual content for an
 * agent that wants to read rather than to be pointed. This writes the second
 * one.
 *
 * It reads the **rendered** page from a served build, which is the whole reason
 * the file exists: this site is client-rendered, so the HTML on disk is a shell
 * and the words only exist once a browser has run the application. Whatever
 * executes that JavaScript — a person, Googlebot, or this script — gets the same
 * text, and an agent that executes none of it gets `llms-full.txt` instead.
 *
 *   python tools/serve-app.py dist/deepwork-site/browser 5200
 *   npm run llms
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const { startServer } = require('./static-server.cjs');

const DIST = path.join(__dirname, '..', 'dist', 'deepwork-site', 'browser');
const PORT = Number(process.env['PORT'] || 5200);
const OUT = path.join(__dirname, '..', 'public', 'llms-full.txt');
const SITE_URL = 'https://deepwork-pomodoro.netlify.app/';

/** Set when an already-running server should be used instead of starting one. */
const EXTERNAL_URL = process.env['SITE_URL'];

/**
 * Runs in the page. Walks `main` in document order and emits Markdown.
 *
 * The first version of this walked every heading, paragraph and list item and
 * printed whatever it found, which produced a file that read well at a glance
 * and was quietly missing content: a card is `<li><span icon/><h3/><p/></li>`,
 * and because the list item was printed as a bullet the paragraph inside it was
 * skipped as a duplicate — so every card's body text was dropped. The result
 * looked like a clean summary rather than like a bug, which is the worst kind.
 *
 * These are the rules that fixed it, and the audit asserts them:
 *
 * - A list item that **contains** blocks is not printed; its blocks are. A list
 *   item that contains only inline content is printed as a bullet, because that
 *   is what it is.
 * - Adjacent inline elements are joined with a space. `<span>A</span><span>B</span>`
 *   is two things, not the word "AB".
 * - Text is read from the nodes rather than from `innerText`, so the uppercase
 *   eyebrow labels are not shouted into the file by `text-transform`, and a
 *   `<br>` becomes a space instead of gluing two sentences together.
 * - Decorative glyphs at the start of a label are stripped; a tick is not text.
 */
function extract() {
  const INLINE = /^(A|B|STRONG|EM|I|CODE|SPAN|SMALL|CITE|TIME|ABBR|MARK|SUP|SUB)$/;
  const BLOCKS = 'li, p, blockquote, h1, h2, h3, h4, h5, figcaption, .caption';
  const DECORATION = /^[\s✓✗•·→←◇◈◷◫⌘⛁⌀⇅⇪＋+↻⇄⇩◎⚑⚡★☆🔥]*(?=[A-Za-z0-9])/u;

  const normalise = (value) => (value ?? '').replace(/\s+/g, ' ').trim();

  /**
   * The visible text of a node, with element boundaries and `<br>` treated as
   * spaces.
   *
   * `textContent` alone is not enough: a headline written as
   * `A timer counts down.<br /><span>DeepWork keeps the whole day.</span>` reads
   * back as "countdown.DeepWork", and `<span>A</span><span>B</span>` as "AB".
   * Neither is a word, and both survived into the first published version of
   * this file.
   */
  function readText(node) {
    let out = '';

    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.textContent ?? '';
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const name = child.tagName;
      if (name === 'BR') {
        out += ' ';
        continue;
      }
      if (name === 'SCRIPT' || name === 'STYLE') continue;

      out += `${readText(child)} `;
    }

    return normalise(out);
  }

  /** Text of an element's own inline content, with inline siblings spaced apart. */
  function ownText(element) {
    const parts = [];
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push(node.textContent ?? '');
      } else if (node.nodeType === Node.ELEMENT_NODE && INLINE.test(node.tagName)) {
        parts.push(node.textContent ?? '');
      }
    }
    return normalise(parts.join(' '));
  }

  const main = document.querySelector('main');
  if (!main) return '';

  const out = [];
  const nodes = Array.from(
    main.querySelectorAll('h1, h2, h3, h4, h5, p, li, summary, blockquote, figcaption, .caption'),
  );

  for (const element of nodes) {
    // Decorative and screen-reader-only nodes are not content.
    if (element.closest('.sr-only, [aria-hidden="true"]')) continue;

    const tag = element.tagName.toLowerCase();

    // A list item wrapping blocks is a container, not an item. Its own inline
    // text is kept only if it is a real label rather than a glyph.
    if (tag === 'li' && element.querySelector(BLOCKS)) {
      const label = ownText(element).replace(DECORATION, '');
      if (label.length > 2) out.push(`- ${label}`);
      continue;
    }

    if (tag === 'li') {
      const text = (ownText(element) || readText(element)).replace(DECORATION, '');
      if (text) out.push(`- ${text}`);
      continue;
    }

    const text = readText(element);
    if (!text) continue;

    if (/^h[1-5]$/.test(tag)) {
      const level = Math.min(6, Number(tag[1]) + 1); // `main`'s h1 becomes the document body
      out.push(`\n${'#'.repeat(level)} ${text}\n`);
      continue;
    }

    if (tag === 'summary') {
      out.push(`\n**${text}**`);
      continue;
    }

    if (tag === 'blockquote') {
      out.push(`\n> ${text}`);
      continue;
    }

    out.push(`\n${text}`);
  }

  // Collapse runs of blank lines without touching anything else.
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');
}

async function main() {
  let base = EXTERNAL_URL;
  let server = null;
  if (!base) {
    server = await startServer({ root: DIST, port: PORT });
    base = server.url;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);

  // Scroll the page so everything has rendered, then come back to the top.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const body = await page.evaluate(extract);
  await browser.close();
  if (server) await server.close();

  // Content checks rather than a length check: a length can be met by a file
  // that is missing exactly the parts a reader needs, which is what happened the
  // first time this ran.
  const required = ['its colour is its status', 'Your queued tasks become focus blocks'];
  const missing = required.filter((phrase) => !body.includes(phrase));
  if (missing.length > 0) {
    console.error(
      `the extracted page is missing expected content: ${missing.join(' | ')} — ` +
        `refusing to write a file that looks complete but is not`,
    );
    process.exit(1);
  }

  const header = [
    '# DeepWork — full page',
    '',
    `> Source: ${SITE_URL}`,
    '> This is the complete content of the DeepWork product site, converted to Markdown from the',
    '> rendered page. A shorter, curated index is at /llms.txt.',
    '',
    '---',
    '',
  ].join('\n');

  const footer = [
    '',
    '---',
    '',
    '## About this file',
    '',
    'Generated from the rendered page by `tools/make-llms-txt.cjs`. Every statement in it is taken',
    'from the DeepWork application repository at version 2.0.17; nothing is invented, and there are',
    'no user counts, download figures, ratings or testimonials because the project publishes none.',
    '',
    '- Source code: https://github.com/malikrajat/deepwork',
    '- Downloads: https://github.com/malikrajat/deepwork/releases/latest',
    '- Web app: https://malikrajat.github.io/deepwork/',
    '',
  ].join('\n');

  fs.writeFileSync(OUT, `${header}${body}\n${footer}`, 'utf8');
  const { size } = fs.statSync(OUT);
  console.log(`llms-full.txt  ${Math.round(size / 1024)} kB  (${body.length} characters of page)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
