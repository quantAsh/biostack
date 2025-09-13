import React, { useMemo, useState } from 'react';
import { Protocol, CommunityStack, Journey, SearchResultItem, ExploreSubView } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import ProtocolCard from './ProtocolCard';
import LeaderboardPanel from './LeaderboardPanel';
import CommunityStackCard from './CommunityStackCard';
import JourneyCard from './JourneyCard';
import KairosEngineHub from './KairosEngineHub';
import { VIEW_THEMES } from '../constants';
import { useMutation } from '@tanstack/react-query';
import { getExploreSearchResults } from '../services/geminiService';
import toast from 'react-hot-toast';

const StatItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="stat-item">
        <p className="value">{value}</p>
        <p className="label">{label}</p>
    </div>
);

const CommunityStatsHUD: React.FC = () => {
    const { allUsers, communityStacks } = useDataStore();

    const stats = useMemo(() => {
        const totalUsers = allUsers.length;
        const stacksForged = communityStacks.length;
        const protocolsLogged = Math.floor(totalUsers * 15.3); // Simulated

        return {
            totalUsers: totalUsers.toLocaleString(),
            stacksForged: stacksForged.toLocaleString(),
            protocolsLogged: protocolsLogged.toLocaleString()
        };
    }, [allUsers, communityStacks]);

    return (
        <div className="flex-shrink-0 hidden lg:flex items-center gap-4">
            <StatItem label="Total Biohackers" value={stats.totalUsers} />
            <StatItem label="Stacks Forged" value={stats.stacksForged} />
            <StatItem label="Protocols Logged (24h)" value={stats.protocolsLogged} />
        </div>
    );
};


const AnnouncementTicker: React.FC = () => {
    const newStacksThisWeek = 1;
    const topContributor = "Dr. Anya Sharma";

    return (
        <div className="h-12 bg-[#423422] border border-[#d4a055]/50 rounded-lg font-hud text-[#fcd34d] w-full flex items-center overflow-hidden justify-around">
             <span className="text-sm font-semibold flex items-center gap-2">
                ✨ 1 NEW STACKS THIS WEEK
            </span>
            <span className="text-sm font-semibold flex items-center gap-2">
                🏆 TOP CONTRIBUTOR: Dr. Anya Sharma
            </span>
        </div>
    );
};


const ExplorePanel: React.FC = () => {
    const protocols = useDataStore(state => state.protocols);
    const communityStacks = useDataStore(state => state.communityStacks);
    const journeys = useDataStore(state => state.journeys);
    const featuredContent = useDataStore(state => state.featuredContent);
    const platformConfig = useDataStore(state => state.platformConfig);

    const exploreSubView = useUIStore(state => state.exploreSubView);
    const setExploreSubView = useUIStore(state => state.setExploreSubView);
    const isSearching = useUIStore(state => state.isSearching);
    const searchResults = useUIStore(state => state.searchResults);
    const searchError = useUIStore(state => state.searchError);
    const searchQuery = useUIStore(state => state.searchQuery);
    const clearSearch = useUIStore(state => state.clearSearch);
    const setSearchState = useUIStore(state => state.setSearchState);

    const theme = VIEW_THEMES['explore'];
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const isApiKeyMissing = !process.env.API_KEY;
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;
    
    const searchMutation = useMutation({
        mutationFn: (query: string) => {
            if (isApiKeyMissing || !isAiEnabled) {
                const errorMsg = !isAiEnabled ? "AI features are currently disabled." : "API key is not configured.";
                toast.error(errorMsg);
                throw new Error(errorMsg);
            }
            return getExploreSearchResults(query, protocols, communityStacks, journeys);
        },
        onMutate: (query) => {
            setSearchState({ isSearching: true, searchQuery: query, searchResults: null, searchError: null });
        },
        onSuccess: (data) => {
            setSearchState({ isSearching: false, searchResults: data });
        },
        onError: (error: Error) => {
            setSearchState({ isSearching: false, searchError: error });
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (localSearchQuery.trim()) {
            searchMutation.mutate(localSearchQuery.trim());
        }
    };

    const handleClearSearch = () => {
        clearSearch();
        setLocalSearchQuery('');
    };
    
    const featuredProtocols = useMemo(() => {
        if (featuredContent && featuredContent.protocolIds && featuredContent.protocolIds.length > 0) {
            return featuredContent.protocolIds
                .map(id => protocols.find(p => p.id === id))
                .filter((p): p is Protocol => !!p);
        }
        return protocols.filter(p => !p.isPersonalized && p.bioScore && p.bioScore > 85).slice(0, 3);
    }, [protocols, featuredContent]);

    const featuredStacks = useMemo(() => {
        if (featuredContent && featuredContent.stackIds && featuredContent.stackIds.length > 0) {
            return featuredContent.stackIds
                .map(id => communityStacks.find(s => s.id === id))
                .filter((s): s is CommunityStack => !!s);
        }
        return communityStacks.slice(0, 3);
    }, [communityStacks, featuredContent]);

    const featuredJourneys = useMemo(() => {
        if (featuredContent && featuredContent.journeyIds && featuredContent.journeyIds.length > 0) {
            return featuredContent.journeyIds
                .map(id => journeys.find(j => j.id === id))
                .filter((j): j is Journey => !!j);
        }
        return journeys.slice(0, 3);
    }, [journeys, featuredContent]);

    const renderMainContent = () => {
        if (isSearching) {
            return (
                <div className="flex flex-col items-center justify-center text-center py-16">
                    <svg className="animate-spin h-8 w-8 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <p className="text-gray-300">Kai is analyzing your query...</p>
                </div>
            );
        }

        if (searchError) {
            return (
                 <div className="flex flex-col items-center justify-center text-center py-16">
                    <h3 className="text-xl font-bold text-red-400">Search Failed</h3>
                    <p className="text-gray-400 mt-2">{searchError.message}</p>
                </div>
            );
        }

        if (searchResults) {
            if (searchResults.results.length === 0) {
                return <div className="text-center py-16 text-gray-500">No results found for "{searchQuery}".</div>;
            }
            return (
                <div className="space-y-8">
                    {searchResults.results.map((item: SearchResultItem) => {
                        let content = null;
                        if (item.type === 'protocol') {
                            const protocol = protocols.find(p => p.id === item.id);
                            if (protocol) content = <div className="max-w-sm mx-auto"><ProtocolCard protocol={protocol} /></div>;
                        } else if (item.type === 'stack') {
                            const stack = communityStacks.find(s => s.id === item.id);
                            if (stack) content = <div className="max-w-lg mx-auto"><CommunityStackCard stack={stack} /></div>;
                        } else { // journey
                            const journey = journeys.find(j => j.id === item.id);
                            if (journey) content = <JourneyCard journey={journey} />;
                        }
                        
                        if (!content) return null;

                        return (
                            <div key={`${item.type}-${item.id}`} className="bg-gray-900/30 p-4 rounded-lg border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-3 text-blue-300">
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.455L12.75 18l1.177-.398a3.375 3.375 0 002.455-2.455l.398-1.177.398 1.177a3.375 3.375 0 002.455 2.455l1.177.398-1.177.398a3.375 3.375 0 00-2.455 2.455z" /></svg>
                                     <p className="text-sm font-semibold">Kai's Justification:</p>
                                </div>
                                <p className="text-sm text-gray-300 italic mb-4">"{item.justification}"</p>
                                {content}
                            </div>
                        );
                    })}
                </div>
            );
        }

        switch(exploreSubView) {
            case 'protocols': return (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">{protocols.filter(p => !p.isPersonalized).map(p => <ProtocolCard key={p.id} protocol={p} />)}</div>);
            case 'stacks': return (<div className="grid grid-cols-1 md:grid-cols-2 gap-8">{communityStacks.map(s => <CommunityStackCard key={s.id} stack={s} />)}</div>);
            case 'journeys': return (<div className="grid grid-cols-1 gap-8">{journeys.map(j => <JourneyCard key={j.id} journey={j} />)}</div>);
            case 'kairos': return <KairosEngineHub />;
            case 'all': default: return (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">{featuredProtocols.map(p => <ProtocolCard key={p.id} protocol={p} />)}</div>
                    <div><h3 className="font-title text-2xl font-bold text-blue-300 mb-6">Featured Stacks</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{featuredStacks.map(s => <CommunityStackCard key={s.id} stack={s} />)}</div></div>
                    <div><h3 className="font-title text-2xl font-bold text-blue-300 mb-6">Featured Journeys</h3><div className="grid grid-cols-1 gap-8">{featuredJourneys.map(j => <JourneyCard key={j.id} journey={j} />)}</div></div>
                </div>
            );
        }
    };
    
    const SubViewButton: React.FC<{ subView: ExploreSubView, label: string }> = ({ subView, label }) => (
        <button
            onClick={() => setExploreSubView(subView)}
            className={`console-button ${exploreSubView === subView && !searchResults ? 'active' : ''}`}
            style={{ '--btn-color': '#93c5fd', '--btn-bg': 'rgba(147, 197, 253, 0.1)', '--btn-border': 'rgba(147, 197, 253, 0.3)' } as React.CSSProperties}
        >
            {label}
        </button>
    );

    return (
        <div className="mx-auto max-w-7xl">
            <div className="dashboard-header !p-6 !border-blue-500/30 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 items-start">
                {/* Column 1: Title and Description */}
                <div>
                    <h2 className={`font-hud text-3xl font-bold ${theme.textColor}`} style={{textShadow: '0 0 15px #60a5fa'}}>Explore</h2>
                    <p className="text-gray-400 max-w-2xl text-sm mt-1">Discover protocols, journeys, and community-curated stacks.</p>
                </div>
                
                {/* Column 2: Stats HUD */}
                <CommunityStatsHUD />

                {/* Full-width row for search/filters */}
                <div className="lg:col-span-2 pt-4 border-t border-blue-500/20">
                    <div className="flex items-stretch gap-8">
                        <form onSubmit={handleSearch} className="flex-shrink-0 w-full max-w-lg flex items-center gap-3">
                            <div className="relative flex-grow h-full">
                                <input
                                    type="search"
                                    data-view-id="explore-search-bar"
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                    placeholder="Ask Kai to find protocols for sleep, focus, energy..."
                                    className="w-full h-12 bg-gray-900/50 border border-blue-500/30 rounded-lg p-3 pl-10 text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-400"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.455L12.75 18l1.177-.398a3.375 3.375 0 002.455-2.455l.398-1.177.398 1.177a3.375 3.375 0 002.455 2.455l1.177.398-1.177.398a3.375 3.375 0 00-2.455 2.455z" /></svg>
                                </div>
                            </div>
                            {searchResults && <button type="button" onClick={handleClearSearch} className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-800/50">&times;</button>}
                        </form>
                        <div className="flex-grow hidden lg:flex min-w-0">
                            {!searchResults && <AnnouncementTicker />}
                        </div>
                    </div>

                    {!searchResults && (
                        <div data-view-id="explore-filters" className="flex justify-center gap-2 mt-4">
                            <SubViewButton subView="all" label="Featured" />
                            <SubViewButton subView="protocols" label="Protocols" />
                            <SubViewButton subView="stacks" label="Stacks" />
                            <SubViewButton subView="journeys" label="Journeys" />
                            <SubViewButton subView="kairos" label="KAIROS" />
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8">
                <main className="lg:col-span-3">
                    {renderMainContent()}
                </main>
                <aside className="lg:col-span-1">
                    <LeaderboardPanel />
                </aside>
            </div>
        </div>
    );
};

export default ExplorePanel;
