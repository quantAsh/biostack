import React from 'react';
import { Tournament } from '../types';

const VitalsHUD: React.FC = () => {
    // Simulated values
    const hr = 60 + Math.floor(Math.random() * 10);
    const hrv = 45 + Math.floor(Math.random() * 15);
    const stress = 20 + Math.floor(Math.random() * 20);

    return (
        <div className="grid grid-cols-3 gap-2 mt-2 text-center font-mono">
            <div className="bg-black/40 p-1 rounded-md">
                <p className="text-xs text-red-400">HR</p>
                <p className="text-sm font-bold text-white">{hr}</p>
            </div>
            <div className="bg-black/40 p-1 rounded-md">
                <p className="text-xs text-green-400">HRV</p>
                <p className="text-sm font-bold text-white">{hrv}</p>
            </div>
            <div className="bg-black/40 p-1 rounded-md">
                <p className="text-xs text-yellow-400">Stress</p>
                <p className="text-sm font-bold text-white">{stress}</p>
            </div>
        </div>
    );
};

const LiveMatchCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
    if (!tournament.isLive || !tournament.featuredMatch || !tournament.casters) {
        return null;
    }

    const [player1, player2] = tournament.featuredMatch.players;

    return (
        <div className="arena-sub-panel !border-yellow-400/50 !bg-yellow-900/10">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-yellow-300 bg-yellow-900/50 border border-yellow-500/50 px-3 py-1 rounded-full animate-pulse">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                    <span className="font-hud tracking-widest">LIVE NOW</span>
                </div>
                <h3 className="font-title text-2xl font-bold text-white mt-3">{tournament.name} - Finals</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Player 1 */}
                <div className="text-center">
                    <h4 className="text-lg font-bold text-white">{player1.displayName}</h4>
                    <p className="text-sm text-gray-400">Rank: Diamond I</p>
                    <VitalsHUD />
                </div>
                {/* Player 2 */}
                <div className="text-center">
                    <h4 className="text-lg font-bold text-white">{player2.displayName}</h4>
                    <p className="text-sm text-gray-400">Rank: Gold III</p>
                    <VitalsHUD />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700/50 text-center">
                <p className="text-xs text-gray-400">Commentary by</p>
                <p className="text-sm font-semibold text-white">
                    <span className="text-cyan-300">{tournament.casters.strategist}</span> & <span className="text-purple-300">{tournament.casters.analyst}</span>
                </p>
            </div>
            
            <a href={tournament.streamLink} target="_blank" rel="noopener noreferrer" className="block w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-500 transition-colors text-center font-hud tracking-wider">
                WATCH LIVE ON TWITCH
            </a>
        </div>
    );
};

export default LiveMatchCard;