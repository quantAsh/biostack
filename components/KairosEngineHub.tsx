import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import MarkdownIt from 'markdown-it';
import { queryKairosEngine } from '../services/geminiService';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import { VIEW_THEMES } from '../constants';
import { ResearchBounty } from '../types';

const md = new MarkdownIt({ html: true });

const BountyCard: React.FC<{ bounty: ResearchBounty }> = ({ bounty }) => {
    const { openBountyModal, openPublishModal } = useUIStore();
    const { products, protocols } = useDataStore();
    const product = bounty.productId ? products.find(p => p.id === bounty.productId) : null;
    const winningProtocol = bounty.results?.protocolId ? protocols.find(p => p.id === bounty.results!.protocolId) : null;

    const handleCreateStack = () => {
        if (!bounty.results) return;
        openPublishModal(undefined, {
            bountyQuestion: bounty.question,
            protocolId: bounty.results.protocolId,
        });
    };

    return (
        <div className={`p-4 rounded-lg border flex flex-col ${bounty.status === 'completed' ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
            <p className="text-sm font-semibold text-white flex-grow">{bounty.question}</p>
            <p className="text-xs text-gray-500 mt-2">Proposed by {bounty.author}</p>
            {product && (
                <div className="mt-3 p-2 bg-black/30 rounded-md flex items-center gap-2">
                    <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded-sm object-cover" />
                    <div>
                        <p className="text-xs text-gray-400">Related Product:</p>
                        <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-300 hover:underline">{product.name}</a>
                    </div>
                </div>
            )}
            
            {bounty.status === 'completed' && bounty.results && (
                <div className="mt-4 pt-3 border-t border-green-500/30 space-y-2">
                    <h4 className="text-xs font-bold text-green-300 uppercase tracking-wider">Research Complete</h4>
                    <p className="text-xs text-gray-300 italic">"{bounty.results.summary}"</p>
                    <div className="bg-black/40 p-2 rounded-md">
                        <p className="text-xs text-gray-400">Highest Efficacy Protocol:</p>
                        <p className="text-sm font-semibold text-white">{winningProtocol?.name || 'Unknown Protocol'}</p>
                    </div>
                    <button
                        onClick={handleCreateStack}
                        className="w-full mt-2 bg-green-600 text-white font-bold py-1.5 px-4 rounded-md text-sm hover:bg-green-500"
                    >
                        Create Stack from Insight
                    </button>
                </div>
            )}

            {bounty.status === 'active' && (
                <div className="mt-4 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-purple-300 uppercase font-bold">Total Stake</p>
                        <p className="text-xl font-bold text-white">{bounty.totalStake.toLocaleString()} <span className="text-sm text-purple-300">$BIO</span></p>
                    </div>
                    <button
                        onClick={() => openBountyModal('stake', bounty)}
                        className="bg-purple-600 text-white font-bold py-1.5 px-4 rounded-md text-sm hover:bg-purple-500"
                    >
                        Stake
                    </button>
                </div>
            )}
        </div>
    );
};

const KairosEngineHub: React.FC = () => {
    const [userQuery, setUserQuery] = useState('');
    const { userGoals, diagnosticData } = useUserStore();
    const { kairosCollectiveData, protocols, researchBounties, platformConfig } = useDataStore();
    const { openBountyModal } = useUIStore();
    const theme = VIEW_THEMES['explore'];
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;

    const kairosMutation = useMutation({
        mutationFn: (query: string) => {
            let userContext = `Stated Goals: ${userGoals.join(', ') || 'General optimization'}. `;
            if (diagnosticData.length > 0) {
                const significantData = diagnosticData.filter(d => d.status !== 'optimal');
                if (significantData.length > 0) {
                    userContext += `Current Digital Twin shows non-optimal values for: ${significantData.map(d => `${d.metricName} (${d.status})`).join(', ')}.`;
                }
            }
            return queryKairosEngine(query, userContext, kairosCollectiveData, protocols);
        }
    });
    
    const handleQuery = (e: React.FormEvent) => {
        e.preventDefault();
        if (userQuery.trim()) {
            kairosMutation.mutate(userQuery);
        }
    };

    const isLoading = kairosMutation.isPending;
    const isApiKeyMissing = !process.env.API_KEY;
    const response = kairosMutation.data ? md.render(kairosMutation.data) : '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: AI Query Engine */}
            <div className="lg:col-span-1 space-y-6 lg:sticky top-28">
                <div className="hud-panel !border-blue-500/80">
                    <h3 className={`font-hud text-2xl font-bold mb-2 text-blue-300`}>KAIROS Query</h3>
                    <p className="text-gray-400 mb-4 text-sm">Ask strategic questions to the entire network.</p>
                    <form onSubmit={handleQuery} className="space-y-4">
                        <textarea value={userQuery} onChange={(e) => setUserQuery(e.target.value)} rows={3} placeholder="e.g., Highest efficacy for metabolic dysfunction?" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-gray-200" disabled={isLoading || !isAiEnabled} />
                        <button type="submit" disabled={isApiKeyMissing || isLoading || !userQuery.trim() || !isAiEnabled} className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-400 disabled:bg-gray-600 flex items-center justify-center gap-2">
                            {isLoading ? <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1.5c-3.314 0-6 2.686-6 6v3c0 .878.342 1.717.95 2.326l3.268 3.268a2.5 2.5 0 003.536 0l3.268-3.268A4.48 4.48 0 0016 10.5v-3c0-3.314-2.686-6-6-6zm-4.5 9v-3c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5v3c0 .445-.173.871-.476 1.185l-3.256 3.256a1 1 0 01-1.414 0L6.024 11.685A2.983 2.983 0 015.5 10.5z" clipRule="evenodd" /></svg>}
                            Query The Collective
                        </button>
                    </form>
                </div>
                {response && (
                    <div className="hud-panel !border-blue-500/80">
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 prose-headings:text-blue-400 prose-strong:text-white prose-li:marker:text-blue-400" dangerouslySetInnerHTML={{ __html: response }} />
                    </div>
                )}
            </div>

            {/* Right Column: Bounty Board */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-hud text-2xl font-bold text-purple-300">Research Bounty Board</h3>
                    <button onClick={() => openBountyModal('create')} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 text-sm">
                        Propose New Bounty
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {researchBounties.map(bounty => (
                        <BountyCard key={bounty.id} bounty={bounty} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KairosEngineHub;
