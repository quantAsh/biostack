import React, { useState, useMemo } from 'react';
import { Journey, Difficulty, Protocol, Category } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { CATEGORY_DETAILS } from '../constants';
import { CategoryIcon } from './CategoryIcon';
import ProtocolCard from './ProtocolCard';

const difficultyOrder: Record<Difficulty, number> = {
  [Difficulty.Beginner]: 1,
  [Difficulty.Intermediate]: 2,
  [Difficulty.Advanced]: 3,
};

interface JourneyCardProps {
  journey: Journey,
  isActiveInStack?: boolean,
  isMobileView?: boolean;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey, isActiveInStack, isMobileView = false }) => {
  const { protocols } = useDataStore();
  const { startJourney, isPremium, enrollInJourney, journeyProgress, advanceJourneyDay, enrolledJourneyIds } = useUserStore();
  const openUpgradeModal = useUIStore(state => state.openUpgradeModal);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const journeyProtocols = useMemo(() => protocols.filter(p => journey.protocolIds.includes(p.id)), [protocols, journey.protocolIds]);
  const isEnrolled = enrolledJourneyIds.includes(journey.id);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (journey.isSpecialEdition) {
        enrollInJourney(journey);
    } else {
        if (!isPremium) {
            openUpgradeModal();
            return;
        }
        startJourney(journey);
    }
  };

  const PathIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
  );

  const ActiveJourneyDashboard = () => {
    const progress = journeyProgress[journey.id];
    if (!progress) return null;

    const durationInDays = parseInt(journey.duration, 10);
    const progressPercent = (progress.currentDay / durationInDays) * 100;
    const isSpecial = journey.isSpecialEdition;

    return (
        <div className={`bg-gradient-to-br from-gray-900 via-gray-900 ${isSpecial ? 'to-yellow-900/50 border-yellow-500/30' : 'to-teal-900/50 border-teal-500/30'} border rounded-2xl p-6 flex flex-col h-full`}>
            <div className="flex-grow flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4">
                    <div className={`flex items-center gap-2 text-sm font-bold ${isSpecial ? 'text-yellow-300 bg-yellow-900/50 border-yellow-500/50' : 'text-teal-300 bg-teal-900/50 border-teal-500/50'} border px-3 py-1 rounded-full`}>
                        <PathIcon />
                        <span className="font-hud tracking-widest">ACTIVE JOURNEY</span>
                    </div>
                </div>
                
                <h3 className="font-title text-2xl font-bold mb-2 text-white">{journey.name}</h3>

                {progress.completed ? (
                    <div className="my-auto text-center">
                        <h4 className="text-2xl font-bold text-green-400">Journey Complete!</h4>
                        <p className="text-gray-400">Congratulations on finishing your journey.</p>
                    </div>
                ) : (
                    <>
                         <div className="my-4">
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="text-sm font-semibold text-gray-300">Progress</p>
                                <p className={`text-sm font-bold ${isSpecial ? 'text-yellow-300' : 'text-teal-300'}`}>Day {progress.currentDay} of {durationInDays}</p>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2.5 border border-gray-700">
                                <div className={isSpecial ? 'golden-progress-bar-fill h-2' : 'bg-teal-500 h-2 rounded-full'} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>

                        <div className="mb-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
                            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Today's Protocols:</h4>
                            <div className="space-y-2">
                                {journeyProtocols.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 text-sm bg-gray-900/50 p-2 rounded-md">
                                        <CategoryIcon category={p.categories[0]} className="w-4 h-4 flex-shrink-0" style={{ color: CATEGORY_DETAILS[p.categories[0]]?.color || '#FFF' }}/>
                                        <span>{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => advanceJourneyDay(journey.id)}
                            className={`w-full mt-auto py-3 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-black ${isSpecial ? 'bg-yellow-500 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20' : 'bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/20'}`}
                        >
                            Complete Day & Advance
                        </button>
                    </>
                )}
            </div>
        </div>
    );
  };

  if(isActiveInStack) {
      return <ActiveJourneyDashboard />;
  }
  
  const baseColor = journey.isSpecialEdition ? 'yellow' : 'indigo';
  
  if (isMobileView) {
      return (
            <div className="simplified-card" style={{ borderColor: `var(--${baseColor}-500)`}}>
                {journey.isSpecialEdition && (
                    <div className={`inline-flex items-center gap-2 text-xs font-bold text-yellow-300 bg-yellow-900/50 border border-yellow-500/50 px-2 py-0.5 rounded-full mb-2`}>
                        <PathIcon />
                        <span className="font-hud tracking-widest">SPECIAL EDITION</span>
                    </div>
                )}
                <h3 className="font-title text-xl font-bold text-white">{journey.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{journey.description}</p>
                <div className="space-y-2 mb-4">
                     {journeyProtocols.slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center gap-2 text-xs bg-gray-900/50 p-2 rounded-md">
                            <CategoryIcon category={p.categories[0]} className="w-4 h-4 flex-shrink-0" style={{ color: CATEGORY_DETAILS[p.categories[0]]?.color || '#FFF' }}/>
                            <span>{p.name}</span>
                        </div>
                     ))}
                     {journeyProtocols.length > 3 && <p className="text-xs text-gray-500 text-center">+ {journeyProtocols.length - 3} more</p>}
                </div>
                 <button
                    onClick={handleStart}
                    disabled={isEnrolled}
                    className={`w-full mt-auto py-2 text-sm font-bold rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                        journey.isSpecialEdition 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    } disabled:bg-gray-700 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {isEnrolled ? 'Enrolled' : journey.isSpecialEdition ? `Enroll (${journey.enrollmentFee} $BIO)` : isPremium ? 'Start' : 'Unlock'}
                </button>
            </div>
      );
  }

  const missionParams = useMemo<{ difficulties: Difficulty[]; categories: Category[]; difficultyRange: string; }>(() => {
    if (journeyProtocols.length === 0) {
      return { difficulties: [], categories: [], difficultyRange: 'N/A' };
    }
    const difficulties = journeyProtocols.map(p => p.difficulty);
    const uniqueDifficulties = [...new Set(difficulties)];
    
    const sortedDifficulties = uniqueDifficulties.sort((a, b) => difficultyOrder[a] - difficultyOrder[b]);
    
    const difficultyRange = sortedDifficulties.length > 1 
        ? `${sortedDifficulties[0]} to ${sortedDifficulties[sortedDifficulties.length - 1]}`
        : sortedDifficulties[0];

    const allCategories = journeyProtocols.flatMap(p => p.categories);
    const uniqueCategories = [...new Set(allCategories)];

    return {
        difficulties: sortedDifficulties,
        categories: uniqueCategories.slice(0, 4),
        difficultyRange,
    };
  }, [journeyProtocols]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animationDirection || journeyProtocols.length < 2) return;
    setAnimationDirection('right');
    setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % journeyProtocols.length);
        setAnimationDirection(null);
    }, 500); // Match CSS transition duration
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animationDirection || journeyProtocols.length < 2) return;
    setAnimationDirection('left');
    setTimeout(() => {
        setCurrentIndex(prev => (prev - 1 + journeyProtocols.length) % journeyProtocols.length);
        setAnimationDirection(null);
    }, 500); // Match CSS transition duration
  };

  const getCardClass = (index: number) => {
    const total = journeyProtocols.length;
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

  return (
    <div 
        className={`h-[600px] bg-gradient-to-br from-gray-900 via-gray-900 to-${baseColor}-900/50 border border-${baseColor}-500/30 rounded-2xl p-6 flex flex-col lg:flex-row gap-8`}
        style={{ transformStyle: 'preserve-3d' }}
    >
        {/* Left Column: Details */}
        <div className="flex flex-col lg:w-1/2">
             <div className="flex-grow flex flex-col min-h-0">
                 {journey.isSpecialEdition ? (
                     <>
                        <div className="flex justify-between items-center mb-4">
                            <div className={`flex items-center gap-2 text-sm font-bold text-yellow-300 bg-yellow-900/50 border border-yellow-500/50 px-3 py-1 rounded-full`}>
                                <PathIcon />
                                <span className="font-hud tracking-widest">SPECIAL EDITION</span>
                            </div>
                        </div>
                        <h3 className="font-title text-3xl font-bold mb-1 text-white">{journey.name}</h3>
                        <p className="font-semibold text-yellow-400 mb-2">Led by {journey.influencer?.name}</p>
                    </>
                 ) : (
                     <>
                        <div className="flex justify-between items-center mb-4">
                            <div className={`flex items-center gap-2 text-sm font-bold text-indigo-300 bg-indigo-900/50 border border-indigo-500/50 px-3 py-1 rounded-full`}>
                                <PathIcon />
                                <span className="font-hud tracking-widest">JOURNEY</span>
                            </div>
                            <div className="font-mono text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">{journey.duration}</div>
                        </div>
                        <h3 className="font-title text-3xl font-bold mb-2 text-white">{journey.name}</h3>
                    </>
                 )}
                 <p className="text-gray-400 mb-6 text-sm flex-grow">{journey.description}</p>
            </div>

            {/* Mission Parameters */}
            <div className={`hud-panel !p-4 mt-auto border-${baseColor}-500/30`}>
                <h4 className={`font-hud text-lg font-bold mb-3 text-${baseColor}-300 tracking-widest`}>Mission Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-gray-400 uppercase">Protocols</p><p className="font-bold text-white">{journeyProtocols.length}</p></div>
                    <div><p className="text-xs text-gray-400 uppercase">Difficulty</p><p className="font-bold text-white">{missionParams.difficultyRange}</p></div>
                    <div className="col-span-2">
                         <p className="text-xs text-gray-400 uppercase mb-1">Key Categories</p>
                         <div className="flex flex-wrap gap-2">
                             {missionParams.categories.map(cat => (
                                 <div key={cat} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-black/40 border border-white/10" style={{ color: CATEGORY_DETAILS[cat]?.color }}><CategoryIcon category={cat} className="w-3 h-3"/><span>{cat}</span></div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
             <button
                onClick={handleStart}
                disabled={isEnrolled}
                className={`w-full mt-6 py-3 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-${baseColor}-500/20 z-10 ${
                    journey.isSpecialEdition 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                } disabled:bg-gray-700 disabled:opacity-70 disabled:shadow-none disabled:cursor-not-allowed`}
            >
                {isEnrolled ? 'Journey Enrolled' : journey.isSpecialEdition ? `Enroll for ${journey.enrollmentFee} $BIO` : isPremium ? 'Start Journey' : 'Unlock with Kai+'}
                {!isPremium && !journey.isSpecialEdition && !isEnrolled && (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>)}
            </button>
        </div>

        {/* Right Column: Protocol Preview Flipper */}
        <div className="flex-grow my-4 relative lg:w-1/2">
             <div className="card-stack-container">
                {journeyProtocols.length > 0 ? (
                    journeyProtocols.map((protocol, index) => (
                        <div 
                            key={protocol.id} 
                            className={`stacked-card ${getCardClass(index)}`}
                        >
                            <ProtocolCard protocol={protocol} />
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No protocols in this journey.</div>
                )}
            </div>

            {journeyProtocols.length > 1 && (
                <>
                    <button onClick={handlePrev} className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white text-2xl">&lsaquo;</button>
                    <button onClick={handleNext} className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white text-2xl">&rsaquo;</button>
                </>
            )}
        </div>
    </div>
  );
};

export default JourneyCard;