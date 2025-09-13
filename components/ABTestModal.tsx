import React, { useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ABTest } from '../types';

interface ABTestModalProps {
    onClose: () => void;
}

const ABTestModal: React.FC<ABTestModalProps> = ({ onClose }) => {
    const { protocols, createABTest } = useDataStore();
    const [name, setName] = useState('');
    const [targetSegment, setTargetSegment] = useState<ABTest['targetSegment']>('inactive_7_days');
    const [conversionGoal, setConversionGoal] = useState('');
    const [variantA, setVariantA] = useState('');
    const [variantB, setVariantB] = useState('');

    const mutation = useMutation({
        mutationFn: (testData: Omit<ABTest, 'id' | 'status' | 'winner'>) => createABTest(testData),
        onSuccess: () => {
            onClose();
        },
        onError: (error: Error) => toast.error(`Error: ${error.message}`),
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !conversionGoal.trim() || !variantA || !variantB) {
            toast.error("Please fill out all fields.");
            return;
        }
        if (variantA === variantB) {
            toast.error("Variants A and B must be different protocols.");
            return;
        }
        
        const testData: Omit<ABTest, 'id' | 'status' | 'winner'> = {
            name,
            targetSegment,
            conversionGoal,
            variants: [
                { name: 'A', protocolId: variantA, results: { impressions: 0, conversions: 0 } },
                { name: 'B', protocolId: variantB, results: { impressions: 0, conversions: 0 } },
            ],
        };

        mutation.mutate(testData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="font-title text-2xl font-bold text-red-300 mb-4">Create New A/B Test</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Test Name*</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Target Segment*</label>
                            <select value={targetSegment} onChange={e => setTargetSegment(e.target.value as any)} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700">
                                <option value="inactive_7_days">Inactive (7+ days)</option>
                                <option value="new_users">New Users (First 3 days)</option>
                                <option value="all_users">All Users</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Conversion Goal*</label>
                            <input type="text" value={conversionGoal} onChange={e => setConversionGoal(e.target.value)} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" required />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium mb-2">Variants</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-blue-300">Variant A*</label>
                                <select value={variantA} onChange={e => setVariantA(e.target.value)} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700">
                                    <option value="">-- Select Protocol --</option>
                                    {protocols.filter(p => !p.isPersonalized).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-red-300">Variant B*</label>
                                <select value={variantB} onChange={e => setVariantB(e.target.value)} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700">
                                     <option value="">-- Select Protocol --</option>
                                     {protocols.filter(p => !p.isPersonalized).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="px-6 py-2 text-sm font-bold text-black bg-red-500 rounded-lg hover:bg-red-400 disabled:bg-gray-600">
                            {mutation.isPending ? 'Launching...' : 'Launch Test'}
                        </button>
                    </div>
                </form>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default ABTestModal;
