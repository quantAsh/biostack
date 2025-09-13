import React, { useMemo } from 'react';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { Protocol, JourneyProgress, Journey, ProtocolMasteryLevel, ProtocolMastery } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORY_DETAILS } from '../constants';
import { KaiIcon } from './KaiIcon';
import { useUIStore } from '../stores/uiStore';
import QuestsHUD from './QuestsHUD';
import LivingStackSuggestion from './LivingStackSuggestion';

const XPDisplay: React.FC = () => {
    const xp = useUserStore(state => state.xp);
    const level = useUserStore(state => state.level);
    const xpPercentage = xp.nextLevel > 0 ? (xp.current / xp.nextLevel) * 100 : 100;

    return (
        <div className="xp-display-hud flex-col !items-stretch !gap-1">
            <div className="flex-grow">
                <div className="xp-bar-container" title={`${xp.current} / ${xp.nextLevel} XP`}>
                    <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
                </div>
                <p className="xp-text">{xp.current} / ${xp.nextLevel} XP</p>
            </div>
            <div className="flex justify-between items-baseline mt-1">
                <span className="font-hud text-lg font-bold text-cyan-400">LEVEL</span>
                <p className="level-display">{level}</p>
            </div>
        </div>
    );
};

const MiniStatCard: React.FC<{ label: string; value: string; unit?: string }> = ({ label, value, unit }) => (
    <div className="mini-stat-card">
        <p className="value">{value}</p>
        <p className="label">{label}{unit && <span className="text-xs opacity-60 ml-1">{unit}</span>}</p>
    </div>
);

const ProactiveSuggestionBulletin: React.FC = () => {
    const { kaiSuggestions, dismissSuggestion, logCompletedProtocol, draftedJournalEntry } = useUserStore();
    const { startCoachingSession, openJournalModal } = useUIStore();
    const { protocols } = useDataStore();

    if (draftedJournalEntry) {
        return (
            <div className="proactive-suggestion-bulletin">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <KaiIcon className="w-6 h-6 text-cyan-300 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-white">Kai's Daily Snapshot</h4>
                            <p className="text-sm text-gray-400">I've analyzed your day's data and drafted a journal entry for you.</p>
                        </div>
                    </div>
                    <button
                        onClick={openJournalModal}
                        className="bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 text-sm flex-shrink-0"
                    >
                        Review & Log
                    </button>
                </div>
            </div>
        );
    }
    
    if (kaiSuggestions.length === 0) {
        return null;
    }

    const suggestion = kaiSuggestions[0];
    const suggestedProtocol = protocols.find(p => p.id === suggestion.protocolId);

    if (!suggestedProtocol) {
        // Automatically dismiss if protocol not found
        dismissSuggestion(suggestion.id);
        return null;
    }

    const handleAccept = () => {
        logCompletedProtocol(suggestedProtocol.id);
        startCoachingSession(suggestedProtocol);
        dismissSuggestion(suggestion.id);
    };

    return (
        <div className="proactive-suggestion-bulletin">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <KaiIcon className="w-6 h-6 text-cyan-300 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-white">{suggestion.title}</h4>
                        <p className="text-sm text-gray-400">{suggestion.reason}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                     <button
                        onClick={handleAccept}
                        className="bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 text-sm"
                    >
                        Begin: {suggestedProtocol.name}
                    </button>
                    <button onClick={() => dismissSuggestion(suggestion.id)} className="text-gray-500 hover:text-white transition-colors" title="Dismiss">
                        &times;
                    </button>
                </div>
            </div>
        </div>
    );
};


const ActiveJourneyAndMissionPanel: React.FC = () => {
    const { enrolledJourneyIds, journeyProgress, streakCatalyst } = useUserStore();
    const { weeklyMission, journeys } = useDataStore();

    const activeJourney = useMemo(() => {
        const firstEnrolled = enrolledJourneyIds[0];
        return firstEnrolled ? journeys.find(j => j.id === firstEnrolled) : null;
    }, [enrolledJourneyIds, journeys]);

    const progress = activeJourney ? journeyProgress[activeJourney.id] : null;

    return (
        <div className="mission-control-hud">
            <div className="flex justify-end gap-4 text-right">
                {weeklyMission && (
                    <div className="objective">
                        <div>
                            <p className="objective-text">Next Objective</p>
                            <p className="objective-title">{weeklyMission.protocolName}</p>
                        </div>
                        <div className="reward" title={`Complete for a bonus of ${weeklyMission.bonusXp} XP`}>
                            +{weeklyMission.bonusXp} XP
                        </div>
                    </div>
                )}
                {streakCatalyst && (
                    <div className="objective">
                        <div className="streak-catalyst-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.895 2.553a1.5 1.5 0 00-1.79 0l-4.5 2.25a1.5 1.5 0 00-.895 1.342V15a1.5 1.5 0 002.25 1.342l4.5-2.25a1.5 1.5 0 00.895-1.342V6.145a1.5 1.5 0 00-2.25-1.342l-4.5 2.25z" clipRule="evenodd" /></svg>
                            <span>Streak Catalyst: {streakCatalyst}x</span>
                        </div>
                        <div>
                             <p className="objective-text">Acquired</p>
                             <p className="objective-title">Next Streak Doubled</p>
                        </div>
                    </div>
                )}
            </div>
             {activeJourney && progress && (
                 <div className="mt-4">
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-semibold text-gray-300">{activeJourney.name}</p>
                        <p className="text-sm font-bold text-yellow-300">Day {progress.currentDay} of {parseInt(activeJourney.duration)}</p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="golden-progress-bar-fill h-1.5" style={{ width: `${(progress.currentDay / parseInt(activeJourney.duration)) * 100}%` }}></div>
                    </div>
                 </div>
            )}
        </div>
    );
};

const ProtocolMasteryStatus: React.FC = () => {
    const { protocolMastery } = useUserStore();
    const { protocols } = useDataStore();

    const trackedProtocols = useMemo(() => {
        return Object.values(protocolMastery)
            .map((mastery: ProtocolMastery) => {
                const protocol = protocols.find(p => p.id === mastery.protocolId);
                return protocol ? { ...protocol, mastery } : null;
            })
            .filter((p): p is Protocol & { mastery: ProtocolMastery } => !!p)
            .sort((a,b) => b.mastery.streak - a.mastery.streak);
    }, [protocolMastery, protocols]);

    const getStreakClass = (level: ProtocolMasteryLevel) => {
        switch (level) {
            case 'Novice': return 'streak-fire';
            case 'Adept': return 'streak-blue-flame';
            case 'Expert': return 'streak-verdant-flame';
            case 'Master': return 'streak-supernova-flame';
            case 'Grandmaster': return 'streak-solar-flame';
            default: return 'streak-fire';
        }
    };

    if (trackedProtocols.length === 0) {
        return null;
    }

    return (
        <div className="mt-2">
            <h3 className="font-hud text-xl font-bold text-gray-200 mb-4 tracking-widest">PROTOCOL MASTERY</h3>
            <div className="skills-grid">
                {trackedProtocols.map(p => (
                    <div key={p.id} className={`skill-container ${p.mastery.level === 'Grandmaster' ? 'is-mastered' : ''} ${p.mastery.streak > 0 ? 'has-streak' : ''}`}>
                        <div className="protocol-status-pod" style={{ '--protocol-color': CATEGORY_DETAILS[p.categories[0]].color } as React.CSSProperties}>
                            <div className="icon text-2xl"><CategoryIcon category={p.categories[0]} /></div>
                            {p.mastery.streak > 0 && (
                                <div className={`streak ${getStreakClass(p.mastery.level)}`}>
                                    <span>{p.mastery.streak}</span>
                                    <span>{p.mastery.level === 'Grandmaster' ? '👑' : '🔥'}</span>
                                </div>
                            )}
                        </div>
                        <div className="skill-label">{p.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DashboardHeader: React.FC = () => {
    const { dailyStreak, lastNightSleep } = useUserStore();
    return (
        <div className="dashboard-header !p-6 !border-cyan-500/30 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 items-start">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="daily-streak-hud">
                        <p className="value">{dailyStreak}</p>
                        <p className="label">Day Streak</p>
                    </div>
                    <MiniStatCard label="Sleep Score" value={lastNightSleep?.score.toString() ?? '--'} />
                    <MiniStatCard label="Readiness" value={lastNightSleep?.readiness.toString() ?? '--'} unit="%" />
                </div>
                <ProactiveSuggestionBulletin />
                <LivingStackSuggestion />
                <ProtocolMasteryStatus />
            </div>
            <div className="space-y-4 relative pb-28">
                <XPDisplay />
                <ActiveJourneyAndMissionPanel />
                <QuestsHUD />
            </div>
        </div>
    );
};

export default DashboardHeader;