import React, { useState, useMemo, useEffect } from 'react';
import ProtocolCard from './ProtocolCard';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { VIEW_THEMES } from '../constants';
import UserStackCard from './UserStackCard';
import { Protocol, UserStack, Journey, Category } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isFirebaseEnabled } from '../services/firebase';
import ProtocolCustomizer from './ProtocolCustomizer';
import JourneyCard from './JourneyCard';
import useIsMobile from '../hooks/useIsMobile';
import MobileHeader from './MobileHeader';
import StackLabHeader from './StackLabHeader';
import SandboxPanel from './SandboxPanel';
import StackSequenceView from './StackSequenceView';


const MyPersonalizedProtocols: React.FC = () => {
    const queryClient = useQueryClient();
    const protocols = useDataStore(state => state.protocols);
    const shareProtocolToCommunity = useDataStore(state => state.shareProtocolToCommunity);
    const user = useUserStore(state => state.user);
    const isPremium = useUserStore(state => state.isPremium);
    const sharedProtocolCount = useUserStore(state => state.sharedProtocolCount);
    const openUpgradeModal = useUIStore(state => state.openUpgradeModal);
    
    const myPersonalizedProtocols = protocols.filter(p => p.isPersonalized && p.user_id === user?.uid);

    const shareMutation = useMutation({
        mutationFn: (protocol: Protocol) => shareProtocolToCommunity(protocol),
        onSuccess: () => {
            toast.success("Protocol shared with the community!");
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
        },
        onError: () => toast.error("Failed to share protocol."),
    });
    
    const handleShare = (protocol: Protocol) => {
        shareMutation.mutate(protocol);
    };

    if (!user || myPersonalizedProtocols.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 text-sm">
                <p>You haven't created any personalized protocols yet.</p>
            </div>
        );
    }
    
    const canShare = isPremium || sharedProtocolCount < 1;

    return (
        <div className="space-y-4">
            {myPersonalizedProtocols.map(p => (
                <div key={p.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between gap-2">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                           <h4 className="font-semibold text-gray-200 text-sm">{p.name}</h4>
                           {p.isShared && <span className="px-1.5 py-0.5 text-[9px] font-bold text-black bg-green-400 rounded-full">SHARED</span>}
                        </div>
                    </div>
                    {p.isShared ? (
                        <button className="flex-shrink-0 bg-gray-700 text-gray-400 font-bold py-1 px-2 rounded-md text-xs cursor-default">
                           Shared
                        </button>
                    ) : (
                        <button
                            onClick={() => handleShare(p)}
                            disabled={!canShare || shareMutation.isPending}
                            className="flex-shrink-0 bg-green-600 text-white font-bold py-1 px-2 rounded-md hover:bg-green-500 transition-colors text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                            title={!canShare ? "Upgrade to Kai+ for unlimited shares" : "Share this protocol"}
                        >
                           {shareMutation.isPending && shareMutation.variables?.id === p.id ? '...' : 'Share'}
                        </button>
                    )}
                </div>
            ))}
            {!isPremium && sharedProtocolCount >= 1 && (
                <div className="text-center p-2 bg-yellow-900/40 text-yellow-300 text-xs rounded-lg">
                    Upgrade to Kai+ for unlimited shares.
                </div>
            )}
        </div>
    );
};

const ProtocolLabSidebar: React.FC = () => {
    const { openSubmitModal, openPublishModal, enterSandboxMode } = useUIStore();
    
    return (
    <div data-view-id="my-stack-lab-tools" className="lg:sticky top-28 space-y-8">
            <div className={`hud-panel !p-4 !border-teal-500/30`}>
                <h3 className="font-hud text-xl font-bold mb-3 text-gray-200">Publish My Stack</h3>
                <p className="text-gray-400 mb-4 text-sm">Share your active stack with the community.</p>
                <button 
                    onClick={() => openPublishModal()}
                    className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Publish Stack
                </button>
            </div>

            <div className={`hud-panel !p-4 !border-teal-500/30`}>
                <h3 className="font-hud text-xl font-bold mb-3 text-gray-200">Sandbox Mode</h3>
                <p className="text-gray-400 mb-4 text-sm">A/B test different stack configurations with Kai's simulation engine.</p>
                <button 
                    onClick={enterSandboxMode}
                    className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition-colors"
                >
                    Enter Sandbox
                </button>
            </div>

            <div className={`hud-panel !p-4 !border-teal-500/30`}>
                <h3 className="font-hud text-xl font-bold mb-3 text-gray-200">My Lab Bench</h3>
                <MyPersonalizedProtocols />
            </div>

             <div className={`hud-panel !p-4 !border-teal-500/30`}>
                <h3 className="font-hud text-xl font-bold mb-3 text-gray-200">Submit to Community</h3>
                <p className="text-gray-400 mb-4 text-sm">Have a new protocol? Share it with the community.</p>
                <button 
                    onClick={openSubmitModal}
                    className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg hover:bg-teal-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Submit a New Protocol
                </button>
            </div>
            <ProtocolCustomizer />
        </div>
    );
}

const MyStackContent: React.FC = () => {
    const { myStack } = useUserStore();
    const { setView, setExploreSubView } = useUIStore();

    const handleBrowseClick = () => {
        setView('explore');
        setExploreSubView('protocols');
    };

    if (myStack.length === 0) {
      return (
          <div className="text-center py-16 text-gray-500 col-span-full">
              <h3 className="font-title text-2xl mb-2">Your Stack is Empty</h3>
              <p>Browse protocols or clone community stacks to build your routine.</p>
              <button onClick={handleBrowseClick} className="mt-4 px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg">Browse Protocols</button>
          </div>
      );
    }
    
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                {myStack.map(item => {
                    if ('categories' in item) { // Protocol
                        return <ProtocolCard key={`stack-protocol-${item.id}`} protocol={item} />;
                    } else { // UserStack
                        return <UserStackCard key={`stack-userstack-${item.instanceId}`} stack={item} />;
                    }
                })}
            </div>
        </div>
    );
};

const MyStackLabPanel: React.FC = () => {
    const enrolledJourneyIds = useUserStore(state => state.enrolledJourneyIds);
    const myStack = useUserStore(state => state.myStack);
    const journeys = useDataStore(state => state.journeys);
    const isSandboxMode = useUIStore(state => state.isSandboxMode);
    const myStackLabView = useUIStore(state => state.myStackLabView);
    const setMyStackLabView = useUIStore(state => state.setMyStackLabView);
    const isMobile = useIsMobile();

    const myProtocols = useMemo(() => myStack.filter((p): p is Protocol => 'id' in p), [myStack]);

    const enrolledJourneys = useMemo(() => {
        return enrolledJourneyIds.map(id => journeys.find(j => j.id === id)).filter((j): j is Journey => !!j);
    }, [enrolledJourneyIds, journeys]);

    const mainContent = (
        <>
            {isSandboxMode ? (
                <SandboxPanel />
            ) : (
                <>
                    <StackLabHeader myProtocols={myProtocols} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
                        <main className="lg:col-span-2" data-view-id="my-stack-content">
                            {enrolledJourneys.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="font-title text-2xl font-bold text-teal-300 mb-6">My Active Journeys</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {enrolledJourneys.map(journey => (
                                            <JourneyCard key={journey.id} journey={journey} isActiveInStack />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className={`${enrolledJourneys.length > 0 ? 'pt-8 border-t-2 border-dashed border-teal-500/30' : ''}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-title text-2xl font-bold text-teal-300">My Active Stack</h3>
                                    <div className="sequence-view-toggle">
                                        <button className={myStackLabView === 'grid' ? 'active' : ''} onClick={() => setMyStackLabView('grid')}>Grid View</button>
                                        <button className={myStackLabView === 'sequence' ? 'active' : ''} onClick={() => setMyStackLabView('sequence')}>Sequence View</button>
                                    </div>
                                </div>
                                {myStackLabView === 'grid' ? <MyStackContent /> : <StackSequenceView />}
                            </div>
                        </main>
                        <aside className="hidden lg:block" data-view-id="my-stack-sidebar">
                           <ProtocolLabSidebar />
                        </aside>
                    </div>
                </>
            )}
        </>
    );
    
    if (isMobile) {
        return (
            <div className="h-full">
                <MobileHeader title="Stack Lab" />
                <div className="mobile-page-content custom-scrollbar p-4">
                    {mainContent}
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-screen-2xl">
            {mainContent}
        </div>
    );
};

export default MyStackLabPanel;