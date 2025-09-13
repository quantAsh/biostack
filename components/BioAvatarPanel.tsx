import React from 'react';

const BioAvatarPanel: React.FC = () => {
    const evolutionaryTraits = [
        { name: "Circadian Harmony", unlocked: true },
        { name: "Metabolic Flexibility", unlocked: true },
        { name: "Cognitive Clarity", unlocked: false },
        { name: "Stress Resilience", unlocked: false },
        { name: "Grandmaster Forger", unlocked: false },
    ];

    return (
        <div className="hud-panel !p-4 !border-purple-500/30">
            <h3 className="font-hud text-xl font-bold text-gray-200 mb-4 tracking-widest">BIO-AVATAR</h3>
            <div className="grid grid-cols-2 gap-4 items-center">
                {/* Left: Avatar Placeholder */}
                <div className="aspect-square bg-black/30 rounded-lg border-2 border-dashed border-purple-500/50 flex items-center justify-center">
                    <p className="text-purple-300/50 text-sm text-center">AVATAR RENDERING OFFLINE</p>
                </div>

                {/* Right: Traits */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-300 text-sm">Evolutionary Traits</h4>
                    {evolutionaryTraits.map(trait => (
                        <div key={trait.name} className={`flex items-center gap-2 p-2 rounded-md text-xs ${trait.unlocked ? 'bg-gray-800/50' : 'bg-gray-900/50'}`}>
                            {trait.unlocked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-purple-400 flex-shrink-0"><path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .75.75V4h-1.5V2.5A.75.75 0 0 1 8 1.75ZM8.75 4v1.282A2.75 2.75 0 0 1 11.25 8a2.75 2.75 0 0 1-2.5 2.718V12h1.5a.75.75 0 0 1 0 1.5H8.75V15a.75.75 0 0 1-1.5 0v-1.5H4.5a.75.75 0 0 1 0-1.5H6v-1.282A2.75 2.75 0 0 1 3.5 8a2.75 2.75 0 0 1 2.5-2.718V4H4.5a.75.75 0 0 1 0-1.5H6v-.5A.75.75 0 0 1 6.75 2h-1.5a.75.75 0 0 1-.75-.75Zm-3 6.5A1.25 1.25 0 1 0 8 11.75 1.25 1.25 0 0 0 5.75 13Z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-gray-600 flex-shrink-0"><path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7 5a1 1 0 0 1 1-1h.008a1 1 0 0 1 1 1v2.373A2.5 2.5 0 0 1 11.5 10a1 1 0 1 1-2 0 1.5 1.5 0 0 0-3 0 1 1 0 0 1-2 0c0-.89.448-1.7.94-2.182A.5.5 0 0 0 6 7.373V5Z" clipRule="evenodd" /></svg>
                            )}
                            <span className={trait.unlocked ? 'text-gray-300 font-semibold' : 'text-gray-500'}>{trait.name}</span>
                        </div>
                    ))}
                </div>
            </div>
             <p className="text-xs text-gray-500 mt-3 text-center">Your Bio-Avatar evolves as you hit milestones, creating a unique, ownable digital identity.</p>
        </div>
    );
};

export default BioAvatarPanel;