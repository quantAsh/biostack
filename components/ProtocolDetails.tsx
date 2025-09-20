import React, { useMemo } from 'react';
import { CATEGORY_DETAILS } from '../constants';
import CardGraphic from './CardGraphic';
import { CategoryIcon } from './CategoryIcon';
import { useUIStore } from '../stores/uiStore';
import { useTheme } from './ThemeContext';
import { useEffect } from 'react';
import { useDataStore } from '../stores/dataStore';


const ProtocolDetails: React.FC = () => {
  // Use individual selectors to avoid recreating an object on every store change
  const detailedProtocol = useUIStore(state => state.detailedProtocol);
  const closeDetails = useUIStore(state => state.closeDetails);
  const isDetailsFullScreen = useUIStore(state => state.isDetailsFullScreen);
  const { communityStacks, journeys } = useDataStore();
  const { theme, setTheme } = useTheme();

  // Apply protocol theme when details open. Use effect so we don't set state during render
  // and avoid infinite update loops. Capture previous theme in a ref and restore on unmount.
  const prevThemeRef = React.useRef<null | string>(null);
  useEffect(() => {
    if (!detailedProtocol) return;
    const protocolTheme = (detailedProtocol as any).theme;
    if (protocolTheme && protocolTheme !== theme) {
      // Capture previous theme once
      prevThemeRef.current = theme;
      setTheme(protocolTheme);
    }
    return () => {
      if (prevThemeRef.current) {
        setTheme(prevThemeRef.current as any);
        prevThemeRef.current = null;
      }
    };
    // We intentionally omit `theme` from deps to avoid re-running when the theme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailedProtocol?.id, setTheme]);

  if (!detailedProtocol) return null;

  const { name, categories, difficulty, duration, creator, benefits, instructions, originStory, description, bioScore } = detailedProtocol;
  const primaryColor = CATEGORY_DETAILS[categories[0]]?.color || '#00FFFF';

  const includingStacks = useMemo(() => {
    return communityStacks.filter(s => s.protocol_ids.includes(detailedProtocol.id)).slice(0, 3);
  }, [detailedProtocol.id, communityStacks]);

  const includingJourneys = useMemo(() => {
    return journeys.filter(j => j.protocolIds.includes(detailedProtocol.id));
  }, [detailedProtocol.id, journeys]);
  
  const handleJourneyClick = (journeyId: string) => {
      closeDetails();
      useUIStore.getState().setView('explore');
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center ${isDetailsFullScreen ? '' : 'p-4'}`}
      onClick={closeDetails}
    >
      <div 
        className={`relative bg-gray-900/80 border border-gray-700/50 w-full flex flex-col overflow-hidden
          ${isDetailsFullScreen ? 'h-full rounded-none' : 'rounded-2xl max-w-md md:max-w-2xl max-h-[90vh]'}
        `}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 pointer-events-none">
            <CardGraphic protocol={detailedProtocol} theme="classic" />
        </div>
        
        <div className="relative p-6 md:p-8 flex-shrink-0">
          <h2 className="font-title text-3xl font-extrabold mb-2 tracking-tight" style={{ color: primaryColor }}>{name}</h2>
          <p className="text-gray-400 mb-4">{description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-gray-800/60 border border-gray-600" style={{ color: CATEGORY_DETAILS[cat].color }}>
                <CategoryIcon category={cat} className="w-3.5 h-3.5"/>
                <span>{cat}</span>
              </div>
            ))}
          </div>
          <div className="text-sm grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-300">
            <div><strong>Difficulty:</strong> <span style={{ color: primaryColor }}>{difficulty}</span></div>
            <div><strong>Duration:</strong> <span style={{ color: primaryColor }}>{duration}</span></div>
            {bioScore && <div><strong>Bio-Score:</strong> <span style={{ color: primaryColor }}>{bioScore}</span></div>}
            <div><strong>Creator:</strong> <span style={{ color: primaryColor }}>{creator}</span></div>
          </div>
        </div>

        <div className="relative overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 bg-black/20">
          <div className="space-y-6">
            <div>
              <h3 className="font-title text-lg font-bold mb-2" style={{ color: primaryColor }}>Benefits</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-title text-lg font-bold mb-2" style={{ color: primaryColor }}>Instructions</h3>
              <ul className="list-decimal list-inside space-y-2 text-gray-300">
                {instructions.map((inst, i) => <li key={i}>{inst}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-title text-lg font-bold mb-2" style={{ color: primaryColor }}>Origin Story</h3>
              <p className="text-gray-400 leading-relaxed">{originStory}</p>
            </div>

            {includingStacks.length > 0 && (
                <div>
                    <h3 className="font-title text-lg font-bold mb-2" style={{ color: primaryColor }}>Featured In Community Stacks</h3>
                    <div className="space-y-2">
                        {includingStacks.map(stack => (
                            <div key={stack.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <p className="font-semibold text-blue-300 text-sm">{stack.name}</p>
                                <p className="text-xs text-gray-500">by {stack.author} &bull; {stack.upvotes} upvotes</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {includingJourneys.length > 0 && (
                 <div>
                    <h3 className="font-title text-lg font-bold mb-2" style={{ color: primaryColor }}>Part of Official Journeys</h3>
                     <div className="space-y-2">
                        {includingJourneys.map(journey => (
                            <button key={journey.id} onClick={() => handleJourneyClick(journey.id)} className="w-full text-left bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors">
                                <p className="font-semibold text-blue-300 text-sm">{journey.name}</p>
                                <p className="text-xs text-gray-500">{journey.duration}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

          </div>
        </div>

        <button onClick={closeDetails} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ProtocolDetails;