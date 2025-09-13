import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useDataStore } from '../stores/dataStore';
import { Protocol, Category, Difficulty } from '../types';

const SubmitProtocolModal: React.FC = () => {
  const closeSubmitModal = useUIStore(state => state.closeSubmitModal);
  const submitProtocol = useDataStore(state => state.submitProtocol);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: [] as Category[],
    difficulty: Difficulty.Beginner,
    duration: '',
    creator: '',
    benefits: '',
    instructions: '',
    originStory: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category: Category) => {
    setFormData(prev => {
        const newCategories = prev.categories.includes(category)
            ? prev.categories.filter(c => c !== category)
            : [...prev.categories, category];
        return { ...prev, categories: newCategories };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { benefits, instructions, ...rest } = formData;
    const protocolData: Omit<Protocol, 'id' | 'bioScore' | 'isCommunity' | 'submittedBy'> = {
        ...rest,
        benefits: benefits.split('\n').filter(b => b.trim()),
        instructions: instructions.split('\n').filter(i => i.trim()),
    };
    submitProtocol(protocolData);
    closeSubmitModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-teal-500/30 rounded-2xl w-full max-w-2xl text-white p-8 relative max-h-[90vh] flex flex-col">
        <h2 className="font-title text-3xl font-extrabold text-teal-300 mb-2">Submit a Protocol</h2>
        <p className="text-gray-400 mb-6">Contribute to the BiohackStack ecosystem. Please provide as much detail as possible.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar pr-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Protocol Name*</label>
                <input name="name" onChange={handleInputChange} value={formData.name} placeholder="e.g., '40Hz Light Therapy'" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description*</label>
                <textarea name="description" onChange={handleInputChange} value={formData.description} rows={2} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categories* (select 1-3)</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Category).map(cat => (
                        <button type="button" key={cat} onClick={() => handleCategoryChange(cat)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${formData.categories.includes(cat) ? 'bg-teal-400 text-black border-teal-400' : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'}`}>{cat}</button>
                    ))}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty*</label>
                    <select name="difficulty" onChange={handleInputChange} value={formData.difficulty} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" required>
                        {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duration*</label>
                    <input name="duration" onChange={handleInputChange} value={formData.duration} placeholder="e.g., '15 minutes'" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Creator / Source</label>
                <input name="creator" onChange={handleInputChange} value={formData.creator} placeholder="e.g., 'Dr. Andrew Huberman'" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Benefits (one per line)</label>
                <textarea name="benefits" onChange={handleInputChange} value={formData.benefits} rows={3} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Instructions (one per line)</label>
                <textarea name="instructions" onChange={handleInputChange} value={formData.instructions} rows={4} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Origin Story</label>
                <textarea name="originStory" onChange={handleInputChange} value={formData.originStory} rows={3} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm" />
            </div>
            <div className="flex justify-end gap-4 pt-4 mt-auto">
                <button type="button" onClick={closeSubmitModal} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-teal-500 rounded-lg hover:bg-teal-400">Submit Protocol</button>
            </div>
        </form>

        <button onClick={closeSubmitModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default SubmitProtocolModal;