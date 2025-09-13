import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { Quest } from '../types';

const QuestsPanel: React.FC = () => {
    const { activeQuests, completedQuests, acceptQuest } = useUserStore();
    const { quests: allQuests } = useDataStore();
    const [acceptingQuestId, setAcceptingQuestId] = useState<string | null>(null);

    const availableQuests = allQuests.filter(
        q => !activeQuests.some(aq => aq.id === q.id) && !completedQuests.includes(q.id)
    );

    const handleAccept = (quest: Quest) => {
        if (acceptingQuestId) return; // Prevent double clicks
        setAcceptingQuestId(quest.id);
        setTimeout(() => {
            acceptQuest(quest);
            setAcceptingQuestId(null);
        }, 500); // Corresponds to animation time
    };

    return (
        <div className="hud-panel !p-4">
            <h3 className="font-hud text-xl font-bold text-gray-200 mb-4 tracking-widest">DAILY QUESTS</h3>
            <div className="space-y-3">
                {availableQuests.map(quest => (
                    <div 
                        key={quest.id}
                        className={`bg-gray-800/50 p-3 rounded-lg border border-gray-700 transition-all duration-500 ease-out ${acceptingQuestId === quest.id ? 'scale-95 opacity-0 h-0 !p-0 !m-0 overflow-hidden' : 'h-auto'}`}
                    >
                        <h4 className="font-semibold text-gray-200 text-sm">{quest.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{quest.description}</p>
                        <div className="flex justify-between items-center mt-3">
                            <div className="flex gap-3 text-xs">
                                <span className="font-bold text-yellow-300">+{quest.xpReward} XP</span>
                                <span className="font-bold text-green-300">+{quest.bioTokenReward} $BIO</span>
                            </div>
                            <button 
                                onClick={() => handleAccept(quest)} 
                                disabled={!!acceptingQuestId}
                                className="bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-xs hover:bg-blue-500 disabled:bg-gray-600"
                            >
                                {acceptingQuestId === quest.id ? '...' : 'Accept'}
                            </button>
                        </div>
                    </div>
                ))}
                {(availableQuests.length === 0 && activeQuests.length === 0) && (
                    <p className="text-xs text-center text-gray-500 py-4">No new quests today. Check back tomorrow!</p>
                )}
                 {activeQuests.length > 0 && availableQuests.length === 0 && (
                    <p className="text-xs text-center text-gray-500 py-4">You have active quests in your Intelligent Agenda.</p>
                )}
            </div>
        </div>
    );
};

export default QuestsPanel;
