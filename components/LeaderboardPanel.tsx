import React from 'react';
import { useUserStore } from '../stores/userStore';
import { LeaderboardUser } from '../types';
import { useUIStore } from '../stores/uiStore';
import { VIEW_THEMES } from '../constants';
import { useDataStore } from '../stores/dataStore';

// In a real application, this would be fetched from the backend
const mockLeaderboard: LeaderboardUser[] = [
    { id: 'user-anya-sharma', name: 'Dr. Anya Sharma', level: 22, xp: 12500, isKeyContributor: true },
    { id: 'user-ben-g', name: 'Ben G.', level: 20, xp: 10850 },
    { id: 'user-sleephacker-99', name: 'SleepHacker_99', level: 18, xp: 9200, isKeyContributor: true },
    { id: 'user_4', name: 'QuantumLeaper', level: 17, xp: 8550 },
    { id: 'user_5', name: 'KetoKarnivore', level: 15, xp: 6500 },
    { id: 'user_6', name: 'ZenMaster', level: 13, xp: 4800 },
    { id: 'dev-super-user', name: 'Super User (Admin)', level: 12, xp: 4000 },
    { id: 'user_7', name: 'CardioKing', level: 10, xp: 2800 },
];


const LeaderboardPanel: React.FC = () => {
    const { user, level, displayName } = useUserStore();
    const { openProfileModal, openStakeModal } = useUIStore();
    const theme = VIEW_THEMES['explore'];
    const { allUsers } = useDataStore(); // Assuming allUsers includes necessary profile info

    return (
        <div className="hud-panel !border-blue-500/80">
            <h3 className={`font-hud text-2xl font-bold mb-4 ${theme.textColor}`}>Top Biohackers</h3>
            <div className="space-y-3">
                {mockLeaderboard.sort((a,b) => b.xp - a.xp).map((leader, index) => {
                    const isCurrentUser = user?.uid === leader.id;
                    const fullProfile = allUsers.find(u => u.id === leader.id);

                    return (
                        <div key={leader.id} className={`p-3 rounded-lg flex items-center gap-3 text-sm ${isCurrentUser ? 'bg-blue-500/20 border-2 border-blue-400' : 'bg-gray-800/50'}`}>
                            <span className="font-mono text-gray-500 w-6 text-center flex-shrink-0">{index + 1}</span>
                            
                            <div className="w-5 h-5 flex-shrink-0">
                                {leader.isKeyContributor && (
                                <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white" title="KAIROS Key Contributor">
                                    K
                                </div>
                                )}
                            </div>
                            
                            <button
                                onClick={() => openProfileModal(leader.id)}
                                className={`font-semibold text-left truncate flex-grow ${isCurrentUser ? 'text-white' : 'text-gray-300 hover:text-blue-300'}`}
                            >
                                {isCurrentUser ? displayName : leader.name}
                            </button>
                            
                            <div className="flex items-baseline justify-end flex-shrink-0 w-20">
                                <span className="font-mono text-xs text-yellow-300">LVL {leader.level}</span>
                            </div>
                             {!isCurrentUser && fullProfile && (
                                <button
                                    onClick={() => openStakeModal(fullProfile)}
                                    className="text-xs bg-purple-600 text-white font-bold py-1 px-2 rounded-md hover:bg-purple-500"
                                    title={`Stake $BIO on ${leader.name}`}
                                >
                                    Stake
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaderboardPanel;