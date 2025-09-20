import { BlogPost } from '../types';

export interface BlogPostMeta extends Partial<BlogPost> {
  body: string;
}

export function parseFrontMatter(raw: string): BlogPostMeta | null {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return null;
  const [, header, body] = fmMatch;
  const meta: any = { body: body.trim() };
  header.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const [key, ...rest] = trimmed.split(':');
    if (!key) return;
    const valueRaw = rest.join(':').trim();
    if (valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      meta[key.trim()] = valueRaw.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      meta[key.trim()] = valueRaw.replace(/^['"]|['"]$/g, '');
    }
  });
  if (!meta.slug && meta.title) {
    meta.slug = meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  return meta as BlogPostMeta;
}

export function sortPosts<T extends { published?: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => (b.published || '').localeCompare(a.published || ''));
}
