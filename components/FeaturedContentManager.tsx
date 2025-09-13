import React, { useState, useEffect } from 'react';
import { useDataStore } from '../stores/dataStore';
import { Protocol, CommunityStack, Journey, FeaturedContent } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const FeaturedContentManager: React.FC = () => {
    const queryClient = useQueryClient();
    const {
        protocols: allProtocols,
        communityStacks: allStacks,
        journeys: allJourneys,
        featuredContent,
        updateFeaturedContent
    } = useDataStore();

    const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
    const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
    const [selectedJourneys, setSelectedJourneys] = useState<string[]>([]);
    
    useEffect(() => {
        if (featuredContent) {
            setSelectedProtocols(featuredContent.protocolIds || []);
            setSelectedStacks(featuredContent.stackIds || []);
            setSelectedJourneys(featuredContent.journeyIds || []);
        }
    }, [featuredContent]);

    const mutation = useMutation({
        mutationFn: (newContent: FeaturedContent) => updateFeaturedContent(newContent),
        onSuccess: () => {
            toast.success('Featured content updated!');
            queryClient.invalidateQueries({ queryKey: ['data'] }); // A broad key, adjust if needed
        },
        onError: () => toast.error('Failed to update featured content.'),
    });

    const handleSave = () => {
        const newContent: FeaturedContent = {
            protocolIds: selectedProtocols,
            stackIds: selectedStacks,
            journeyIds: selectedJourneys,
        };
        mutation.mutate(newContent);
    };

    const toggleSelection = (id: string, type: 'protocol' | 'stack' | 'journey') => {
        switch (type) {
            case 'protocol':
                setSelectedProtocols(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
                break;
            case 'stack':
                setSelectedStacks(prev => prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]);
                break;
            case 'journey':
                setSelectedJourneys(prev => prev.includes(id) ? prev.filter(jId => jId !== id) : [...prev, id]);
                break;
        }
    };
    
    const ItemList: React.FC<{
        title: string;
        items: (Protocol | CommunityStack | Journey)[];
        selectedIds: string[];
        type: 'protocol' | 'stack' | 'journey';
    }> = ({ title, items, selectedIds, type }) => (
        <div>
            <h5 className="font-semibold text-gray-300 text-sm mb-2">{title}</h5>
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 bg-gray-900/50 border border-gray-600 rounded-md space-y-1">
                {items.map(item => (
                    <div key={item.id} className="flex items-center">
                        <input
                            id={`${type}-${item.id}`}
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelection(item.id, type)}
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500"
                        />
                        <label htmlFor={`${type}-${item.id}`} className="ml-2 text-xs text-gray-200">
                            {item.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ItemList title="Protocols" items={allProtocols.filter(p => !p.isPersonalized)} selectedIds={selectedProtocols} type="protocol" />
                <ItemList title="Stacks" items={allStacks} selectedIds={selectedStacks} type="stack" />
                <ItemList title="Journeys" items={allJourneys} selectedIds={selectedJourneys} type="journey" />
            </div>
            <div className="mt-4 text-right">
                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-400 text-sm"
                >
                    {mutation.isPending ? 'Saving...' : 'Save Featured'}
                </button>
            </div>
        </div>
    );
};

export default FeaturedContentManager;