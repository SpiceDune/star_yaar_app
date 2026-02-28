import type { APIRoute } from 'astro';

async function findChromePath(): Promise<string | undefined> {
  const { access } = await import('node:fs/promises');
  const { homedir } = await import('node:os');
  const { join } = await import('node:path');
  const { execSync } = await import('node:child_process');

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    join(homedir(), '.cache/puppeteer/chrome/mac_arm-145.0.7632.77/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
  ];

  try {
    const raw = execSync('npx puppeteer browsers list 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
    const match = raw.match(/chrome@\S+ \(mac_arm\) (.+)/);
    if (match?.[1]) candidates.unshift(match[1].trim());
  } catch { /* ignore */ }

  for (const p of candidates) {
    try {
      await access(p);
      console.log('[report-pdf] Using Chrome at:', p);
      return p;
    } catch { /* try next */ }
  }
  return undefined;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const puppeteer = await import('puppeteer');

    const executablePath = await findChromePath();

    const browser = await puppeteer.default.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();

    const cookies = request.headers.get('cookie') ?? '';
    const origin = new URL(request.url).origin;

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
