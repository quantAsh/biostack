import React from 'react';
import { useUIStore } from '../stores/uiStore';
import { useDataStore } from '../stores/dataStore';
import { KaiIcon } from './KaiIcon';
import { VIEW_THEMES } from '../constants';

const CohortChannel: React.FC = () => {
    const { activeCohortId, setView } = useUIStore();
    const { protocols, journeys } = useDataStore();

    const journey = journeys.find(j => j.nftReward?.protocolId && protocols.find(p => p.id === j.nftReward.protocolId)?.cohortId === activeCohortId);
    const protocol = protocols.find(p => p.cohortId === activeCohortId);

    const theme = VIEW_THEMES['coaching'];

    const mockMessages = [
        { user: journey?.influencer?.name || 'Coach', text: "Welcome to the cohort, everyone! Ready to dive deep?", isCoach: true },
        { user: 'QuantumLeaper', text: "Excited to be here! Day 1 was intense but rewarding." },
        { user: 'SleepHacker_99', text: "The breathing techniques are a game-changer for my morning energy." },
        { user: journey?.influencer?.name || 'Coach', text: "Fantastic to hear. Remember, consistency is the key. Don't be afraid to push your limits, but always listen to your body.", isCoach: true },
        { user: 'Ben G.', text: "Anyone else struggling with the 2-minute cold shower? Any tips?" },
        { user: 'Dr. Anya Sharma', text: "Focus on your breath, Ben. Slow, deep exhales. It calms the vagus nerve and overrides the shock response. You've got this!" },
    ];
    
    if (!protocol || !journey) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-red-400">Error: Cohort Not Found</h2>
                <button onClick={() => setView('explore')} className="mt-4 px-4 py-2 bg-gray-700 rounded-lg">Go to Explore</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Header */}
            <header className={`bg-gray-900/80 backdrop-blur-md border-b ${theme.borderColor} p-4 flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <img src={journey.influencer?.image} alt={journey.influencer?.name} className="w-10 h-10 rounded-full border-2 border-cyan-400" />
                    <div>
                        <h2 className={`font-title text-xl font-bold ${theme.textColor}`}>Cohort: {protocol.name}</h2>
                        <p className="text-gray-400 text-sm">Led by {journey.influencer?.name}</p>
                    </div>
                </div>
                <button onClick={() => setView('explore')} className="bg-red-800/80 text-red-100 font-bold py-2 px-4 rounded-lg hover:bg-red-700/80 transition-colors text-sm">
                    Exit Channel
                </button>
            </header>

            {/* Chat Area */}
            <main className="flex-grow overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-4">
                {mockMessages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.isCoach ? '' : 'justify-end'}`}>
                        {msg.isCoach && <img src={journey.influencer?.image} alt={msg.user} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />}
                        <div className={`max-w-xl p-3 rounded-lg ${msg.isCoach ? 'bg-gray-800 text-gray-300' : 'bg-cyan-600 text-white'}`}>
                           <p className="font-semibold text-sm mb-1">{msg.user}</p>
                           <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
            </main>

            {/* Input Area */}
            <footer className={`bg-gray-900/80 backdrop-blur-md border-t ${theme.borderColor} p-4 flex-shrink-0`}>
                <div className="flex items-center gap-4 max-w-3xl mx-auto">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 transition"
                      disabled
                    />
                    <button
                      className="bg-cyan-500 text-black font-bold py-3 px-5 rounded-lg hover:bg-cyan-400 transition-colors disabled:bg-gray-600"
                      disabled
                    >
                      Send
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CohortChannel;