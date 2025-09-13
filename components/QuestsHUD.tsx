import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { Quest } from '../types';

const QuestsHUD: React.FC = () => {
    const { activeQuests, completedQuests, acceptQuest } = useUserStore();
    const { quests: allQuests } = useDataStore();
    const [acceptingQuestId, setAcceptingQuestId] = useState<string | null>(null);

    const availableQuests = allQuests.filter(
        q => !activeQuests.some(aq => aq.id === q.id) && !completedQuests.includes(q.id)
    ).slice(0, 2); // Show a max of 2 in the HUD

    const handleAccept = (quest: Quest) => {
        if (acceptingQuestId) return;
        setAcceptingQuestId(quest.id);
        // Short delay for visual feedback
        setTimeout(() => {
            acceptQuest(quest);
            setAcceptingQuestId(null);
        }, 300);
    };
    
    if (availableQuests.length === 0) {
        return null; // Don't render if no quests are available
    }

    return (
        <div className="quests-hud">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Daily Quests</h4>
            <div className="space-y-2">
                {availableQuests.map(quest => (
                    <div 
                        key={quest.id}
                        className={`transition-all duration-300 ${acceptingQuestId === quest.id ? 'opacity-0' : 'opacity-100'}`}
                    >
                        <div className="flex justify-between items-center text-xs">
                            <p className="text-gray-300 flex-grow pr-2">{quest.title}</p>
                            <div className="flex-shrink-0 flex items-center gap-3">
                                <span className="font-bold text-yellow-300">+{quest.xpReward} XP</span>
                                <button 
                                    onClick={() => handleAccept(quest)} 
                                    className="text-cyan-300 bg-cyan-900/50 hover:bg-cyan-800/50 px-2 py-0.5 rounded-full font-bold"
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestsHUD;