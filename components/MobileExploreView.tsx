import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import ProtocolCard from './ProtocolCard';
import CommunityStackCard from './CommunityStackCard';
import JourneyCard from './JourneyCard';
import { Protocol, ExploreSubView } from '../types';
import { useUIStore } from '../stores/uiStore';
import MobileHeader from './MobileHeader';
import KairosEngineHub from './KairosEngineHub';

const MobileExploreView: React.FC = () => {
    const { protocols, communityStacks, journeys } = useDataStore();
    const { toggleStack } = useUserStore();
    const { exploreSubView, setExploreSubView } = useUIStore();
    
    const [cardStack, setCardStack] = useState<Protocol[]>([]);
    const [isActionInProgress, setIsActionInProgress] = useState(false);

    const cardElements = useRef<Map<string, HTMLElement>>(new Map());
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const shuffled = [...protocols]
            .filter(p => !p.isPersonalized)
            .sort(() => 0.5 - Math.random());
        setCardStack(shuffled);
    }, [protocols]);

    const addCardRef = (id: string) => (node: HTMLElement | null) => {
        const map = cardElements.current;
        if (node) {
            map.set(id, node);
        } else {
            map.delete(id);
        }
    };

    const handleAction = useCallback((direction: 'dismiss' | 'add', protocolId: string) => {
        if(isActionInProgress) return;
        setIsActionInProgress(true);

        const currentProtocol = protocols.find(p => p.id === protocolId);
        if (direction === 'add' && currentProtocol) {
            toggleStack(currentProtocol);
            if ('vibrate' in navigator) navigator.vibrate(100);
        }
        
        const currentIndex = cardStack.findIndex(p => p.id === protocolId);
        const nextIndex = currentIndex + 1;

        if (nextIndex < cardStack.length) {
            const nextProtocolId = cardStack[nextIndex].id;
            const nextElement = cardElements.current.get(nextProtocolId);
            nextElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            const endElement = document.getElementById('swiper-end');
            endElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        setTimeout(() => {
            setIsActionInProgress(false);
        }, 500);

    }, [cardStack, protocols, toggleStack, isActionInProgress]);

    const SwipeableProtocolCard: React.FC<{
        protocol: Protocol;
        onAction: (direction: 'dismiss' | 'add') => void;
        addCardRef: (id: string) => (node: HTMLDivElement | null) => void;
    }> = ({ protocol, onAction, addCardRef }) => {
        const cardWrapperRef = useRef<HTMLDivElement>(null);
        const cardInnerRef = useRef<HTMLDivElement>(null);
        const [isSwiping, setIsSwiping] = useState(false);
        const [startX, setStartX] = useState(0);
        const [currentX, setCurrentX] = useState(0);
        const [animationClass, setAnimationClass] = useState('');
    
        const SWIPE_THRESHOLD = 80;
    
        const handleTouchStart = (e: React.TouchEvent) => {
            if (animationClass) return;
            setIsSwiping(true);
            setStartX(e.touches[0].clientX);
            setCurrentX(0);
        };
    
        const handleTouchMove = (e: React.TouchEvent) => {
            if (!isSwiping) return;
            const deltaX = e.touches[0].clientX - startX;
            setCurrentX(deltaX);
            if (cardInnerRef.current) {
                const rotation = deltaX / 20;
                cardInnerRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
            }
        };
    
        const handleTouchEnd = () => {
            setIsSwiping(false);
            if (Math.abs(currentX) > SWIPE_THRESHOLD) {
                const direction = currentX > 0 ? 'right' : 'left';
                setAnimationClass(direction === 'right' ? 'fly-out-right' : 'fly-out-left');
                
                setTimeout(() => {
                    onAction(direction === 'right' ? 'add' : 'dismiss');
                }, 300);
    
            } else {
                if (cardInnerRef.current) {
                    cardInnerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
                    cardInnerRef.current.style.transform = 'translateX(0px) rotate(0deg)';
                    setTimeout(() => {
                         if (cardInnerRef.current) cardInnerRef.current.style.transition = '';
                    }, 300);
                }
            }
            setCurrentX(0);
        };
    
        return (
            <div
                ref={addCardRef(protocol.id)}
                data-protocol-id={protocol.id}
                className="mobile-protocol-card-wrapper"
            >
                <div
                    ref={cardInnerRef}
                    className={`swipe-card ${isSwiping ? 'swiping' : ''} ${animationClass}`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <ProtocolCard protocol={protocol} isFullScreen onMobileAction={() => onAction('add')} />
                </div>
            </div>
        );
    };

    const ProtocolSwiperContent = () => {
        if (cardStack.length === 0) {
            return (
                <div className="flex-grow flex items-center justify-center text-center">
                    <div><h3 className="text-xl font-bold text-gray-400">Loading Protocols...</h3></div>
                </div>
            );
        }
        return (
             <div ref={scrollerRef} className="mobile-protocol-swiper-container">
                {cardStack.map((protocol) => (
                    <SwipeableProtocolCard
                        key={protocol.id}
                        protocol={protocol}
                        onAction={(dir) => handleAction(dir, protocol.id)}
                        addCardRef={addCardRef}
                    />
                ))}
                <div id="swiper-end" className="mobile-protocol-card-wrapper">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-400">All Done!</h3>
                        <p className="text-gray-500">You've seen all available protocols.</p>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderContent = () => {
        switch(exploreSubView) {
            case 'protocols':
                return <ProtocolSwiperContent />;
            case 'stacks':
                return (
                    <div className="mobile-card-list-view custom-scrollbar">
                        {communityStacks.map(stack => <CommunityStackCard key={stack.id} stack={stack} isMobileView />)}
                    </div>
                );
            case 'journeys':
                return (
                     <div className="mobile-card-list-view custom-scrollbar">
                        {journeys.map(journey => <JourneyCard key={journey.id} journey={journey} isMobileView />)}
                    </div>
                );
            case 'kairos':
                 return (
                     <div className="mobile-card-list-view custom-scrollbar">
                        <KairosEngineHub />
                    </div>
                );
            default:
                return <ProtocolSwiperContent />;
        }
    };
    
    const FilterButton: React.FC<{ subView: ExploreSubView, label: string }> = ({ subView, label }) => {
        const isActive = exploreSubView === subView;
        return (
            <button
                onClick={() => setExploreSubView(subView)}
                className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${isActive ? 'text-blue-300 border-blue-300' : 'text-gray-500 border-transparent'}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="mobile-explore-container">
            <MobileHeader title="Explore" />
            <div className="fixed top-[60px] left-0 right-0 z-[800] bg-black/50 backdrop-blur-sm flex justify-around border-b border-gray-800" style={{paddingTop: 'env(safe-area-inset-top)'}}>
                <FilterButton subView="protocols" label="Protocols" />
                <FilterButton subView="stacks" label="Stacks" />
                <FilterButton subView="journeys" label="Journeys" />
                <FilterButton subView="kairos" label="KAIROS" />
            </div>
            {renderContent()}
        </div>
    );
};
export default MobileExploreView;