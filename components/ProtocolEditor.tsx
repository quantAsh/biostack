import React, { useState, useMemo, useEffect } from 'react';
import { useDataStore } from '../stores/dataStore';
import ProtocolCard from './ProtocolCard';
import { Protocol, Theme, Category, Difficulty } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProtocolEditorProps {
    protocol: Protocol;
    onClose: () => void;
}

const ProtocolEditor: React.FC<ProtocolEditorProps> = ({ protocol, onClose }) => {
    const queryClient = useQueryClient();
    const { updateProtocol, deleteProtocol } = useDataStore();
    
    // We need to handle array-to-string conversion for textareas
    const protocolToStrings = (p: Protocol) => ({
        ...p,
        benefits: p.benefits.join('\n'),
        instructions: p.instructions.join('\n'),
    });
    
    const stringsToProtocol = (p: any): Partial<Protocol> => ({
        ...p,
        benefits: p.benefits.split('\n').filter((b:string) => b.trim() !== ''),
        instructions: p.instructions.split('\n').filter((i:string) => i.trim() !== ''),
    });

    const [formData, setFormData] = useState(protocolToStrings(protocol));

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Protocol> & { id: string }) => updateProtocol(data),
        onSuccess: () => {
            toast.success('Protocol updated successfully!');
            queryClient.invalidateQueries();
            onClose();
        },
        onError: () => toast.error('Failed to update protocol.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProtocol(id),
        onSuccess: () => {
            toast.success('Protocol deleted.');
            queryClient.invalidateQueries();
            onClose();
        },
        onError: () => toast.error('Failed to delete protocol.'),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const val = isCheckbox ? e.target.checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };
    
    const handleCategoryChange = (category: Category) => {
        setFormData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleSave = () => {
        const payload = { ...stringsToProtocol(formData), id: protocol.id };
        updateMutation.mutate(payload);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to permanently delete "${protocol.name}"?`)) {
            deleteMutation.mutate(protocol.id);
        }
    };
    
    const previewProtocol: Protocol = useMemo(() => {
        return {
            ...protocol,
            ...stringsToProtocol(formData),
        } as Protocol;
    }, [formData, protocol]);
    
    const isMutating = updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl w-full max-w-7xl h-[90vh] text-white flex flex-col">
                <header className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="font-title text-2xl font-bold text-yellow-300">Protocol & Card Editor</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
                </header>

                <div className="flex-grow flex overflow-hidden">
                    {/* Left: Form Panel */}
                    <div className="w-2/3 p-6 overflow-y-auto custom-scrollbar space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2"><label className="font-bold">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                        </div>
                        <div><label className="font-bold">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                        <div>
                            <label className="font-bold block mb-2">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(Category).map(cat => (
                                    <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-2 py-1 text-xs rounded-full border ${formData.categories.includes(cat) ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 border-gray-600'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className="font-bold">Difficulty</label><select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm">{Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                           <div><label className="font-bold">Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                           <div><label className="font-bold">Creator</label><input type="text" name="creator" value={formData.creator} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                           <div><label className="font-bold">Image URL (for Digital Human theme)</label><input type="url" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div><label className="font-bold">Benefits (one per line)</label><textarea name="benefits" value={formData.benefits} onChange={handleInputChange} rows={5} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                            <div><label className="font-bold">Instructions (one per line)</label><textarea name="instructions" value={formData.instructions} onChange={handleInputChange} rows={5} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                         </div>
                        <div><label className="font-bold">Origin Story</label><textarea name="originStory" value={formData.originStory} onChange={handleInputChange} rows={4} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                        <div><label className="font-bold">Community Tip</label><input type="text" name="communityTip" value={formData.communityTip || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                        
                        <div className="border-t border-gray-700 pt-4 space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-yellow-300">Card Behavior</h3>
                                <div className="flex items-center gap-8 mt-2">
                                     <div><label className="font-bold">Theme</label><select name="theme" value={formData.theme} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm">{['classic', 'aura', 'digital-human'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                    <div className="flex items-center gap-2"><input type="checkbox" name="hasGuidedSession" id="hasGuidedSession" checked={formData.hasGuidedSession} onChange={handleInputChange} /><label htmlFor="hasGuidedSession">Has Guided Session</label></div>
                                    <div className="flex items-center gap-2"><input type="checkbox" name="isSpecialEdition" id="isSpecialEdition" checked={formData.isSpecialEdition} onChange={handleInputChange} /><label htmlFor="isSpecialEdition" className="text-yellow-300 font-semibold">Is Special Edition</label></div>
                                </div>
                            </div>
                             {formData.isSpecialEdition && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                    <div><label className="font-bold">Influencer Image URL</label><input type="url" name="influencerImage" value={formData.influencerImage || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                                    <div><label className="font-bold">Influencer Signature URL</label><input type="url" name="influencerSignature" value={formData.influencerSignature || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm" /></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Preview Panel */}
                    <div className="w-1/3 bg-black/30 p-6 flex flex-col items-center justify-center">
                        <h3 className="font-title text-xl font-bold mb-4 text-gray-400">Live Preview</h3>
                        <div className="w-full max-w-sm">
                            <ProtocolCard protocol={previewProtocol} />
                        </div>
                         <div className="mt-8 w-full max-w-sm space-y-3">
                            <button onClick={handleSave} disabled={isMutating} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 disabled:bg-gray-600">
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                             <button onClick={handleDelete} disabled={isMutating} className="w-full bg-red-800/80 text-red-100 font-bold py-2 rounded-lg hover:bg-red-700/80 disabled:bg-gray-600 text-sm">
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Protocol'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtocolEditor;