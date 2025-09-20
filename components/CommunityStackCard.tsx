import React, { useState } from 'react';
import { CommunityStack, Protocol, Product } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import ProtocolCard from './ProtocolCard';
import { CATEGORY_DETAILS } from '../constants';
import { CategoryIcon } from './CategoryIcon';

interface CommunityStackCardProps {
    stack: CommunityStack;
    isMobileView?: boolean;
}

const ForkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="17" r="2" />
      <circle cx="6" cy="3" r="2" />
      <circle cx="14" cy="3" r="2" />
      <path d="M6 15V5" />
      <path d="M6 10c0-3 2-5 8-5" />
    </svg>
);

const CommunityStackCard: React.FC<CommunityStackCardProps> = ({ stack, isMobileView = false }) => {
    const { protocols, products } = useDataStore();
    const cloneStack = useUserStore(state => state.cloneStack);
    const toggleUpvoteStack = useUserStore(state => state.toggleUpvoteStack);
    const upvotedStackIds = useUserStore(state => state.upvotedStackIds);
    const user = useUserStore(state => state.user);
    const { openProfileModal } = useUIStore();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

    const stackProtocols = React.useMemo(() =>
        stack.protocol_ids.map(id => protocols.find(p => p.id === id)).filter((p): p is Protocol => !!p)
    , [stack.protocol_ids, protocols]);

    const taggedProducts = React.useMemo(() => 
        (stack.productIds || []).map(id => products.find(p => p.id === id)).filter(Boolean) as Product[]
    , [stack.productIds, products]);
    
    const isUpvoted = upvotedStackIds.includes(stack.id);

    const primaryColor = stackProtocols.length > 0 ? CATEGORY_DETAILS[stackProtocols[0].categories[0]]?.color : '#4b5563';

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (animationDirection || stackProtocols.length < 2) return;
        setAnimationDirection('right');
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % stackProtocols.length);
            setAnimationDirection(null);
        }, 500); // Match CSS transition duration
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (animationDirection || stackProtocols.length < 2) return;
        setAnimationDirection('left');
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + stackProtocols.length) % stackProtocols.length);
            setAnimationDirection(null);
        }, 500); // Match CSS transition duration
    };
    
    const handleClone = (e: React.MouseEvent) => {
        e.stopPropagation();
        cloneStack(stack);
    };

    const handleUpvote = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleUpvoteStack(stack.id as string);
    }

    const getCardClass = (index: number) => {
        const total = stackProtocols.length;
        if (total < 4 && total > 0) { // Special logic for 3 or fewer cards to look good
            const position = (index - currentIndex + total) % total;
             if (animationDirection) {
                const isCurrentCard = index === currentIndex;
                if (isCurrentCard) return animationDirection === 'right' ? 'fly-out-left' : 'fly-out-right';
                
                const nextIndex = (currentIndex + 1) % total;
                const prevIndex = (currentIndex - 1 + total) % total;
                if (animationDirection === 'right' && index === nextIndex) return 'is-top';
                if (animationDirection === 'left' && index === prevIndex) return 'is-top';
             } else {
                if (position === 0) return 'is-top';
                if (position === 1) return 'is-next';
             }
             return 'is-hidden-bottom';
        }
        
        let position = (index - currentIndex + total) % total;

        if (animationDirection) {
            const isCurrentCard = index === currentIndex;
            if (isCurrentCard) {
                return animationDirection === 'right' ? 'fly-out-left' : 'fly-out-right';
            }
            
            if (animationDirection === 'right') {
                position = (position - 1 + total) % total;
            } else { // left
                position = (position + 1) % total;
            }
        }
        
        switch (position) {
            case 0: return 'is-top';
            case 1: return 'is-next';
            case 2: return 'is-back';
            default: return 'is-hidden-bottom';
        }
    };

    if (isMobileView) {
        return (
            <div className="simplified-card" style={{ borderColor: `${primaryColor}4D`}}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-title text-xl font-bold text-white">{stack.name}</h3>
                        <p className="text-sm text-gray-400">by {stack.author}</p>
                    </div>
                     <button
                        onClick={handleUpvote}
                        disabled={!user || user.isAnonymous}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors rounded-md p-1 px-2
                            ${isUpvoted ? 'text-white bg-blue-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
                            ${(!user || user.isAnonymous) ? 'cursor-not-allowed' : ''}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1.5 1.5 0 001.5 1.5h8.5a1.5 1.5 0 001.5-1.5V10.333a2.25 2.25 0 00-1.042-1.928L12.5 6.583V3.5a1.5 1.5 0 00-3 0v3.083L5.542 8.405a2.25 2.25 0 00-1.042 1.928z" /></svg>
                        {stack.upvotes}
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">{stack.description}</p>
                <div className="space-y-2 mb-4">
                     {stackProtocols.slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center gap-2 text-xs bg-gray-900/50 p-2 rounded-md">
                            <CategoryIcon category={p.categories[0]} className="w-4 h-4 flex-shrink-0" style={{ color: CATEGORY_DETAILS[p.categories[0]]?.color || '#FFF' }}/>
                            <span>{p.name}</span>
                        </div>
                     ))}
                     {stackProtocols.length > 3 && <p className="text-xs text-gray-500 text-center">+ {stackProtocols.length - 3} more</p>}
                </div>
                <button onClick={handleClone} className="w-full py-2 text-sm font-bold rounded-md" style={{ backgroundColor: primaryColor, color: 'black' }}>
                    Clone Stack
                </button>
            </div>
        )
    }

    return (
        <div
            className="h-[580px] flex flex-col hud-panel blueprint-bg !p-4"
            style={{ borderColor: `${primaryColor}80` }}
        >
            {/* Header */}
            <header className="flex-shrink-0 z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="font-hud flex items-center gap-2 text-sm font-bold uppercase tracking-widest border px-2 py-0.5" style={{ color: primaryColor, borderColor: `${primaryColor}4D` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" /><path d="M5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" /></svg>
                        <span>Community Stack</span>
                         {stack.isVerified && (
                             <div className="flex items-center text-green-300" title="Verified by biostack">
                                <span className="mx-1">|</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleUpvote}
                        disabled={!user || user.isAnonymous}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors rounded-md p-1 px-2
                            ${isUpvoted ? 'text-white bg-blue-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
                            ${(!user || user.isAnonymous) ? 'cursor-not-allowed' : ''}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1.5 1.5 0 001.5 1.5h8.5a1.5 1.5 0 001.5-1.5V10.333a2.25 2.25 0 00-1.042-1.928L12.5 6.583V3.5a1.5 1.5 0 00-3 0v3.083L5.542 8.405a2.25 2.25 0 00-1.042 1.928z" /></svg>
                        {stack.upvotes}
                    </button>
                </div>
                <div className="mb-8">
                    <div className="flex items-center gap-2">
                        <h3 className="font-hud text-2xl font-bold truncate" style={{ color: primaryColor }}>{stack.name}</h3>
                        {stack.forked_from_name && <ForkIcon />}
                    </div>
                    <div className="flex flex-col items-start">
                        <button
                            onClick={(e) => { e.stopPropagation(); stack.user_id && openProfileModal(stack.user_id); }}
                            disabled={!stack.user_id}
                            className="text-sm text-left text-gray-300 hover:text-blue-300 disabled:hover:text-gray-400 disabled:cursor-default"
                        >
                            by {stack.author}
                        </button>
                        {stack.forked_from_name && (
                            <p className="text-xs italic text-gray-500">
                                forked from "{stack.forked_from_name}"
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Flipper */}
            <div className="flex-grow my-4 relative">
                <div className="card-stack-container">
                    {stackProtocols.length > 0 ? (
                        stackProtocols.map((protocol, index) => (
                            <div 
                                key={protocol.id} 
                                className={`stacked-card ${getCardClass(index)}`}
                            >
                                <ProtocolCard protocol={protocol} />
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500">This stack is empty.</div>
                    )}
                </div>

                {stackProtocols.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="absolute left-[-2rem] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white text-2xl">&lsaquo;</button>
                        <button onClick={handleNext} className="absolute right-[-2rem] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white text-2xl">&rsaquo;</button>
                    </>
                )}
            </div>

            {/* Footer */}
            <footer className="flex-shrink-0 z-10">
                {taggedProducts.length > 0 && (
                    <div className="mb-3 p-2 bg-black/30 rounded-md">
                        <p className="text-xs text-gray-400 mb-2 font-semibold">Related Gear:</p>
                        <div className="flex items-center gap-2">
                            {taggedProducts.map(product => (
                                <a href={product.affiliateLink} key={product.id} target="_blank" rel="noopener noreferrer" title={product.name} className="block w-10 h-10 rounded-md overflow-hidden border-2 border-gray-600 hover:border-blue-400 transition-colors">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                <button
                    onClick={handleClone}
                    className="w-full py-3 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, color: 'black', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}
                >
                    Clone Stack
                </button>
            </footer>
        </div>
    );
};

export default CommunityStackCard;