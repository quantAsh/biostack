import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { runSimulation } from '../services/geminiService';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import MarkdownIt from 'markdown-it';
import { Protocol } from '../types';

const md = new MarkdownIt({ html: true });

const SimulationEngine: React.FC = () => {
    const [query, setQuery] = useState('');
    const { journalEntries, myStack, isDataProcessingAllowed } = useUserStore();
    const { protocols } = useDataStore();

    const simulationMutation = useMutation({
        mutationFn: (simulationQuery: string) => {
            const protocolsInStack = myStack.filter((p): p is Protocol => 'id' in p);
            return runSimulation(simulationQuery, journalEntries, protocolsInStack, protocols, isDataProcessingAllowed)
        },
    });
    
    const handleSimulate = () => {
        if (query.trim()) {
            simulationMutation.mutate(query);
        }
    };
    
    const isLoading = simulationMutation.isPending;
    const response = simulationMutation.data ? md.render(simulationMutation.data) : '';

    return (
        <div>
            <h3 className="font-title text-xl font-bold text-blue-300 mb-2">Kai's Simulation Engine</h3>
            <p className="text-gray-400 mb-4 text-sm max-w-xl">Ask Kai "what-if" questions to forecast the impact of new protocols or lifestyle changes based on your data.</p>
            
            <div className="space-y-4">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                    placeholder="e.g., What if I started doing a 10-minute cold plunge every morning?"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                    onClick={handleSimulate}
                    disabled={isLoading || !query.trim()}
                    className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center w-full"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <span className="flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 3.5a1.5 1.5 0 011.5 1.5v2.879a1.5 1.5 0 01-.363 1.011l-3.5 3.5a1.5 1.5 0 01-2.121-2.121l3.5-3.5A1.5 1.5 0 0110 5V3.5z" /><path d="M13.5 6.5a1.5 1.5 0 010 3v4.379a1.5 1.5 0 01-.363 1.011l-3.5 3.5a1.5 1.5 0 01-2.121-2.121l3.5-3.5A1.5 1.5 0 0111.5 12V6.5h2z" /></svg>
                            Run Simulation
                        </span>
                    )}
                </button>
            </div>
             {!isDataProcessingAllowed ? (
                 <p className="text-xs text-center text-yellow-400 mt-3">Note: Simulations are less accurate as data processing is disabled in your Data Vault.</p>
             ) : (journalEntries.length < 5 && (
                <p className="text-xs text-center text-yellow-400 mt-3">Note: Simulation accuracy improves significantly with more journal data.</p>
            ))}

            {response && (
                <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700">
                    <div 
                        className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 prose-headings:text-blue-400 prose-strong:text-white" 
                        dangerouslySetInnerHTML={{ __html: response }} 
                    />
                </div>
            )}
        </div>
    );
};

export default SimulationEngine;