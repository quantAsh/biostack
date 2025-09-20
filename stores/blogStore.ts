import { create } from 'zustand';
import { BlogPost } from '../types';
import { db, isFirebaseEnabled } from '../services/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import toast from 'react-hot-toast';
import { log } from './logStore';
import { loadMarkdownBlogSeeds } from '../utils/blogSeeds';

interface BlogState {
  blogPosts: BlogPost[];
  initBlogRealtime: () => void;
  destroyBlogRealtime: () => void;
  createBlogPost: (data: Partial<BlogPost> & { slug?: string }) => void;
  updateBlogPost: (id: string, data: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  publishBlogPost: (id: string) => void;
}

let blogUnsubscribe: (() => void) | null = null;

export const useBlogStore = create<BlogState>((set, get) => ({
  blogPosts: [],
  initBlogRealtime: () => {
    if (!isFirebaseEnabled) return;
    if (blogUnsubscribe) return;
    try {
      blogUnsubscribe = db.collection('blog_posts').onSnapshot((snap: any) => {
        const firestorePosts: BlogPost[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data(), source: 'firestore' }));
        const seeds = loadMarkdownBlogSeeds();
        const bySlug = new Map<string, BlogPost>();
        seeds.forEach(p => bySlug.set(p.slug, p));
        firestorePosts.forEach(p => { if (p.slug) bySlug.set(p.slug, p); });
        const merged = Array.from(bySlug.values()).sort((a, b) => {
          const aPub = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const bPub = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return bPub - aPub;
        });
        set({ blogPosts: merged });
        if (import.meta.env?.DEV) {
          if ((window as any).__feedRegenTimer) clearTimeout((window as any).__feedRegenTimer);
          (window as any).__feedRegenTimer = setTimeout(() => { fetch('/__regenerate_feeds', { method: 'POST' }).catch(()=>{}); }, 750);
        }
      }, (err: any) => {
        log('ERROR', 'blogStore.initBlogRealtime snapshot error', { err });
      });
      log('INFO', 'blogStore: realtime subscription established');
    } catch (e) {
      log('ERROR', 'blogStore.initBlogRealtime subscribe failed', { e });
    }
  },
  destroyBlogRealtime: () => {
    if (blogUnsubscribe) { try { blogUnsubscribe(); } catch {} blogUnsubscribe = null; log('INFO','blogStore: unsubscribed'); }
  },
  createBlogPost: (data) => {
    const id = `post_${Date.now()}`;
    const slugSource = data.slug || data.title || id;
    const slug = (slugSource || id).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const now = new Date();
    const newPost: BlogPost = { id, slug, publishedAt: data.isDraft ? undefined : now, updatedAt: now, ...data } as any;
    set(state => ({ blogPosts: [...(state.blogPosts||[]), newPost] }));
    if (isFirebaseEnabled) {
      db.collection('blog_posts').doc(id).set({ ...newPost, publishedAt: newPost.publishedAt || null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .then(()=> toast.success('Blog post created'))
        .catch(err => { toast.error('Create failed'); log('ERROR','blogStore.createBlogPost write failed',{err}); });
    } else {
      toast.success('Blog post created');
    }
  },
  updateBlogPost: (id, data) => {
    set(state => ({ blogPosts: (state.blogPosts||[]).map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p) }));
    if (isFirebaseEnabled) {
      db.collection('blog_posts').doc(id).update({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .then(()=> toast.success('Blog post updated'))
        .catch(err => { toast.error('Update failed'); log('ERROR','blogStore.updateBlogPost failed',{err}); });
    } else {
      toast.success('Blog post updated');
    }
  },
  deleteBlogPost: (id) => {
    const post = get().blogPosts?.find(p => p.id === id);
    if ((post as any)?.source === 'markdown') { toast.error('Markdown seed posts are read-only'); return; }
    set(state => ({ blogPosts: (state.blogPosts||[]).filter(p => p.id !== id) }));
    if (isFirebaseEnabled) {
      db.collection('blog_posts').doc(id).delete()
        .then(()=> toast.success('Blog post deleted'))
        .catch(err => { toast.error('Delete failed'); log('ERROR','blogStore.deleteBlogPost failed',{err}); });
    } else {
      toast.success('Blog post deleted');
    }
  },
  publishBlogPost: (id) => {
    const now = new Date();
    set(state => ({ blogPosts: (state.blogPosts||[]).map(p => p.id === id ? { ...p, isDraft: false, publishedAt: p.publishedAt || now, updatedAt: now } : p) }));
    if (isFirebaseEnabled) {
      db.collection('blog_posts').doc(id).update({ isDraft: false, publishedAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .then(()=> toast.success('Blog post published'))
        .catch(err => { toast.error('Publish failed'); log('ERROR','blogStore.publishBlogPost failed',{err}); });
    } else {
      toast.success('Blog post published');
    }
  },
}));

export default useBlogStore;
