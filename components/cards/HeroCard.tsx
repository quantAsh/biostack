import React, { useState, useCallback } from 'react';
import { Protocol, Difficulty } from '../../types';
import { useUserStore } from '../../stores/userStore';
import { useUIStore } from '../../stores/uiStore';
import { KaiIcon } from '../KaiIcon';

interface CardContentProps {
  protocol: Protocol;
  isBack?: boolean;
  isOwnedNft?: boolean;
  onMobileAction?: (action: 'skip' | 'add') => void;
}

const HeroCard: React.FC<CardContentProps> = ({ protocol, isBack = false, isOwnedNft = false, onMobileAction }) => {
  const { myStack, toggleStack, isPremium, walletAddress, mintHeroCard, mintedProtocols, unlockedPromoCards, startPacer, startPlayer } = useUserStore();
  const { showDetails, startCoachingSession, startGuidedSession, openUpgradeModal, openWimHofModal, viewCohortChannel, openArGuideModal } = useUIStore();
  
  const [isPoweringUp, setIsPoweringUp] = useState(false);

  const isInStack = React.useMemo(() => myStack.some(p => 'id' in p && p.id === protocol.id), [myStack, protocol.id]);
  const mintStatus = mintedProtocols[protocol.id];
  const isClaimed = unlockedPromoCards.includes(protocol.id);

  const { name, creator, originStory, communityTip, influencerImage, influencerSignature, hasGuidedSession, interactiveElement, isNft, cohortId, artist, forgeTier } = protocol;

  const handleStackClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInStack) {
      setIsPoweringUp(true);
      setTimeout(() => setIsPoweringUp(false), 800);
    }
    toggleStack(protocol);
  }, [isInStack, toggleStack, protocol]);

  const handleStartSessionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnedNft && cohortId) {
        viewCohortChannel(cohortId);
        return;
    }
    if (protocol.difficulty === Difficulty.Advanced && !isPremium) {
        openUpgradeModal();
        return;
    }
    switch (interactiveElement) {
      case 'pacer': startPacer(protocol); break;
      case 'player': startPlayer(protocol); break;
      case 'wim-hof-guided': openWimHofModal(); break;
      default:
        hasGuidedSession ? startGuidedSession(protocol) : startCoachingSession(protocol);
        break;
    }
  }, [protocol, isPremium, openUpgradeModal, interactiveElement, startPacer, startPlayer, openWimHofModal, hasGuidedSession, startGuidedSession, startCoachingSession, isOwnedNft, cohortId, viewCohortChannel]);

  const handleMint = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!walletAddress) {
      alert("Please sign in with your wallet first to mint an NFT.");
      return;
    }
    if (mintStatus && mintStatus.status !== 'minted') return;
    mintHeroCard(protocol);
  }, [walletAddress, mintStatus, mintHeroCard, protocol]);

  const MintButtonContent = () => {
    if (!mintStatus) return <>Mint NFT</>;
    switch (mintStatus.status) {
        case 'pending_confirmation': return <>Confirm in Wallet...</>;
        case 'minting': return <>Minting...</>;
        case 'minted': return <>View on OpenSea</>;
        default: return <>Mint NFT</>;
    }
  };
  
  const isMinting = mintStatus && (mintStatus.status === 'minting' || mintStatus.status === 'pending_confirmation');

  const ActionButtons = () => {
    if (onMobileAction) {
        return (
            <button 
                onClick={(e) => { e.stopPropagation(); toggleStack(protocol); }} 
                className={`mobile-card-add-button !border-yellow-400 !text-yellow-400 ${isInStack ? 'added' : ''}`}
            >
                <span className="add-text">Add to Stack</span>
                <span className="added-text">✓ In Stack</span>
            </button>
        );
    }
    return (
      <div className="absolute bottom-6 right-6 z-20 flex justify-end gap-2">
         {protocol.hasArGuide && (
            <button
                onClick={(e) => { e.stopPropagation(); openArGuideModal(protocol); }}
                title="Start AR Guide"
                className="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 backdrop-blur-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M15.5 2.75a.75.75 0 00-1.5 0v1.25a.75.75 0 001.5 0V2.75z" /><path fillRule="evenodd" d="M3.5 8a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.25A.75.75 0 013.5 8zM2 13.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 13.5z" clipRule="evenodd" /><path fillRule="evenodd" d="M16 17.5a.75.75 0 00-1.5 0v1.25a.75.75 0 001.5 0V17.5zM4.5 17.5a.75.75 0 01-1.5 0v-1.25a.75.75 0 011.5 0v1.25zM2.75 2.5a.75.75 0 000 1.5h1.25a.75.75 0 000-1.5H2.75zM17.25 2.5a.75.75 0 000 1.5h-1.25a.75.75 0 000-1.5h1.25z" clipRule="evenodd" /></svg>
                AR Guide
            </button>
        )}
        {isOwnedNft && cohortId ? (
            <button onClick={handleStartSessionClick} className="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-500">View Cohort Channel</button>
        ) : (
            <button onClick={handleStackClick} 
                data-tour-id="add-to-stack-button"
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm ${isInStack ? 'bg-amber-800/80 text-amber-100 border border-amber-600/50' : 'bg-yellow-400 hover:bg-yellow-300 text-black'}`}>
                {isInStack ? 'In Stack' : 'Add to Stack'}
            </button>
        )}
        {isClaimed ? (<div className="px-4 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white">Claimed</div>) : mintStatus?.status === 'minted' ? (<a href={mintStatus.openSeaUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-green-500 text-black hover:bg-green-400">View on OpenSea</a>) : (!isNft && <button onClick={handleMint} disabled={!walletAddress || isMinting} className="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed">{(isMinting) && (<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>)}<MintButtonContent /></button>)}
      </div>
    );
  };

  return (
    <div data-category={protocol.categories[0]} className={`relative w-full h-full rounded-2xl overflow-hidden ${isPoweringUp ? 'power-up' : ''}`} style={{ '--card-color-1': '#FFD700', '--card-color-2': '#F0C000', '--card-color-3': '#FFAA00' } as React.CSSProperties}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="hero-card-visuals"></div>
        {influencerImage && <img src={influencerImage} alt={`${creator} portrait`} className="influencer-portrait" />}
        {isPoweringUp && <div className="power-up-container effect-corner-burst"></div>}
      </div>

      <div className="relative z-10 flex flex-col h-full text-white">
        {isBack ? (
          <div className="flex flex-col h-full p-4">
            <h4 className="font-title text-lg font-bold text-white mb-2">Origin Story</h4>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 text-gray-300 leading-relaxed text-sm space-y-3 bg-black/30 p-3 rounded-lg border border-white/10"><p>{originStory}</p>{communityTip && (<div className="pt-2 border-t border-white/10"><h5 className="font-bold mb-1 text-cyan-400 text-xs uppercase tracking-wider">Community Tip</h5><p className="italic text-gray-400">"{communityTip}"</p></div>)}</div>
            <div className="mt-auto pt-3 text-center text-gray-500 text-xs animate-pulse">Tap to flip back</div>
          </div>
        ) : (
          <div className="relative flex flex-col h-full p-6">
            <div className="absolute top-4 left-4 z-30 flex flex-col space-y-2"><button onClick={(e) => { e.stopPropagation(); showDetails(protocol); }} title="Show Details" className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:bg-black/60 hover:text-white transition-all border border-white/10"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></button><button onClick={handleStartSessionClick} title="Start Session" className="relative w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-cyan-300 hover:bg-black/60 hover:text-white transition-all border border-white/10"><KaiIcon className="w-5 h-5" /></button></div>
            <div className="special-edition-badge">{isNft ? 'NFT Edition' : 'Special Edition'}</div>
            {forgeTier && (
              <div className={`forge-tier-badge tier-${forgeTier.toLowerCase()}`}>{forgeTier} Forge</div>
            )}
            <div className="mt-auto"><h3 className="font-title text-3xl font-bold tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>{name}</h3><p className="font-semibold text-lg" style={{ color: 'gold', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>by {creator}</p>{artist && <p className="text-xs" style={{ color: 'gold', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>Art by {artist}</p>}</div>
            {influencerSignature && <img src={influencerSignature} alt={`${creator} signature`} className="influencer-signature" />}
            <ActionButtons />
            {mintStatus?.status === 'minting' && mintStatus.txHash && (<a href={`https://sepolia.etherscan.io/tx/${mintStatus.txHash}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="absolute bottom-1 right-6 text-xs text-purple-300 hover:underline">View Transaction</a>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroCard;