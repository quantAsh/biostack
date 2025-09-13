import React, { useState } from 'react';
import { Protocol, Difficulty } from '../../types';
import { CATEGORY_DETAILS } from '../../constants';
import CardGraphic from '../CardGraphic';
import { useUserStore } from '../../stores/userStore';
import { useUIStore } from '../../stores/uiStore';
import { KaiIcon } from '../KaiIcon';

interface CardContentProps {
  protocol: Protocol;
  isBack?: boolean;
  isOwnedNft?: boolean;
  onMobileAction?: (action: 'skip' | 'add') => void;
}

const AuraCard: React.FC<CardContentProps> = ({ protocol, isBack = false, onMobileAction }) => {
  const myStack = useUserStore(state => state.myStack);
  const toggleStack = useUserStore(state => state.toggleStack);
  const isPremium = useUserStore(state => state.isPremium);
  const startPacer = useUserStore(state => state.startPacer);
  const startPlayer = useUserStore(state => state.startPlayer);
  
  const showDetails = useUIStore(state => state.showDetails);
  const startCoachingSession = useUIStore(state => state.startCoachingSession);
  const startGuidedSession = useUIStore(state => state.startGuidedSession);
  const openUpgradeModal = useUIStore(state => state.openUpgradeModal);
  const openWimHofModal = useUIStore(state => state.openWimHofModal);
  const openArGuideModal = useUIStore(state => state.openArGuideModal);

  const [isPoweringUp, setIsPoweringUp] = useState(false);

  const isInStack = React.useMemo(() => myStack.some(p => 'id' in p && p.id === protocol.id), [myStack, protocol.id]);

  const { name, categories, difficulty, duration, originStory, communityTip, bioScore, isCommunity, isPersonalized, isShared, hasGuidedSession, interactiveElement } = protocol;
  const primaryColor = CATEGORY_DETAILS[categories[0]]?.color || '#00FFFF';
  const secondaryColor = CATEGORY_DETAILS[categories[1]]?.color || primaryColor;
  const tertiaryColor = CATEGORY_DETAILS[categories[2]]?.color || secondaryColor;

  const handleStackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInStack) {
      setIsPoweringUp(true);
      setTimeout(() => setIsPoweringUp(false), 800);
    }
    toggleStack(protocol);
  };
  
  const handleStartSessionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  return (
    <div data-category={protocol.categories[0]} className={`card-inner font-hud relative w-full h-full rounded-2xl overflow-hidden bg-black border-2 border-cyan-300/20 ${isPoweringUp ? 'power-up' : ''}`} style={{'--card-color-1': primaryColor, '--card-color-2': secondaryColor, '--card-color-3': tertiaryColor} as React.CSSProperties}>
       <div className="absolute inset-0 pointer-events-none opacity-40"><CardGraphic protocol={protocol} theme="aura" /></div>
       <div className="absolute inset-0 foil-layer energy"></div>
       <div className={`absolute -inset-px rounded-2xl ${isInStack ? 'ring-2' : 'ring-0'} ring-offset-2 ring-offset-black ring-[var(--card-color-1)] transition-all duration-300`}></div>
       <div className="absolute inset-0 p-2 pointer-events-none"><div className="w-full h-full border-2 border-cyan-300/20" style={{clipPath: 'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))'}}></div></div>

        <div className="relative z-10 flex flex-col p-4 h-full">
            {!isBack ? (
                <>
                    <div className="absolute top-4 left-4 z-30 flex flex-row space-y-0 space-x-2"><button onClick={(e) => { e.stopPropagation(); showDetails(protocol); }} title="Show Details" className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:bg-black/60 hover:text-white transition-all border border-white/10"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></button><button onClick={handleStartSessionClick} title="Start Session" className="relative w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-cyan-300 hover:bg-black/60 hover:text-white transition-all border border-white/10"><KaiIcon className="w-5 h-5" />{protocol.difficulty === Difficulty.Advanced && !isPremium && (<span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>)}</button></div>
                    <div className="absolute top-4 right-4 text-right"><p className="text-xs uppercase text-cyan-300 tracking-widest">Bio-Score</p><p className="font-bold text-3xl text-white" style={{textShadow: `0 0 10px ${primaryColor}`}}>{bioScore}</p></div>

                    <div className="flex-grow flex flex-col items-center justify-center text-center">{isCommunity && <div className="text-xs font-bold text-teal-300 mb-2 tracking-widest">🧪 COMMUNITY</div>}{isPersonalized && !isShared && <div className="text-xs font-bold text-purple-300 mb-2 tracking-widest">🧬 PERSONALIZED</div>}{isShared && <div className="text-xs font-bold text-green-300 mb-2 tracking-widest">🌎 SHARED</div>}<h3 className="font-bold text-3xl tracking-wider uppercase" style={{textShadow: `0 0 10px ${primaryColor}`}}>{name}</h3></div>

                    <div className="mt-auto">
                        <div className="flex flex-wrap justify-start gap-2 mb-3">{categories.slice(0, 3).map(cat => (<div key={cat} className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-sm bg-black/50 border border-cyan-300/20" style={{ color: CATEGORY_DETAILS[cat].color }}><span>{cat}</span></div>))}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-cyan-300">
                            <div className="bg-black/50 border border-cyan-300/20 px-2 py-1.5"><span className="font-medium text-cyan-400 text-[10px] uppercase tracking-wider">Difficulty</span><p className="font-bold truncate text-base" style={{color: primaryColor}}>{difficulty}</p></div>
                            <div className="bg-black/50 border border-cyan-300/20 px-2 py-1.5"><span className="font-medium text-cyan-400 text-[10px] uppercase tracking-wider">Duration</span><p className="font-bold truncate text-base" style={{color: primaryColor}}>{duration}</p></div>
                        </div>
                        {onMobileAction ? (
                             <button onClick={(e) => { e.stopPropagation(); toggleStack(protocol); }} className={`mobile-card-add-button ${isInStack ? 'added' : ''}`}>
                                <span className="add-text">Add to Stack</span>
                                <span className="added-text">✓ In Stack</span>
                            </button>
                        ) : (
                            <div className={`grid gap-2 ${protocol.hasArGuide ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <button onClick={handleStackClick} data-tour-id="add-to-stack-button" className={`add-to-stack-btn w-full py-2.5 text-sm font-bold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${isInStack ? 'bg-red-700 hover:bg-red-600 text-red-100 border border-red-500' : 'bg-cyan-400 hover:bg-cyan-300 text-black'}`}>{isInStack ? 'In Stack' : 'Add to Stack'}</button>
                                {protocol.hasArGuide && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openArGuideModal(protocol); }}
                                        title="Start AR Guide"
                                        className="py-2.5 text-sm font-bold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M15.5 2.75a.75.75 0 00-1.5 0v1.25a.75.75 0 001.5 0V2.75z" /><path fillRule="evenodd" d="M3.5 8a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.25A.75.75 0 013.5 8zM2 13.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 13.5z" clipRule="evenodd" /><path fillRule="evenodd" d="M16 17.5a.75.75 0 00-1.5 0v1.25a.75.75 0 001.5 0V17.5zM4.5 17.5a.75.75 0 01-1.5 0v-1.25a.75.75 0 011.5 0v1.25zM2.75 2.5a.75.75 0 000 1.5h1.25a.75.75 0 000-1.5H2.75zM17.25 2.5a.75.75 0 000 1.5h-1.25a.75.75 0 000-1.5h1.25z" clipRule="evenodd" /></svg>
                                        AR Guide
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-lg text-cyan-300 uppercase tracking-wider">Origin Story</h4></div><div className="flex-grow overflow-y-auto custom-scrollbar pr-2 text-cyan-200/80 leading-relaxed text-sm space-y-3 bg-black/50 p-3 border border-cyan-300/20"><p>{originStory}</p>{communityTip && (<div className="pt-2 border-t border-cyan-300/20"><h5 className="font-bold mb-1 text-yellow-400 flex items-center gap-2 text-xs uppercase tracking-wider">Community Tip</h5><p className="italic text-cyan-200/70">"{communityTip}"</p></div>)}</div><div className="mt-auto pt-3 text-center text-cyan-400/50 text-xs animate-pulse">Tap to flip back</div></div>
            )}
        </div>
        {isPoweringUp && <div className="power-up-container effect-corner-burst"></div>}
    </div>
  );
};

export default AuraCard;