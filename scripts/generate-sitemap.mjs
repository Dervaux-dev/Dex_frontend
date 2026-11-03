import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const SITE_URL = (process.env.SITE_URL || 'https://dexelearning.vercel.app').replace(/\/+$/, '');
const API_BASE_URL = (
  process.env.VITE_API_BASE_URL || 'https://dex-backend-14kj.onrender.com/api'
).replace(/\/+$/, '');

const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.00' },
  { path: '/courses', changefreq: 'weekly', priority: '0.90' },
  { path: '/register', changefreq: 'monthly', priority: '0.60' },
  { path: '/login', changefreq: 'monthly', priority: '0.50' },
];

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function fetchCourses() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_BASE_URL}/courses?limit=1000`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const courses = payload?.data?.courses;
    return Array.isArray(courses) ? courses : [];
  } catch (error) {
    console.warn(`Sitemap: could not load courses (${error.message}). Writing static routes only.`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function buildXml(courseRoutes) {
  const urlEntry = ({ loc, lastmod, changefreq, priority }) => {
    const parts = [`    <loc>${escapeXml(loc)}</loc>`];
    if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
    if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
    if (priority) parts.push(`    <priority>${priority}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
  };

  const entries = [
    ...staticRoutes.map((route) =>
      urlEntry({ loc: `${SITE_URL}${route.path}`, lastmod: today, ...route })
    ),
    ...courseRoutes.map((course) =>
      urlEntry({
        loc: `${SITE_URL}/courses/${encodeURIComponent(course._id)}`,
        lastmod: (course.updatedAt || course.createdAt || today).toString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.70',
      })
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

async function main() {
  const courses = await fetchCourses();
  const uniqueCourses = new Map();
  for (const course of courses) {
    if (course?._id) uniqueCourses.set(String(course._id), course);
  }

  const xml = buildXml([...uniqueCourses.values()]);
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`Sitemap written with ${staticRoutes.length + uniqueCourses.size} URLs.`);
}

main().catch((error) => {
  console.error('Sitemap generation failed:', error.message);
  const xml = buildXml([]);
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
});
