import { BlogPost } from '../types';
import { parseFrontMatter } from './blog';
import { log } from '../stores/logStore';

let __markdownBlogSeedCache: BlogPost[] | null = null;

export function clearBlogSeedCache() {
  __markdownBlogSeedCache = null;
}

export function loadMarkdownBlogSeeds(): BlogPost[] {
  if (__markdownBlogSeedCache) return __markdownBlogSeedCache;
  try {
    // @ts-ignore Vite specific API
    const rawFiles = (import.meta as any)?.glob ? (import.meta as any).glob('../content/blog/*.md?raw', { eager: true, import: 'default' }) : {};
    const seeds = Object.entries(rawFiles).map(([_, raw]: any) => parseFrontMatter(raw as string))
      .filter(Boolean)
      .map((m: any) => ({
        id: `md_${m.slug}`,
        slug: m.slug,
        title: m.title,
        subtitle: m.subtitle,
        description: m.description,
        body: m.body,
        keywords: m.keywords,
        author: m.author || 'Biostack',
        publishedAt: m.published ? new Date(m.published) : undefined,
        updatedAt: m.updated ? new Date(m.updated) : undefined,
        isDraft: false,
        metaTitle: m.metaTitle,
        metaDescription: m.metaDescription,
        source: 'markdown'
      } as BlogPost));
    __markdownBlogSeedCache = seeds as BlogPost[];
    return seeds as BlogPost[];
  } catch (e) {
    log('WARN', 'loadMarkdownBlogSeeds(module): failed.', { e });
    __markdownBlogSeedCache = [];
    return [];
  }
}
