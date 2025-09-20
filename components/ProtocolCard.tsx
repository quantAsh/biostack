import React, { useState, useRef, useCallback } from 'react';
import { Protocol } from '../types';
import ClassicCard from './cards/ClassicCard';
import AuraCard from './cards/AuraCard';
import HeroCard from './cards/HeroCard';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { Category } from '../types';

interface ProtocolCardProps {
  protocol: Protocol;
  isFeatured?: boolean;
  isCommunity?: boolean;
  onAddToStack?: (protocol: Protocol) => void;
  onRemoveFromStack?: (protocolId: string) => void;
  isStacked?: boolean;
  isDraggable?: boolean;
  isDuelCard?: boolean;
  duelHealth?: number;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, isFullScreen = false, isPlayable = false, onMobileAction }) => {
  const ownedNftProtocolIds = useUserStore(state => state.ownedNftProtocolIds);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { showDetails } = useUIStore();
  const { isAdmin } = useUserStore();

  const { isSpecialEdition, theme: protocolTheme, isNft } = protocol;
  const cardTheme = protocolTheme || 'classic';
  const isOwnedNft = isNft && ownedNftProtocolIds.includes(protocol.id);

  const categoryArray = Array.isArray(protocol.categories) ? protocol.categories : [protocol.categories];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isSpecialEdition || isNft) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  }, [isSpecialEdition, isNft]);
  
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    setIsFlipped(prev => !prev);
  }, []);
  
  const CardFace: React.FC<{ children: React.ReactNode; isBack?: boolean }> = ({ children, isBack = false }) => (
    <div className={`card-face absolute w-full h-full rounded-2xl overflow-hidden ${isBack ? 'card-back' : ''}`}>
        {children}
    </div>
  );
  
  // Map known protocol types to asset images (can expand later)
  const protocolImage = (() => {
    const name = (protocol.name || '').toLowerCase();
    const cats = (protocol.categories || []).toString().toLowerCase();
    if (name.includes('anatom') || cats.includes('anatom') || protocol.id === 'anatomical-model') {
      return '/assets/digitaltwin.jpeg';
    }
    return (protocol as any).imageUrl || undefined;
  })();

  const renderContent = (isBack = false) => {
    const props = { protocol: { ...protocol, imageUrl: protocolImage }, isBack, isOwnedNft, onMobileAction } as any;
    if (isSpecialEdition || isOwnedNft) {
      return <HeroCard {...props} />;
    }
    switch (cardTheme) {
      case 'classic': return <ClassicCard {...props} />;
      case 'aura': return <AuraCard {...props} />;
      case 'digital-human': return <ClassicCard {...props} />; // Fallback for digital human theme
      default: return <ClassicCard {...props} />;
    }
  };
  
  const cardHeightClass = isFullScreen ? 'h-full max-h-[600px]' : 'h-[450px]';

  return (
    <div 
      className={`protocol-card-container w-full ${cardHeightClass} ${isPlayable ? 'pointer-events-none' : ''}`}
      data-tour-id={`protocol-card-${protocol.id}`}
      data-category={categoryArray[0]} // For walkthrough targeting
    >
      <div 
        ref={cardRef} 
        onMouseMove={handleMouseMove} 
        onClick={isPlayable ? undefined : handleCardClick}
        className={`card w-full h-full relative ${!isPlayable ? 'cursor-pointer' : ''} ${isFlipped ? 'card-flipped' : ''} ${isSpecialEdition || isOwnedNft ? 'is-hero-card' : ''}`}
        data-tour-id={`protocol-card-${protocol.id}`}
      >
        <CardFace>{renderContent(false)}</CardFace>
        <CardFace isBack={true}>{renderContent(true)}</CardFace>
      </div>
    </div>
  );
};

export default React.memo(ProtocolCard);