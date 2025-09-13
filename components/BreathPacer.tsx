import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '../stores/userStore';
import { audioService } from '../services/audioService';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { getBreathworkCoachingTip } from '../services/geminiService';
import { useUIStore } from '../stores/uiStore';
import { speechService } from '../services/speechService';
import { useDataStore } from '../stores/dataStore';

const AudioVisualizer: React.FC<{ volume: number }> = ({ volume }) => {
    const barCount = 16;
    const bars = Array.from({ length: barCount }, (_, i) => {
        const height = Math.max(2, Math.min(100, (volume - (i * 2)) * (1 - i/(barCount*1.5)) * 2));
        return <div key={i} className="bg-cyan-400/50 rounded-full" style={{ width: '4px', height: `${height}%`, transition: 'height 0.1s ease-out' }} />;
    });

    return (
        <div className="flex items-end justify-center gap-1 h-12">
            {bars}
        </div>
    );
};

const BreathPacer: React.FC = () => {
    const { activePacer, stopPacer, protocolMastery } = useUserStore();
    const { kaiVoiceURI } = useUIStore();
    const { platformConfig } = useDataStore();
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;

    const [phase, setPhase] = useState('Begin');
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<number | null>(null);

    // Audio Feedback State
    const [isAudioFeedbackEnabled, setIsAudioFeedbackEnabled] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [coachingTip, setCoachingTip] = useState<string | null>(null);
    const volumeSamples = useRef<number[]>([]);

    const protocol = activePacer?.protocol;
    const mastery = protocol ? protocolMastery[protocol.id] : null;

    const coachingTipMutation = useMutation({
        mutationFn: (params: { protocolName: string; phase: string; averageVolume: number }) =>
            getBreathworkCoachingTip(params.protocolName, params.phase, params.averageVolume),
        onSuccess: (tip) => {
            if (tip) {
                setCoachingTip(tip);
                speechService.speak(tip, kaiVoiceURI);
            }
        },
        onError: (error: Error) => {
            console.error("Coaching tip error:", error.message);
        }
    });

    const pacerConfig = useMemo(() => {
        if (!protocol || !mastery || !protocol.masteryUnlocks) {
            return { inhale: 4000, hold: 4000, exhale: 4000, holdAfter: 4000 };
        }
    
        const expertUnlock = protocol.masteryUnlocks.find(u => u.level === 'Expert' && u.type === 'pacer_config');
        if (mastery.level === 'Expert' || mastery.level === 'Master' || mastery.level === 'Grandmaster') {
          if (expertUnlock && expertUnlock.type === 'pacer_config') return expertUnlock.config;
        }
    
        const adeptUnlock = protocol.masteryUnlocks.find(u => u.level === 'Adept' && u.type === 'pacer_config');
        if (mastery.level === 'Adept') {
            if (adeptUnlock && adeptUnlock.type === 'pacer_config') return adeptUnlock.config;
        }
        
        return { inhale: 4000, hold: 4000, exhale: 4000, holdAfter: 4000 };
    }, [protocol, mastery]);
    
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    const phaseDurations = [pacerConfig.inhale, pacerConfig.hold, pacerConfig.exhale, pacerConfig.holdAfter];
    const currentPhaseDuration = phaseDurations[phaseIndex];

    // Timer for elapsed time
    useEffect(() => {
        if (isSessionActive) {
            timerRef.current = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedTime(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSessionActive]);

    // Pacer logic (phase changes)
    useEffect(() => {
        if (!protocol || !isSessionActive) {
            if (!isSessionActive) setPhase('Begin');
            return;
        }

        const interval = setInterval(() => {
            if (isAudioFeedbackEnabled && volumeSamples.current.length > 0 && isAiEnabled) {
                const avgVolume = volumeSamples.current.reduce((a, b) => a + b, 0) / volumeSamples.current.length;
                coachingTipMutation.mutate({ protocolName: protocol.name, phase: phases[phaseIndex], averageVolume: avgVolume });
            }
            volumeSamples.current = [];
            setPhaseIndex(prev => (prev + 1) % phases.length);
        }, currentPhaseDuration);

        return () => clearInterval(interval);
    }, [protocol, isSessionActive, currentPhaseDuration, phaseIndex, isAudioFeedbackEnabled, isAiEnabled]);

    useEffect(() => {
        if (isSessionActive) setPhase(phases[phaseIndex]);
    }, [phaseIndex, isSessionActive]);

    useEffect(() => {
        const startListener = async () => {
            if (isSessionActive && isAudioFeedbackEnabled) {
                try {
                    await audioService.startMicrophoneListener((volume) => {
                        const normalizedVolume = Math.min(100, volume * 1.5); 
                        setCurrentVolume(normalizedVolume);
                        volumeSamples.current.push(normalizedVolume);
                    });
                } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Microphone error");
                    setIsAudioFeedbackEnabled(false);
                }
            } else {
                audioService.stopMicrophoneListener();
            }
        };
        startListener();

        return () => {
            audioService.stopMicrophoneListener();
        };
    }, [isSessionActive, isAudioFeedbackEnabled]);
    
    if (!protocol) return null;

    const handleStart = () => {
        setPhaseIndex(0);
        setPhase(phases[0]);
        setCoachingTip(null);
        setIsSessionActive(true);
    };
    
    const handleStop = () => {
        setIsSessionActive(false);
        stopPacer();
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 my-8 mx-auto max-w-md font-hud text-center">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-cyan-300 uppercase tracking-widest text-sm">Active Pacer</p>
                    <h3 className="font-title text-2xl font-bold text-white">{protocol.name}</h3>
                </div>
                <button onClick={handleStop} className="text-sm font-semibold bg-red-800/80 text-red-100 px-3 py-1.5 rounded-md hover:bg-red-700/80">
                    Stop
                </button>
            </div>
            
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                 <div 
                    className="absolute w-full h-full bg-cyan-500/20 rounded-full"
                    style={{
                        animation: isSessionActive ? `pacer-pulse ${currentPhaseDuration / 1000}s ease-in-out infinite` : 'none',
                        transformOrigin: 'center',
                    }}
                ></div>
                <div className="relative z-10">
                    <p className="text-4xl font-bold text-white transition-opacity duration-500">{phase}</p>
                    {isSessionActive && (
                        <p className="font-mono text-xl text-cyan-300">{currentPhaseDuration / 1000}s</p>
                    )}
                </div>
            </div>
            
            {isSessionActive && isAudioFeedbackEnabled && (
                <div className="mt-4 transition-all">
                    <AudioVisualizer volume={currentVolume} />
                    <p className="text-cyan-200 text-sm h-5 mt-2 animate-fade-in">{coachingTip}</p>
                </div>
            )}

            {isSessionActive ? (
                <div className="mt-4">
                    <p className="text-gray-400 text-sm">Time Elapsed</p>
                    <p className="font-mono text-2xl text-white">{formatTime(elapsedTime)}</p>
                </div>
            ) : (
                <>
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <label htmlFor="audio-feedback-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">Audio Feedback</span>
                            <div className="relative">
                                <input type="checkbox" id="audio-feedback-toggle" className="sr-only" checked={isAudioFeedbackEnabled} onChange={() => setIsAudioFeedbackEnabled(p => !p)} disabled={!isAiEnabled} />
                                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isAudioFeedbackEnabled ? 'translate-x-6 bg-cyan-400' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                    <button onClick={handleStart} className="mt-4 bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg text-lg">
                        Start Session
                    </button>
                </>
            )}
            
            <style>{`
                @keyframes pacer-pulse { 0%, 100% { transform: scale(0.7); opacity: 0.7; } 50% { transform: scale(1); opacity: 1; } }
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default BreathPacer;
