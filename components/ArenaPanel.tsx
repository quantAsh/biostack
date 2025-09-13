import React, { useState, useMemo, useEffect } from 'react';
import { VIEW_THEMES } from '../constants';
import { ArenaSubView, ChallengeCard, Protocol, PublicUserProfile } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import useIsMobile from '../hooks/useIsMobile';
import MobileHeader from './MobileHeader';
import GenesisForge from './GenesisForge';
import toast from 'react-hot-toast';
import TournamentsPanel from './TournamentsPanel';
import MarketplacePanel from './MarketplacePanel';

// New Vitals Components
const PlayerArenaVitals: React.FC = () => {
    const { pvpRank, pvpRating, pvpWins, pvpLosses } = useUserStore();
    const winRate = (pvpWins || 0) + (pvpLosses || 0) > 0 ? (((pvpWins || 0) / ((pvpWins || 0) + (pvpLosses || 0))) * 100).toFixed(1) : '0.0';

    return (
        <div className="arena-stat-card" data-view-id="arena-player-vitals">
            <h4 className="label mb-2">Your Vitals</h4>
            <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-300">Rank:</span>
                    <span className="value text-lg">{pvpRank} ({pvpRating})</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-300">Record:</span>
                    <span className="value text-base">{pvpWins || 0}W - {pvpLosses || 0}L</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-300">Win Rate:</span>
                    <span className="value text-base">{winRate}%</span>
                </div>
            </div>
        </div>
    );
};

const CommunityArenaVitals: React.FC = () => {
    const { allUsers } = useDataStore();
    const topPlayer = useMemo(() => {
        return [...allUsers].sort((a, b) => (b.pvpRating || 0) - (a.pvpRating || 0))[0];
    }, [allUsers]);

    return (
        <div className="arena-stat-card">
            <h4 className="label mb-2">Community Stats</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-300">Duels Today:</span>
                    <span className="value text-lg">{(12456).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-300">Top Ranked:</span>
                    <span className="value text-base truncate" title={topPlayer?.displayName}>{topPlayer?.displayName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-300">Rating:</span>
                    <span className="value text-base">{topPlayer?.pvpRating || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};


// Internal component for displaying a challenge card
const ChallengeCardDisplay: React.FC<{ card: ChallengeCard; isFirst?: boolean }> = ({ card, isFirst }) => {
    const { startDuel } = useUIStore();
    const { myStack } = useUserStore();
    const { protocols: allProtocols } = useDataStore();
    const myProtocols = myStack.filter((p): p is Protocol => 'id' in p);

    const handleChallenge = () => {
        let hand: Protocol[] = [];
        if (myProtocols.length > 0) {
            // Select up to 5 random protocols from user's stack as their hand
            hand = [...myProtocols].sort(() => 0.5 - Math.random()).slice(0, 5);
        } else {
            // If the user has no protocols, give them a default starter hand
            const starterIds = ['21', '3', '23', '6', '29'];
            hand = starterIds.map(id => allProtocols.find(p => p.id === id)).filter((p): p is Protocol => !!p);
            if(hand.length < 5) {
                // Fallback if specific starters aren't found
                hand = [...allProtocols].sort(() => 0.5 - Math.random()).slice(0, 5);
            }
            toast("Your stack is empty! Starting with a default set of protocols.");
        }
        
        if (hand.length === 0) {
            toast.error("No protocols available to start a duel.");
            return;
        }

        startDuel(card, hand);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl overflow-hidden flex flex-col group">
            <div className="relative aspect-video w-full overflow-hidden">
                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-title text-xl font-bold text-white">{card.name}</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4 flex-grow">{card.description}</p>
                
                <div 
                    className="grid grid-cols-2 gap-2 text-center text-sm mb-4"
                    {...(isFirst && { 'data-view-id': 'arena-challenge-card-stats' })}
                >
                    <div className="bg-black/40 p-2 rounded-md">
                        <p className="text-xs text-red-300 uppercase font-semibold">HP</p>
                        <p className="font-mono font-bold text-lg text-white">{card.hp}</p>
                    </div>
                     <div className="bg-black/40 p-2 rounded-md">
                        <p className="text-xs text-blue-300 uppercase font-semibold">Attack</p>
                        <p className="font-mono font-bold text-lg text-white">{card.attack}</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleChallenge}
                    className="w-full mt-auto bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-500 transition-colors text-sm"
                    {...(isFirst && { 'data-view-id': 'arena-challenge-button' })}
                >
                    Challenge
                </button>
            </div>
        </div>
    );
};

// Internal component for the main duel selection screen
const ChallengeSelection: React.FC = () => {
    const { challengeCards } = useDataStore();

    return (
        <div>
            <div className="text-center mb-8">
                <h3 className="font-title text-2xl font-bold text-gray-200">Select Your Challenge</h3>
                <p className="text-gray-400 text-sm">Face a biological adversary. Your stack is your weapon.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-view-id="arena-challenge-grid">
                {challengeCards.map((card, index) => (
                    <ChallengeCardDisplay key={card.id} card={card} isFirst={index === 0} />
                ))}
            </div>
        </div>
    );
};

const SynapseArena: React.FC = () => {
    const { myStack, pvpDeck, setPvpDeck, pvpRank, pvpRating, bioTokens, user } = useUserStore();
    const { allUsers, protocols: allProtocols } = useDataStore();
    const { startDuel } = useUIStore();

    const [selectedOpponent, setSelectedOpponent] = useState<PublicUserProfile | null>(null);
    const [stake, setStake] = useState<number | string>(100);

    const availableProtocolsForDeckBuilding = useMemo(() => {
        const myProtocols = myStack.filter((p): p is Protocol => 'id' in p);
        if (myProtocols.length > 0) {
            return myProtocols;
        }
        toast("Your stack is empty! Using a default set of protocols for deck building.");
        const starterIds = ['1', '2', '3', '6', '12', '14', '21', '23', '25'];
        return starterIds.map(id => allProtocols.find(p => p.id === id)).filter((p): p is Protocol => !!p);
    }, [myStack, allProtocols]);

    const handleDeckToggle = (protocolId: string) => {
        const newDeck = pvpDeck.includes(protocolId)
            ? pvpDeck.filter(id => id !== protocolId)
            : pvpDeck.length < 5 ? [...pvpDeck, protocolId] : pvpDeck;
        setPvpDeck(newDeck);
    };
    
    useEffect(() => {
        // Find a suitable opponent that is not the current user
        const potentialOpponents = allUsers.filter(u => u.id !== user?.uid && !u.isBanned);
        if (potentialOpponents.length > 0) {
            const opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
            setSelectedOpponent(opponent);
        }
    }, [allUsers, user]);
    
    const handleChallenge = () => {
        if (!selectedOpponent) {
            toast.error("Please select an opponent.");
            return;
        }
        if (pvpDeck.length !== 5) {
            toast.error("Your PvP deck must contain exactly 5 protocols.");
            return;
        }
        const stakeAmount = Number(stake);
        if (isNaN(stakeAmount) || stakeAmount <= 0) {
            toast.error("Invalid stake amount.");
            return;
        }
        if (bioTokens < stakeAmount) {
            toast.error("Insufficient $BIO balance for this stake.");
            return;
        }

        const hand = availableProtocolsForDeckBuilding.filter(p => pvpDeck.includes(p.id));
        startDuel(selectedOpponent, hand, stakeAmount);
    };

    const getChallengeButtonState = () => {
        if (!selectedOpponent) return { text: "Select an Opponent", disabled: true };
        if (pvpDeck.length !== 5) return { text: `Deck must have 5 cards (${pvpDeck.length}/5)`, disabled: true };
        const stakeAmount = Number(stake);
        if (isNaN(stakeAmount) || stakeAmount < 0) return { text: "Invalid Stake", disabled: true };
        if (bioTokens < stakeAmount) return { text: "Insufficient $BIO", disabled: true };
        return { text: `Challenge ${selectedOpponent.displayName}`, disabled: false };
    };

    const challengeButtonState = getChallengeButtonState();

    return (
        <div className="space-y-8">
            <div className="deck-builder-grid">
                {/* Protocol Pool */}
                <div className="arena-sub-panel">
                    <h3 className="font-title text-xl font-bold text-gray-200 mb-1">Assemble Your Champions</h3>
                    <p className="text-sm text-gray-400 mb-3">Select 5 protocols from your available arsenal.</p>
                    <div className="protocol-pool-grid max-h-96 overflow-y-auto custom-scrollbar">
                        {availableProtocolsForDeckBuilding.map(p => (
                            <div key={p.id} onClick={() => handleDeckToggle(p.id)} className={`p-2 border-2 rounded-lg cursor-pointer transition-all ${pvpDeck.includes(p.id) ? 'border-red-400 bg-red-900/30' : 'border-gray-700 hover:border-gray-600'}`}>
                                <p className="font-semibold text-sm truncate">{p.name}</p>
                                <div className="flex items-center gap-2 text-xs mt-1 text-gray-400">
                                    <span>ATK: {p.gameStats?.attack}</span>
                                    <span>DEF: {p.gameStats?.defense}</span>
                                </div>
                            </div>
                        ))}
                         {availableProtocolsForDeckBuilding.length === 0 && <p className="text-gray-500 text-sm col-span-full text-center py-8">Your protocol pool is empty. Add some protocols to "My Stack" first!</p>}
                    </div>
                </div>

                {/* PvP Deck */}
                <div className="arena-sub-panel">
                    <h3 className="font-title text-xl font-bold text-gray-200 mb-3">PvP Deck ({pvpDeck.length}/5)</h3>
                     <div className="space-y-2">
                        {pvpDeck.map(id => {
                            const p = availableProtocolsForDeckBuilding.find(proto => proto.id === id);
                            return p ? (
                                <div key={id} className="p-2 bg-black/30 border border-gray-700 rounded-lg flex justify-between items-center">
                                    <p className="font-semibold text-sm">{p.name}</p>
                                    <button onClick={() => handleDeckToggle(id)} className="text-red-400 hover:text-red-300">&times;</button>
                                </div>
                            ) : null;
                        })}
                        {[...Array(5 - pvpDeck.length)].map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 h-12 bg-black/20 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-600 text-sm">Empty Slot</div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Opponent Selection & Challenge */}
            <div className="arena-sub-panel mt-8">
                <h3 className="font-title text-xl font-bold text-gray-200 mb-3">Matchmaking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                        <p className="text-sm font-semibold">Your Rank: <span className="text-lg font-bold text-red-300">{pvpRank} ({pvpRating})</span></p>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                        <p className="text-sm font-semibold">Opponent: <span className="text-lg font-bold text-white">{selectedOpponent?.displayName || 'Searching...'}</span></p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Wager (Stake)</label>
                    <div className="relative">
                        <input type="number" value={stake} onChange={e => setStake(e.target.value)} min="0" step="10" className="w-full bg-black/30 p-2 rounded border border-gray-600 text-sm pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-purple-300 font-bold">$BIO</span>
                    </div>
                </div>
                <button onClick={handleChallenge} disabled={challengeButtonState.disabled} className="w-full mt-4 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {challengeButtonState.text}
                </button>
            </div>
        </div>
    );
};

const ArenaPanel: React.FC = () => {
    const theme = VIEW_THEMES['arena'];
    const { arenaSubView: subView, setArenaSubView: setSubView } = useUIStore();
    const isMobile = useIsMobile();

    const SubViewButton: React.FC<{ view: ArenaSubView, label: string }> = ({ view, label }) => (
        <button
            onClick={() => setSubView(view)}
            className={`console-button !flex-grow-0 ${subView === view ? 'active' : ''}`}
            style={{ '--btn-color': '#f87171', '--btn-bg': 'rgba(248, 113, 113, 0.1)', '--btn-border': 'rgba(248, 113, 113, 0.3)' } as React.CSSProperties}
            data-view-id={`arena-${view}`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (subView) {
            case 'bio-duels':
                return <ChallengeSelection />;
            case 'synapse-arena':
                return <SynapseArena />;
            case 'genesis-forge':
                return <GenesisForge />;
            case 'tournaments':
                return <TournamentsPanel />;
            case 'marketplace':
                return <MarketplacePanel />;
            default:
                return <ChallengeSelection />;
        }
    };

    const mainContent = (
        <div className="arena-header-container">
            <div className="dashboard-header arena-header">
                {/* Top Row: Info and Vitals */}
                <div className="flex justify-between items-start gap-8">
                    {/* Left side: Title and Description */}
                    <div className="flex-grow">
                        <h2 className={`font-hud text-3xl font-bold ${theme.textColor}`} style={{textShadow: '0 0 15px #ef4444'}}>The Arena</h2>
                        <p className="text-gray-400 max-w-2xl text-sm mt-1">Test your bio-mastery. Engage in PvE duels against biological challenges, or enter the Synapse Arena for PvP combat.</p>
                    </div>

                    {/* Right side: Stat Cards */}
                    <div className="flex-shrink-0 flex gap-4">
                        <div className="w-64">
                            <PlayerArenaVitals />
                        </div>
                        <div className="w-64">
                           <CommunityArenaVitals />
                        </div>
                    </div>
                </div>

                {/* Divider and Navigation Row */}
                <div className="pt-4 mt-2 border-t border-red-500/30">
                    <div className="flex gap-4">
                        <SubViewButton view="bio-duels" label="Bio-Duels (PvE)" />
                        <SubViewButton view="synapse-arena" label="Synapse Arena (PvP)" />
                        <SubViewButton view="genesis-forge" label="Genesis Forge" />
                        <SubViewButton view="tournaments" label="Tournaments" />
                        <SubViewButton view="marketplace" label="Marketplace" />
                    </div>
                </div>
            </div>

            <div className="arena-floor">
                {renderContent()}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="h-full">
                <MobileHeader title="Arena" />
                <div className="mobile-page-content custom-scrollbar p-4">
                    {/* Mobile version could have a simplified version of the new header */}
                    {mainContent}
                </div>
            </div>
        );
    }
    
    return (
        <div className="mx-auto max-w-7xl">
            {mainContent}
        </div>
    );
};

export default ArenaPanel;