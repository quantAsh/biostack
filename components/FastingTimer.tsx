import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Protocol } from '../types';

interface FastingTimerProps {
  protocol: Protocol;
  startTime: number;
}

const parseDurationHours = (durationStr: string): number => {
  const match = durationStr.match(/(\d+)-Hour/);
  return match ? parseInt(match[1], 10) : 0;
};

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const FastingTimer: React.FC<FastingTimerProps> = ({ protocol, startTime }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState((Date.now() - startTime) / 1000);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      setElapsedSeconds((Date.now() - startTime) / 1000);
      timerRef.current = requestAnimationFrame(updateTimer);
    };
    timerRef.current = requestAnimationFrame(updateTimer);
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [startTime]);
  
  const totalDurationHours = useMemo(() => parseDurationHours(protocol.duration), [protocol.duration]);
  const totalDurationSeconds = totalDurationHours * 3600;
  const progressPercentage = Math.min((elapsedSeconds / totalDurationSeconds) * 100, 100);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl font-hud">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-yellow-300 uppercase tracking-widest">Active Fast</p>
          <h3 className="font-title text-2xl font-bold text-white">{protocol.name}</h3>
        </div>
        <div className="text-center md:text-right">
          <p className="text-yellow-300 uppercase tracking-widest">Time Elapsed</p>
          <p className="font-mono text-4xl font-bold text-white tracking-tighter">{formatTime(elapsedSeconds)}</p>
        </div>
      </div>
      <div className="mt-6">
        <div className="relative h-4 bg-gray-800/50 rounded-full border border-gray-700 overflow-hidden">
          <div 
            className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-linear" 
            style={{ width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
          ></div>
          {protocol.milestones?.map(milestone => {
            const milestonePosition = (milestone.hours / totalDurationHours) * 100;
            const isAchieved = elapsedSeconds >= milestone.hours * 3600;
            return (
              <div 
                key={milestone.name} 
                className="absolute top-1/2 -translate-y-1/2 group"
                style={{ left: `${milestonePosition}%` }}
                title={`${milestone.name} (${milestone.hours} hrs)`}
              >
                <div className={`w-3 h-3 rounded-full border-2 border-gray-900 transition-colors duration-500 ${isAchieved ? 'bg-yellow-300' : 'bg-gray-600'}`}></div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white rounded-md text-xs w-40 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="font-bold">{milestone.name}</p>
                    <p className="text-gray-400">{milestone.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span>0 Hours</span>
            <span>{totalDurationHours} Hours</span>
        </div>
      </div>
    </div>
  );
};

export default FastingTimer;