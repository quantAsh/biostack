import React, { useState, useEffect, useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';

const GuidedSession: React.FC = () => {
  const activeGuidedProtocol = useUIStore(state => state.activeGuidedProtocol);
  const endGuidedSession = useUIStore(state => state.endGuidedSession);
  
  const totalDuration = 5 * 60; // 5 minutes
  const [time, setTime] = useState(totalDuration);
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [phaseTime, setPhaseTime] = useState(4);

  useEffect(() => {
    if (!activeGuidedProtocol) return;

    if (time <= 0) {
      endGuidedSession(true);
      return;
    }

    const timer = setInterval(() => {
      setTime(prev => prev - 1);
      setPhaseTime(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          setPhase(currentPhase => {
            switch (currentPhase) {
              case 'Inhale': return 'Hold';
              case 'Hold': return 'Exhale';
              case 'Exhale': return 'Hold After';
              case 'Hold After': return 'Inhale';
              default: return 'Inhale';
            }
          });
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [time, endGuidedSession, activeGuidedProtocol]);
  
  useEffect(() => {
    // Reset timer when protocol changes
    setTime(totalDuration);
    setPhase('Inhale');
    setPhaseTime(4);
  }, [activeGuidedProtocol]);

  const progress = useMemo(() => (1 - (time / totalDuration)) * 100, [time, totalDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPhaseText = () => {
      if(phase === 'Hold After') return 'Hold';
      return phase;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-md text-white p-8 text-center flex flex-col items-center">
        <h2 className="font-title text-3xl font-bold mb-2 text-cyan-300">Guided Session</h2>
        <p className="text-gray-400 mb-8">{activeGuidedProtocol?.name}</p>

        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                <circle 
                    cx="50" cy="50" r="45" 
                    stroke="#06B6D4" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ strokeDasharray: 283, strokeDashoffset: 283 - (283 * progress) / 100, transition: 'stroke-dashoffset 1s linear' }}
                />
            </svg>
            <div className="z-10">
                <p className="text-5xl font-bold text-cyan-400 transition-all duration-300">{phaseTime}</p>
                <p className="text-2xl font-semibold tracking-widest uppercase text-white transition-all duration-300">{getPhaseText()}</p>
            </div>
        </div>

        <p className="text-lg font-medium text-gray-300 mb-8">Total Time Remaining: {formatTime(time)}</p>

        <button
          onClick={() => endGuidedSession(false)}
          className="w-full bg-red-800/80 text-red-100 font-bold py-3 px-6 rounded-lg hover:bg-red-700/80 transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default GuidedSession;