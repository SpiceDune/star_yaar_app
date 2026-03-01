import type { APIRoute } from 'astro';
import { celebrities } from '../data/celebrities';

const SITE = 'https://staryaar.ai';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/kundli', priority: '0.9', changefreq: 'monthly' },
  { url: '/kundli/celebrity', priority: '0.8', changefreq: 'weekly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/contact', priority: '0.5', changefreq: 'monthly' },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    ...staticPages.map(p => `
    <url>
      <loc>${SITE}${p.url}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`),
    ...celebrities.map(c => `
    <url>
      <loc>${SITE}/kundli/celebrity/${c.slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
