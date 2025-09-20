import React, { useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import useBlogStore from '../stores/blogStore';
import { BlogPost } from '../types';

const emptyDraft: Partial<BlogPost> = { title: '', body: '', description: '', keywords: [], author: 'Admin', isDraft: true };

const BlogAdminPanel: React.FC = () => {
  const { blogPosts, createBlogPost, updateBlogPost, deleteBlogPost, publishBlogPost } = useBlogStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<BlogPost>>(emptyDraft);
  const [showEditor, setShowEditor] = useState(false);

  const startNew = () => { setDraft(emptyDraft); setEditingId(null); setShowEditor(true); };
  const startEdit = (p: BlogPost) => { setEditingId(p.id); setDraft(p); setShowEditor(true); };

  const save = () => {
    if (!draft.title || !draft.body) return;
    if (editingId) {
      updateBlogPost(editingId, { ...draft } as any);
    } else {
      createBlogPost(draft as any);
    }
    setShowEditor(false);
  };

  return (
    <div className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-white">Blog Posts ({blogPosts.length})</h4>
        <button onClick={startNew} className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-md hover:bg-blue-500">New Post</button>
      </div>
      <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gray-800/60">
        {blogPosts.map(p => {
          const isMarkdown = (p as any).source === 'markdown';
          return (
            <div key={p.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{p.title} {p.isDraft && <span className="text-xs ml-2 px-2 py-0.5 bg-yellow-800/40 text-yellow-300 rounded-full">Draft</span>} {isMarkdown && <span className="text-xs ml-2 px-2 py-0.5 bg-gray-700/60 text-gray-300 rounded-full">Seed</span>}</p>
                <p className="text-xs text-gray-400 line-clamp-2 max-w-md">{p.description}</p>
                <p className="text-[10px] text-gray-500 mt-1">/{p.slug}</p>
              </div>
              <div className="flex gap-2">
                {!isMarkdown && p.isDraft && <button onClick={() => publishBlogPost(p.id)} className="text-green-400 text-xs hover:underline">Publish</button>}
                {!isMarkdown && <button onClick={() => startEdit(p)} className="text-blue-400 text-xs hover:underline">Edit</button>}
                {!isMarkdown && <button onClick={() => deleteBlogPost(p.id)} className="text-red-400 text-xs hover:underline">Delete</button>}
                {isMarkdown && <span className="text-[10px] text-gray-500">read-only</span>}
              </div>
            </div>
          );
        })}
        {blogPosts.length === 0 && <p className="text-sm text-gray-500 py-6 text-center">No posts yet.</p>}
      </div>
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#12171d] w-full max-w-2xl p-6 rounded-xl border border-gray-700/50 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-white text-lg">{editingId ? 'Edit Post' : 'New Post'}</h5>
              <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="space-y-3">
              <input value={draft.title || ''} onChange={e=>setDraft(d=>({...d,title:e.target.value}))} placeholder="Title" className="w-full bg-gray-800/70 border border-gray-600 rounded-md px-3 py-2 text-sm" />
              <input value={draft.description || ''} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} placeholder="Description (meta)" className="w-full bg-gray-800/70 border border-gray-600 rounded-md px-3 py-2 text-sm" />
              <input value={(draft.keywords||[]).join(', ')} onChange={e=>setDraft(d=>({...d,keywords:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} placeholder="Keywords (comma separated)" className="w-full bg-gray-800/70 border border-gray-600 rounded-md px-3 py-2 text-sm" />
              <textarea value={draft.body || ''} onChange={e=>setDraft(d=>({...d,body:e.target.value}))} rows={12} placeholder="Markdown body..." className="w-full bg-gray-800/70 border border-gray-600 rounded-md px-3 py-2 text-sm font-mono" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input type="checkbox" checked={!!draft.isDraft} onChange={e=>setDraft(d=>({...d,isDraft:e.target.checked}))} /> Draft
                </label>
                <div className="flex gap-2">
                  {editingId && <button onClick={()=>publishBlogPost(editingId)} disabled={!draft.title || !draft.body} className="bg-green-600 disabled:bg-gray-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-green-500">Publish</button>}
                  <button onClick={save} disabled={!draft.title || !draft.body} className="bg-blue-600 disabled:bg-gray-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-500">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAdminPanel;
