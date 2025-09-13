import React, { useState, useMemo } from 'react';
import { UserStack, Protocol } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import ProtocolCard from './ProtocolCard';
import { CATEGORY_DETAILS } from '../constants';

interface UserStackCardProps {
  stack: UserStack;
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

const UserStackCard: React.FC<UserStackCardProps> = ({ stack }) => {
    const { protocols } = useDataStore();
    const { removeMyStackItem } = useUserStore();
    const { openPublishModal } = useUIStore();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

    const stackProtocols = useMemo(() =>
        stack.protocol_ids.map(id => protocols.find(p => p.id === id)).filter((p): p is Protocol => !!p)
    , [stack.protocol_ids, protocols]);
    
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

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeMyStackItem(stack.instanceId);
    };

    const handlePublishFork = (e: React.MouseEvent) => {
        e.stopPropagation();
        openPublishModal(stack);
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };
    
    const getCardClass = (index: number) => {
        const total = stackProtocols.length;
        if (total === 0) return 'is-hidden-bottom';
        
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
    
    const cardHeight = isExpanded ? 'auto' : '450px';

    if (stackProtocols.length === 0) {
        return (
            <div className="h-[450px] hud-panel blueprint-bg !p-4 flex flex-col items-center justify-center text-center" style={{ borderColor: `${primaryColor}80` }}>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest border px-2 py-0.5 mb-4" style={{ color: primaryColor, borderColor: `${primaryColor}4D` }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" /><path d="M5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" /></svg>
                    <span>Cloned Stack</span>
                </div>
                <h3 className="font-title text-xl font-bold text-teal-300">{stack.name}</h3>
                <p className="text-sm text-gray-500 my-2">This cloned stack is currently empty.</p>
                <button onClick={handleExpandClick} className="w-full mt-4 py-3 text-sm font-bold rounded-md" style={{ backgroundColor: primaryColor, color: 'black' }}>Expand & Edit</button>
                <button onClick={handleRemove} className="mt-2 text-xs text-red-400 hover:underline">Remove Empty Stack</button>
            </div>
        );
    }
    
    return (
        <div 
            className="flex flex-col hud-panel blueprint-bg !p-4 transition-all duration-500"
            style={{ borderColor: `${primaryColor}80`, height: cardHeight }}
        >
            {/* Header */}
            <header className="flex-shrink-0 z-10 mb-2">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest border px-2 py-0.5 mb-2" style={{ color: primaryColor, borderColor: `${primaryColor}4D` }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" /><path d="M5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" /></svg>
                    <span>Cloned Stack</span>
                </div>
                 <div className="flex items-center gap-2">
                    <h3 className="font-title text-xl font-bold text-white truncate">{stack.name}</h3>
                    {stack.forked_from_name && <ForkIcon />}
                </div>
                {stack.forked_from_name ? (
                    <p className="text-xs text-gray-400 truncate italic">
                        forked from "{stack.forked_from_name}" (by {stack.author})
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 truncate">Cloned from original by {stack.author}</p>
                )}
            </header>

            {/* Flipper / Expanded View */}
            {!isExpanded ? (
                <div className="flex-grow my-0 relative flex items-center justify-center min-h-0">
                    <div className="card-stack-container" style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                        {stackProtocols.map((protocol, index) => (
                            <div 
                                key={protocol.id} 
                                className={`stacked-card ${getCardClass(index)}`}
                            >
                                <ProtocolCard protocol={protocol} />
                            </div>
                        ))}
                    </div>

                    {stackProtocols.length > 1 && (
                        <>
                            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white text-2xl">&lsaquo;</button>
                            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white text-2xl">&rsaquo;</button>
                        </>
                    )}
                </div>
            ) : (
                <div className="my-4 pt-4 border-t-2 border-dashed border-teal-500/30">
                    <div className="grid grid-cols-1 gap-y-10">
                        {stackProtocols.map(protocol => (
                            <ProtocolCard key={`expanded-${stack.instanceId}-${protocol.id}`} protocol={protocol} />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Footer */}
            <footer className="flex-shrink-0 z-10 space-y-2 text-sm font-bold mt-auto pt-2">
                 <button onClick={handleExpandClick} className="w-full py-3 rounded-md transition-colors" style={{ backgroundColor: primaryColor, color: 'black' }}>
                    {isExpanded ? 'Collapse Stack' : 'Expand Stack'}
                 </button>
                 <div className="flex gap-2">
                    <button onClick={handlePublishFork} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">Publish Fork</button>
                    <button onClick={handleRemove} className="w-full py-2 bg-gray-800 hover:bg-gray-700/50 border border-gray-700 text-red-400 rounded-md transition-colors">Remove</button>
                 </div>
            </footer>
        </div>
    );
};

export default UserStackCard;