import React, { useState, useMemo, useEffect } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { Protocol, ProtocolMasteryLevel } from '../types';
import { useMutation } from '@tanstack/react-query';
import { generateCardArtFromProtocol } from '../services/geminiService';
import toast from 'react-hot-toast';
import ProtocolCard from './ProtocolCard';
import { KaiIcon } from './KaiIcon';
import { MASTERY_LEVELS } from '../constants';

const ForgeProgressionGuide: React.FC = () => (
    <div className="forge-guide-panel">
        <h4 className="font-title text-xl font-bold mb-4 text-center text-gray-400">Mastery & Forging Tiers</h4>
        <div className="space-y-2 flex-grow">
            {Object.entries(MASTERY_LEVELS).map(([level, details]) => (
                <div key={level} className={`forge-guide-row ${details.canForge ? 'can-forge' : ''}`}>
                    <div className="mastery-level">{level}</div>
                    <div className="streak-req">{details.requiredStreaks}+ Day Streak</div>
                    <div className="forge-tier">
                        {details.canForge ? (
                            <span className={`forge-tier-badge-inline tier-${details.forgeTier?.toLowerCase()}`}>{details.forgeTier}</span>
                        ) : (
                            <span className="no-forge">-</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <p className="text-xs text-gray-600 mt-auto text-center">Master protocols to unlock their potential in the Forge.</p>
    </div>
);


const GenesisForge: React.FC = () => {
    const { protocols } = useDataStore();
    const { user, level, bioTokens, forgeNftProtocol, protocolMastery } = useUserStore();
    
    const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
    const [artUrl, setArtUrl] = useState<string | null>(null);
    const [attack, setAttack] = useState(0);
    const [defense, setDefense] = useState(0);

    const eligibleProtocols = useMemo(() => {
        if (!user) return [];
        return Object.values(protocolMastery)
            .filter(mastery => {
                const levelInfo = MASTERY_LEVELS[mastery.level];
                return levelInfo.canForge && !mastery.forgedNftId;
            })
            .map(mastery => protocols.find(p => p.id === mastery.protocolId))
            .filter((p): p is Protocol => !!p);
    }, [protocols, user, protocolMastery]);

    const selectedProtocol = useMemo(() => {
        return protocols.find(p => p.id === selectedProtocolId);
    }, [selectedProtocolId, protocols]);
    
    const selectedMastery = selectedProtocol ? protocolMastery[selectedProtocol.id] : null;
    const selectedTier = selectedMastery ? MASTERY_LEVELS[selectedMastery.level].forgeTier : null;

    const { powerBudget, forgeCost } = useMemo(() => {
        const baseScore = selectedProtocol?.bioScore || 0;
        switch(selectedTier) {
            case 'Polished': return { powerBudget: Math.round(baseScore * 1.0), forgeCost: 1000 };
            case 'Artisan': return { powerBudget: Math.round(baseScore * 1.1), forgeCost: 2500 };
            case 'Genesis': return { powerBudget: Math.round(baseScore * 1.25), forgeCost: 5000 };
            default: return { powerBudget: 0, forgeCost: 99999 };
        }
    }, [selectedProtocol, selectedTier]);
    
    useEffect(() => {
        if (selectedProtocol) {
            const baseStats = selectedProtocol.gameStats || { attack: 50, defense: 50 };
            setAttack(baseStats.attack);
            setDefense(baseStats.defense);
            setArtUrl(selectedProtocol.imageUrl || null);
        } else {
            setAttack(0);
            setDefense(0);
            setArtUrl(null);
        }
    }, [selectedProtocol]);

    const artGenerationMutation = useMutation({
        mutationFn: (protocol: Protocol) => generateCardArtFromProtocol(protocol),
        onSuccess: (data) => {
            setArtUrl(data);
            toast.success("AI art generated!");
        },
        onError: (error: Error) => toast.error(`Art generation failed: ${error.message}`),
    });
    
    const forgeMutation = useMutation({
        mutationFn: (data: { baseProtocol: Protocol, nftData: any }) => forgeNftProtocol(data.baseProtocol, data.nftData),
        onSuccess: () => {
            toast.success("Protocol successfully forged into an NFT!", { icon: '✨' });
            setSelectedProtocolId(null); // Reset form
        },
        onError: (error: Error) => toast.error(`Forging failed: ${error.message}`),
    });

    const handleForge = () => {
        if (!selectedProtocol || !artUrl || !selectedTier) {
            toast.error("Please select a protocol and generate art first.");
            return;
        }
        if (attack + defense > powerBudget) {
            toast.error("Assigned stats exceed the Power Budget.");
            return;
        }
        
        forgeMutation.mutate({
            baseProtocol: selectedProtocol,
            nftData: {
                name: selectedProtocol.name,
                description: selectedProtocol.description,
                gameStats: { attack, defense },
                imageUrl: artUrl,
                forgeTier: selectedTier,
            },
        });
    };

    const previewProtocol: Protocol | null = useMemo(() => {
        if (!selectedProtocol || !selectedTier) return null;
        return {
            ...selectedProtocol,
            isNft: true,
            artist: user?.displayName || 'Anonymous',
            imageUrl: artUrl || selectedProtocol.imageUrl,
            gameStats: { attack, defense },
            forgeTier: selectedTier,
        } as Protocol;
    }, [selectedProtocol, artUrl, attack, defense, user, selectedTier]);

    const remainingBudget = powerBudget - (attack + defense);
    const canGenerateArt = selectedTier === 'Artisan' || selectedTier === 'Genesis';

    if (level < 20) {
        return (
            <div className="forge-panel text-center">
                <h3 className="font-title text-2xl font-bold text-gray-200">Genesis Forge</h3>
                <p className="text-gray-400 text-sm mt-2 mb-4">You must reach <span className="font-bold text-yellow-300">Level 20 (Data Alchemist)</span> to unlock the Genesis Forge.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Controls */}
            <div className="forge-panel space-y-6">
                <div className="text-center">
                    <h3 className="font-title text-2xl font-bold text-gray-200">Genesis Forge</h3>
                    <p className="text-gray-400 text-sm">Mint your mastered protocols into tradable NFT assets.</p>
                </div>

                {eligibleProtocols.length === 0 && (
                    <div className="lab-hint-panel !border-purple-500/30 !bg-purple-900/10">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 flex-shrink-0 text-purple-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.895 2.553a1.5 1.5 0 00-1.79 0l-4.5 2.25a1.5 1.5 0 00-.895 1.342V15a1.5 1.5 0 002.25 1.342l4.5-2.25a1.5 1.5 0 00.895-1.342V6.145a1.5 1.5 0 00-2.25-1.342l-4.5 2.25z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Forge Access Requirements</h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    The Genesis Forge allows you to mint a unique, tradable NFT from a protocol you have truly mastered.
                                </p>
                                
                                <div className="my-3 p-3 bg-gray-800/50 rounded-md border border-gray-700">
                                    <p className="text-sm text-gray-300 text-center">
                                        The primary path is to achieve <span className="font-bold text-yellow-300">'Expert'</span> mastery by maintaining a:
                                    </p>
                                    <p className="text-center font-bold text-xl text-yellow-300 mt-1">30-Day Streak</p>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-purple-500/20">
                                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">KAIROS INSIGHT</p>
                                    <p className="text-xs text-gray-400 italic mt-1">
                                        The collective data suggests alternative paths may emerge for operators with exceptionally high <span className="font-semibold text-white">Stack Synergy Scores</span> or <span className="font-semibold text-white">XP Levels</span>. Continue to optimize.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Select Protocol */}
                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">1. Select a Mastered Protocol to Forge</label>
                    <select
                        value={selectedProtocolId || ''}
                        onChange={(e) => setSelectedProtocolId(e.target.value)}
                        className="w-full bg-gray-800/50 border-gray-600 rounded-lg p-2.5 text-sm"
                        disabled={eligibleProtocols.length === 0}
                    >
                        <option value="">{eligibleProtocols.length > 0 ? '-- Choose Protocol --' : 'No eligible protocols found'}</option>
                        {eligibleProtocols.map(p => <option key={p.id} value={p.id}>{p.name} ({protocolMastery[p.id]?.level})</option>)}
                    </select>
                </div>
                
                {selectedProtocol && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Step 2: Generate Art */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">2. Card Art</label>
                            <button
                                onClick={() => artGenerationMutation.mutate(selectedProtocol)}
                                disabled={artGenerationMutation.isPending || !canGenerateArt}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                title={!canGenerateArt ? `Reach 'Master' tier to generate unique AI art.` : ''}
                            >
                                {artGenerationMutation.isPending ? 'Generating...' : <><KaiIcon className="w-5 h-5"/> Generate New AI Art</>}
                            </button>
                        </div>
                        
                        {/* Step 3: Allocate Stats */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">3. Allocate Game Stats</label>
                            <div className="p-3 bg-black/20 rounded-lg border border-gray-700 space-y-3">
                                <div className="text-center font-mono text-sm">
                                    Forge Tier: <span className="font-bold text-lg text-purple-300">{selectedTier}</span> |
                                    Power Budget: <span className="font-bold text-lg text-yellow-300">{powerBudget}</span> | 
                                    Remaining: <span className={`font-bold text-lg ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>{remainingBudget}</span>
                                </div>
                                <div>
                                    <label className="text-xs text-red-300">Attack: {attack}</label>
                                    <input type="range" min="0" max={powerBudget} value={attack} onChange={(e) => setAttack(parseInt(e.target.value))} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-xs text-blue-300">Defense: {defense}</label>
                                    <input type="range" min="0" max={powerBudget} value={defense} onChange={(e) => setDefense(parseInt(e.target.value))} className="w-full" />
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Forge */}
                        <div>
                            <button
                                onClick={handleForge}
                                disabled={forgeMutation.isPending || bioTokens < forgeCost || !artUrl || remainingBudget < 0}
                                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                                title={bioTokens < forgeCost ? `Insufficient funds. Cost: ${forgeCost} $BIO` : ''}
                            >
                                {forgeMutation.isPending ? 'Forging...' : `Forge NFT (-${forgeCost} $BIO)`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Preview or Guide */}
            <div className="flex flex-col items-center justify-center">
                <h4 className="font-title text-xl font-bold mb-4 text-center text-gray-400">
                    {selectedProtocol ? 'Live Preview' : 'Mastery & Forging Tiers'}
                </h4>
                <div className="w-full max-w-sm">
                    {previewProtocol ? (
                        <ProtocolCard protocol={previewProtocol} />
                    ) : (
                        <ForgeProgressionGuide />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenesisForge;