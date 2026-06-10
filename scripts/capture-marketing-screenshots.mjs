import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'marketing');

const baseUrl = process.env.SCREENSHOT_URL
  || 'http://127.0.0.1:8080/site/index.html';

const demoUrl = process.env.DEMO_URL
  || 'http://127.0.0.1:8080/';

const shots = [
  {
    file: '01-hero-mobile.png',
    url: baseUrl,
    viewport: { width: 390, height: 844, deviceScaleFactor: 2 },
    selector: '.hero',
    padding: 0,
  },
  {
    file: '02-hero-desktop.png',
    url: baseUrl,
    viewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    selector: '.hero',
    padding: 0,
  },
  {
    file: '03-ofertas.png',
    url: baseUrl,
    viewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    selector: '#ofertas',
    padding: 16,
  },
  {
    file: '04-depoimentos.png',
    url: baseUrl,
    viewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    selector: '#depoimentos',
    padding: 16,
  },
  {
    file: '05-localizacao.png',
    url: baseUrl,
    viewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    selector: '#localizacao',
    padding: 16,
  },
  {
    file: '06-instagram.png',
    url: baseUrl,
    viewport: { width: 390, height: 844, deviceScaleFactor: 2 },
    selector: '#instagram',
    padding: 0,
  },
  {
    file: '07-demo-moldura.png',
    url: demoUrl,
    viewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  },
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error('Chrome/Chromium não encontrado. Defina CHROME_PATH.');
}

async function captureShot(page, shot) {
  await page.setViewport(shot.viewport);
  await page.goto(shot.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await new Promise((resolve) => setTimeout(resolve, 800));

  const filePath = path.join(outDir, shot.file);

  if (shot.selector) {
    const element = await page.$(shot.selector);
    if (!element) throw new Error(`Seletor não encontrado: ${shot.selector}`);
    await element.evaluate((node) => node.scrollIntoView({ block: 'start' }));
    await new Promise((resolve) => setTimeout(resolve, 400));
    await element.screenshot({
      path: filePath,
      type: 'png',
      ...(shot.padding ? { padding: shot.padding } : {}),
    });
    return;
  }

  if (shot.clip) {
    await page.screenshot({ path: filePath, type: 'png', clip: shot.clip });
    return;
  }

  await page.screenshot({ path: filePath, type: 'png', fullPage: Boolean(shot.fullPage) });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    for (const shot of shots) {
      process.stdout.write(`Capturando ${shot.file}…\n`);
      await captureShot(page, shot);
    }
  } finally {
    await browser.close();
  }

  process.stdout.write(`\nSalvo em ${outDir}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
