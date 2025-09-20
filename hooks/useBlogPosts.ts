import useBlogStore from '../stores/blogStore';
import { BlogPost } from '../types';

export interface BlogPostsSplit {
  published: BlogPost[];
  drafts: BlogPost[];
  all: BlogPost[];
}

// Selector hook to retrieve published vs draft blog posts.
export function useBlogPostsSplit(): BlogPostsSplit {
  const blogPosts = useBlogStore(s => s.blogPosts) || [];
  const published = blogPosts.filter(p => !p.isDraft && p.publishedAt);
  const drafts = blogPosts.filter(p => p.isDraft || !p.publishedAt);
  return { published, drafts, all: blogPosts };
}
