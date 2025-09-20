// Simple Node runtime server providing dynamic sitemap.xml and rss.xml
// Uses native http to avoid extra dependencies.
import { createServer } from 'http';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const PORT = process.env.PORT || 5174;

function parseFrontMatter(raw) {
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fm) return null;
  const [, header, body] = fm;
  const meta = { body: body.trim() };
  header.split('\n').forEach(line => {
    const t = line.trim();
    if (!t) return;
    const [k, ...rest] = t.split(':');
    const v = rest.join(':').trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      meta[k.trim()] = v.slice(1,-1).split(',').map(s=>s.trim().replace(/^['\"]|['\"]$/g,''));
    } else {
      meta[k.trim()] = v.replace(/^['\"]|['\"]$/g,'');
    }
  });
  if (!meta.slug && meta.title) meta.slug = meta.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  return meta;
}

function loadPosts() {
  const dir = join(process.cwd(), 'content', 'blog');
  let files = [];
  try { files = readdirSync(dir).filter(f=>f.endsWith('.md')); } catch { return []; }
  return files.map(f => {
    const raw = readFileSync(join(dir, f), 'utf8');
    return parseFrontMatter(raw);
  }).filter(Boolean);
}

function buildSitemap(origin) {
  const posts = loadPosts();
  const urls = [ '/', '/blog', ...posts.map(p => `/blog/${p.slug}`) ];
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${origin}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u==='/'? '1.0':'0.6'}</priority></url>`).join('\n')}\n</urlset>`;
}

function escapeXml(s='') { return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function buildRss(origin) {
  const posts = loadPosts();
  const items = posts.map(p => `<item><title>${escapeXml(p.title)}</title><link>${origin}/blog/${p.slug}</link><guid>${origin}/blog/${p.slug}</guid><description>${escapeXml(p.description||p.subtitle||'')}</description><pubDate>${new Date(p.published || Date.now()).toUTCString()}</pubDate></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Biostack Blog</title><link>${origin}/blog</link><description>Adaptive protocol engineering & performance intelligence.</description>${items}</channel></rss>`;
}

const server = createServer((req, res) => {
  const origin = process.env.PUBLIC_ORIGIN || `http://localhost:${PORT}`;
  if (req.url === '/sitemap.xml') {
    const xml = buildSitemap(origin);
    res.writeHead(200, { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=300' });
    return res.end(xml);
  }
  if (req.url === '/rss.xml' || req.url === '/feed.xml') {
    const xml = buildRss(origin);
    res.writeHead(200, { 'Content-Type': 'application/rss+xml', 'Cache-Control': 'public, max-age=300' });
    return res.end(xml);
  }
  // Fallback: delegate to Vite dev server (assumes separate process) or show basic message.
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Auxiliary server active: /sitemap.xml /rss.xml');
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => console.log(`[sitemap-server] listening on :${PORT}`));
}

export default server;
