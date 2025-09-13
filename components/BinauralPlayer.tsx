import React from 'react';
import { useUserStore } from '../stores/userStore';
import { audioService } from '../services/audioService';

const BinauralPlayer: React.FC = () => {
    const { activePlayer, setPlayerFrequency, stopPlayer } = useUserStore();
    const protocol = activePlayer?.protocol;
    const playingFrequency = activePlayer?.playingFrequency;

    if (!protocol || !protocol.audioOptions) return null;
    
    const handlePlay = (frequency: number) => {
        if (playingFrequency === frequency) {
            // It's already playing, so stop it
            setPlayerFrequency(null);
            audioService.stop();
        } else {
            setPlayerFrequency(frequency);
            audioService.createBeats(100, frequency); // Using a base of 100Hz
            audioService.play();
        }
    };
    
    const handleStop = () => {
        stopPlayer();
    };

    return (
        <div className="bg-black/80 backdrop-blur-md border-2 border-cyan-300/30 rounded-2xl p-6 my-8 mx-auto max-w-md font-hud text-center">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-cyan-300 uppercase tracking-widest text-sm">Active Player</p>
                    <h3 className="font-title text-2xl font-bold text-white">{protocol.name}</h3>
                </div>
                <button onClick={handleStop} className="text-sm font-semibold bg-red-800/80 text-red-100 px-3 py-1.5 rounded-md hover:bg-red-700/80">
                    Stop
                </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {protocol.audioOptions.map(option => (
                    <button 
                        key={option.name}
                        onClick={() => handlePlay(option.frequency)}
                        className={`p-4 rounded-lg border-2 transition-colors ${playingFrequency === option.frequency ? 'bg-cyan-400/30 border-cyan-300' : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'}`}
                    >
                        <p className="font-bold text-lg text-white">{option.name}</p>
                        <p className="text-xs text-cyan-300">{option.frequency} Hz</p>
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Use headphones for the best effect.</p>
        </div>
    );
};

export default BinauralPlayer;
