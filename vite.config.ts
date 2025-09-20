import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

function blogFeedPlugin() {
  return {
    name: 'biostack-blog-feed',
    apply: 'serve' as const,
    configureServer(server: any) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        // Endpoint to regenerate feeds (used by realtime blog updates)
        if (req.method === 'POST' && req.url === '/__regenerate_feeds') {
          try {
            const origin = 'http://localhost:5173';
            const posts = loadMarkdownPosts();
            const urls = ['/', '/blog', ...posts.map(p => `/blog/${p.slug}`)];
            const now = new Date().toISOString();
            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${origin}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u==='/'? '1.0':'0.6'}</priority></url>`).join('\n')}\n</urlset>`;
            const esc = (s='') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]||c));
            const rssItems = posts.map(p => `<item><title>${esc(p.title||'')}</title><link>${origin}/blog/${p.slug}</link><guid>${origin}/blog/${p.slug}</guid><description>${esc(p.description||p.subtitle||'')}</description><pubDate>${new Date(p.published || Date.now()).toUTCString()}</pubDate></item>`).join('');
            // Cache in memory for optional reading (not strictly needed now)
            (server as any).__latestFeeds = { sitemap, rssItemsCount: posts.length };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, regenerated: true, posts: posts.length }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false }));
          }
          return;
        }
        if (req.url === '/sitemap.xml') {
          const origin = 'http://localhost:5173';
            const posts = loadMarkdownPosts();
            const urls = ['/', '/blog', ...posts.map(p => `/blog/${p.slug}`)];
            const now = new Date().toISOString();
            const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${origin}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u==='/'? '1.0':'0.6'}</priority></url>`).join('\n')}\n</urlset>`;
            res.setHeader('Content-Type', 'application/xml');
            res.end(xml);
            return;
        }
        if (req.url === '/rss.xml' || req.url === '/feed.xml') {
            const origin = 'http://localhost:5173';
            const posts = loadMarkdownPosts();
            const esc = (s='') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]||c));
            const items = posts.map(p => `<item><title>${esc(p.title||'')}</title><link>${origin}/blog/${p.slug}</link><guid>${origin}/blog/${p.slug}</guid><description>${esc(p.description||p.subtitle||'')}</description><pubDate>${new Date(p.published || Date.now()).toUTCString()}</pubDate></item>`).join('');
            const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Biostack Blog</title><link>${origin}/blog</link><description>Adaptive protocol engineering & performance intelligence.</description>${items}</channel></rss>`;
            res.setHeader('Content-Type', 'application/rss+xml');
            res.end(rss);
            return;
        }
        next();
      });
    }
  }
}

// Separate build plugin variant to emit static files into dist
function blogFeedBuildPlugin() {
  return {
    name: 'biostack-blog-feed-build',
    apply: 'build' as const,
    generateBundle() {
      const posts = loadMarkdownPosts();
      const origin = process.env.PUBLIC_ORIGIN || 'https://example.com';
      const urls = ['/', '/blog', ...posts.map(p => `/blog/${p.slug}`)];
      const now = new Date().toISOString();
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${origin}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u==='/'? '1.0':'0.6'}</priority></url>`).join('\n')}\n</urlset>`;
      const esc = (s='') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]||c));
      const items = posts.map(p => `<item><title>${esc(p.title||'')}</title><link>${origin}/blog/${p.slug}</link><guid>${origin}/blog/${p.slug}</guid><description>${esc(p.description||p.subtitle||'')}</description><pubDate>${new Date(p.published || Date.now()).toUTCString()}</pubDate></item>`).join('');
      const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Biostack Blog</title><link>${origin}/blog</link><description>Adaptive protocol engineering & performance intelligence.</description>${items}</channel></rss>`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: rss });
      this.emitFile({ type: 'asset', fileName: 'feed.xml', source: rss });
    }
  }
}

function loadMarkdownPosts() {
  const dir = path.resolve(__dirname, 'content', 'blog');
  let files: string[] = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.md')); } catch { return []; }
  return files.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null as any;
    const [, header, body] = match;
    const meta: any = { body: body.trim() };
    header.split('\n').forEach(line => {
      const t = line.trim(); if(!t) return; const [k,...r]=t.split(':'); const v=r.join(':').trim();
      if (v.startsWith('[') && v.endsWith(']')) meta[k.trim()] = v.slice(1,-1).split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,'')); else meta[k.trim()] = v.replace(/^['"]|['"]$/g,'');
    });
    if (!meta.slug && meta.title) meta.slug = meta.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    return meta;
  }).filter(Boolean);
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
  plugins: [blogFeedPlugin(), blogFeedBuildPlugin()],
  resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
