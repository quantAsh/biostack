import React, { useMemo } from 'react';
import { marked } from 'marked';
import { parseFrontMatter, sortPosts } from '../../utils/blog';

interface BlogPostMeta {
  slug: string;
  title: string;
  subtitle?: string;
  published?: string;
  updated?: string;
  author?: string;
  description?: string;
  keywords?: string[];
  body: string;
}

// Vite glob import for markdown content
// Each file exports raw string; frontmatter is simple YAML-like header which we'll parse manually
// Updated Vite glob syntax: use query + import
const postFiles = import.meta.glob('../../content/blog/*.md?raw', { eager: true, import: 'default' });

const posts: BlogPostMeta[] = sortPosts(
  (Object.entries(postFiles)
    .map(([path, raw]) => parseFrontMatter(raw as string))
    .filter(Boolean) as BlogPostMeta[])
);

const BlogPage: React.FC = () => {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const slug = window.location.pathname.startsWith('/blog/') ? window.location.pathname.replace('/blog/', '') : searchParams.get('p');

  const post = posts.find(p => p.slug === slug);

  if (post) {
    const html = marked.parse(post.body);
    document.title = `${post.title} — Biostack Blog`;
    const metaDesc = post.description || post.subtitle || '';
    const metaEl = document.querySelector('meta[name="description"]');
    if (metaDesc && metaEl) metaEl.setAttribute('content', metaDesc);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 font-sans">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <a href="/blog" className="text-cyan-400 text-sm font-medium hover:text-cyan-300">← All posts</a>
          <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">{post.title}</h1>
          {post.subtitle && <p className="mt-2 text-gray-300 text-lg">{post.subtitle}</p>}
          <div className="mt-4 text-xs text-gray-500">
            {post.published && <span>Published {post.published}</span>} {post.updated && post.updated !== post.published && <span className="ml-2">• Updated {post.updated}</span>}
          </div>
          <article className="prose prose-invert max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight gradient-text">Biostack Blog</h1>
        <p className="mt-4 text-gray-400 max-w-2xl">Deep dives on adaptive protocol engineering, biofeedback intelligence, and performance system design.</p>
        <div className="grid gap-8 mt-12 md:grid-cols-2">
          {posts.map(p => (
            <a key={p.slug} href={`/blog/${p.slug}`} className="group block rounded-xl border border-gray-800/70 hover:border-cyan-600/40 bg-gray-900/40 p-6 backdrop-blur-md transition-colors">
              <h2 className="text-xl font-semibold text-gray-100 group-hover:text-white tracking-tight">{p.title}</h2>
              {p.subtitle && <p className="mt-2 text-gray-400 text-sm leading-relaxed line-clamp-3">{p.subtitle}</p>}
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                {p.published && <span>{p.published}</span>}
                {p.keywords && p.keywords.slice(0,3).map(k => <span key={k} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded-full">{k}</span>)}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
