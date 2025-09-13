import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../stores/uiStore';

const WimHofSessionModal: React.FC = () => {
    const { closeWimHofModal } = useUIStore();
    const [stage, setStage] = useState<'intro' | 'breathing' | 'cold' | 'done'>('intro');
    const [round, setRound] = useState(1);
    const [breathCount, setBreathCount] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [holdTime, setHoldTime] = useState(0);
    const [coldTime, setColdTime] = useState(0);

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (stage === 'breathing' && isHolding) {
            timerRef.current = window.setInterval(() => setHoldTime((t: number) => t + 1), 1000);
        } else if (stage === 'cold') {
            timerRef.current = window.setInterval(() => setColdTime((t: number) => t + 1), 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stage, isHolding]);

    const handleBreathClick = () => {
        if (breathCount < 30) {
            setBreathCount(c => c + 1);
        } else {
            setIsHolding(true);
        }
    };
    
    const handleNextRound = () => {
        if (round < 3) {
            setRound(r => r + 1);
            setBreathCount(0);
            setIsHolding(false);
            setHoldTime(0);
        } else {
            setStage('cold');
        }
    };
    
    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    const BreathingStage = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Breathing: Round {round}/3</h3>
            {!isHolding ? (
                <>
                    <p className="text-gray-400 mb-6">Click the circle for each of the 30 deep breaths.</p>
                    <button onClick={handleBreathClick} className="relative w-48 h-48 rounded-full border-4 border-cyan-300/50 flex items-center justify-center transition-transform hover:scale-105">
                        <div className="absolute w-full h-full bg-cyan-500/20 rounded-full animate-ping"></div>
                        <span className="text-5xl font-bold">{breathCount}</span>
                    </button>
                </>
            ) : (
                <>
                    <p className="text-gray-400 mb-6">Hold your breath on the exhale. Relax.</p>
                    <div className="w-48 h-48 rounded-full bg-indigo-500/20 border-4 border-indigo-400/50 flex items-center justify-center">
                        <span className="text-5xl font-mono font-bold">{formatTime(holdTime)}</span>
                    </div>
                    <button onClick={handleNextRound} className="mt-6 bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg">
                        {round < 3 ? "Recovery Breath & Next Round" : "Finish Breathing"}
                    </button>
                </>
            )}
        </div>
    );
    
    const ColdStage = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Cold Exposure</h3>
             <p className="text-gray-400 mb-6">Begin your cold shower or ice bath. Focus on your breath.</p>
             <div className="w-48 h-48 rounded-full bg-blue-500/20 border-4 border-blue-400/50 flex items-center justify-center">
                <span className="text-5xl font-mono font-bold">{formatTime(coldTime)}</span>
            </div>
             <button onClick={() => setStage('done')} className="mt-6 bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg">
                Finish Session
            </button>
        </div>
    );

    return (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-yellow-400/50 rounded-2xl w-full max-w-md text-white p-8 relative shadow-2xl">
                <h2 className="font-title text-3xl font-extrabold text-yellow-300 mb-4 text-center">Wim Hof Guided Session</h2>
                
                {stage === 'intro' && (
                    <div className="text-center">
                        <p className="mb-6">This session has two parts: 3 rounds of guided breathing, followed by a cold exposure timer. Ensure you are in a safe, comfortable place. Never practice near water.</p>
                        <button onClick={() => setStage('breathing')} className="bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg text-lg">
                            Begin Breathing
                        </button>
                    </div>
                )}
                
                {stage === 'breathing' && <BreathingStage />}
                {stage === 'cold' && <ColdStage />}

                {stage === 'done' && (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">Session Complete!</h3>
                        <p>Well done. Take a moment to feel the effects.</p>
                        <p className="text-sm text-gray-400 mt-2">Round 1 Hold: {formatTime(holdTime)} | Cold Exposure: {formatTime(coldTime)}</p>
                        <button onClick={closeWimHofModal} className="mt-6 bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg">
                            Close
                        </button>
                    </div>
                )}
                
                <button onClick={closeWimHofModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default WimHofSessionModal;