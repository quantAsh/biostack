import React, { useState, useEffect } from 'react';
import { Protocol, CommunityStack } from '../types';
import { useDataStore } from '../stores/dataStore';
import toast from 'react-hot-toast';

interface SeoEditorModalProps {
    item: Protocol | CommunityStack;
    type: 'protocol' | 'stack';
    onClose: () => void;
}

const SeoEditorModal: React.FC<SeoEditorModalProps> = ({ item, type, onClose }) => {
    const { updateContentSeo } = useDataStore();
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');

    useEffect(() => {
        setMetaTitle(item.metaTitle || item.name);
        setMetaDescription(item.metaDescription || item.description);
        setSlug(item.slug || item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }, [item]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateContentSeo(type, item.id, { metaTitle, metaDescription, slug });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="font-title text-2xl font-bold text-purple-300 mb-4">Edit SEO Metadata</h2>
                <p className="text-sm text-gray-400 mb-2">Editing for: <span className="font-semibold text-white">{item.name}</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="meta-title" className="block text-sm font-medium text-gray-300 mb-1">Meta Title</label>
                        <input id="meta-title" type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" />
                        <p className="text-xs text-gray-500 mt-1">{metaTitle.length} / 60 characters</p>
                    </div>
                    <div>
                        <label htmlFor="meta-description" className="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
                        <textarea id="meta-description" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" />
                         <p className="text-xs text-gray-500 mt-1">{metaDescription.length} / 160 characters</p>
                    </div>
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">URL Slug</label>
                        <input id="slug" type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" />
                    </div>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-purple-500 rounded-lg hover:bg-purple-400">Save SEO Data</button>
                    </div>
                </form>

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default SeoEditorModal;
