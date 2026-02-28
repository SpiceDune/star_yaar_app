import type { APIRoute } from 'astro';

const IS_VERCEL = !!process.env.VERCEL;

async function launchBrowser() {
  if (IS_VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = await import('puppeteer-core');
    return puppeteer.default.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const puppeteer = await import('puppeteer');
  const executablePath = await findLocalChrome();
  return puppeteer.default.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
}

async function findLocalChrome(): Promise<string | undefined> {
  const { access } = await import('node:fs/promises');
  const { homedir } = await import('node:os');
  const { join } = await import('node:path');

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    join(homedir(), '.cache/puppeteer/chrome/mac_arm-145.0.7632.77/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
  ];

  for (const p of candidates) {
    try {
      await access(p);
      return p;
    } catch { /* try next */ }
  }
  return undefined;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    const cookies = request.headers.get('cookie') ?? '';
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const origin = forwardedHost
      ? `${proto}://${forwardedHost}`
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin);

    if (cookies) {
      const cookiePairs = cookies.split(';').map(c => c.trim()).filter(Boolean);
      const puppeteerCookies = cookiePairs.map(pair => {
        const eqIdx = pair.indexOf('=');
        return {
          name: pair.substring(0, eqIdx),
          value: pair.substring(eqIdx + 1),
          domain: new URL(origin).hostname,
          path: '/',
        };
      });
      await page.setCookie(...puppeteerCookies);
    }

    const sections = new URL(request.url).searchParams.get('sections') ?? '';
    const reportUrl = new URL(`${origin}/kundli/report`);
    if (sections) reportUrl.searchParams.set('sections', sections);

    await page.goto(reportUrl.toString(), {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
      printBackground: true,
    });

    await browser.close();

    const nameParam = new URL(request.url).searchParams.get('name') ?? 'StarYaar';
    const safeName = nameParam.replace(/[^a-zA-Z0-9_-]/g, '_');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}_Kundli_Report.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[report-pdf] PDF generation failed:', err);
    return new Response(
      JSON.stringify({ error: 'PDF generation failed', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
