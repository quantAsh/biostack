import React, { useMemo, useRef, useEffect, useState } from 'react';
import JournalingPanel from './JournalingPanel';
import DigitalTwinView from './DigitalTwinView';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { Protocol, Category, KaiSubView, Journey, ProtocolMasteryLevel, ProtocolMastery, ConsoleMode, ChatMessage, SavedReport, ScheduledTimelineItem, CalendarEvent, Quest, DigitalTwinForecast, UserStack } from '../types';
import { CATEGORY_DETAILS, VIEW_THEMES } from '../constants';
import { CategoryIcon } from './CategoryIcon';
import useIsMobile from '../hooks/useIsMobile';
import DashboardHeader from './DashboardHeader';
import FastingTimer from './FastingTimer';
import { useDataStore } from '../stores/dataStore';
import toast from 'react-hot-toast';
import BreathPacer from './BreathPacer';
import BinauralPlayer from './BinauralPlayer';
import MobileHeader from './MobileHeader';
import ForecastReport from './ForecastReport';
import { useMutation } from '@tanstack/react-query';
import { getTriageReport, getStackSuggestion, getCorrelationInsights, getDiagnosticConversationResponse, getDigitalTwinForecast } from '../services/geminiService';
import ContextualAIWidget from './ContextualAIWidget';
import { KaiIcon } from './KaiIcon';
import { speechService } from '../services/speechService';
import MarkdownIt from 'markdown-it';
import { getProtocolTimeOfDay } from '../utils/scheduling';
import BioAvatarPanel from './BioAvatarPanel';

const md = new MarkdownIt({ html: true });

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTo12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '';

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

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

const ProtocolTimelineCard: React.FC<{ protocol: Protocol, time: string, isOverridden: boolean }> = ({ protocol, time, isOverridden }) => {
    const { startCoachingSession, startGuidedSession } = useUIStore();
    const { protocolMastery, enrolledJourneyIds, activeQuests, myStackContent } = useUserStore();
    const { journeys } = useDataStore();

    const mastery = protocolMastery[protocol.id];

    const parentStack = useMemo(() => {
        return myStackContent.find(item => typeof item !== 'string' && item.protocol_ids.includes(protocol.id)) as UserStack | undefined;
    }, [myStackContent, protocol.id]);

    const isJourneyProtocol = useMemo(() => 
        journeys.some(j => enrolledJourneyIds.includes(j.id) && j.protocolIds.includes(protocol.id))
    , [journeys, enrolledJourneyIds, protocol.id]);
    
    const isQuestProtocol = activeQuests.some(q => q.protocolId === protocol.id);

    const handleStart = () => {
        if (protocol.hasGuidedSession) {
            startGuidedSession(protocol);
        } else {
            startCoachingSession(protocol);
        }
    };
    const color = CATEGORY_DETAILS[protocol.categories[0]].color;

    return (
         <div className="timeline-item">
            <div className="timeline-dot" style={{ '--dot-color': color } as React.CSSProperties}></div>
            <div className="timeline-header">
                <p className="timeline-time" style={{ '--time-color': color } as React.CSSProperties}>{formatTo12Hour(time)}</p>
            </div>
            <div className="timeline-card-detailed" style={{ '--card-color': color } as React.CSSProperties}>
                 <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <CategoryIcon category={protocol.categories[0]} className="w-8 h-8" style={{ color }} />
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-bold text-white truncate">{protocol.name}</h4>
                                <p className="text-xs text-gray-400 mt-1">{protocol.duration}</p>
                            </div>
                            <button onClick={handleStart} className="text-xs font-semibold bg-gray-700/50 hover:bg-gray-600 px-3 py-1.5 rounded-md flex-shrink-0">
                                Start Session
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {isQuestProtocol && <div className="timeline-badge" style={{ color: '#facc15', borderColor: '#facc1580' }}>⭐ Quest</div>}
                            {isJourneyProtocol && <div className="timeline-badge" style={{ color: '#818cf8', borderColor: '#818cf880' }}>🚀 Journey</div>}
                            {parentStack && <div className="timeline-badge" style={{ color: '#5eead4', borderColor: '#5eead480' }}>{parentStack.name}</div>}
                            {mastery && mastery.streak > 0 && (
                               <div className={`timeline-badge ${getStreakClass(mastery.level)}`} style={{borderColor: 'currentColor'}}>
                                   <span>{mastery.streak}</span>
                                   <span>{mastery.level === 'Grandmaster' ? '👑' : '🔥'}</span>
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalendarTimelineCard: React.FC<{ event: CalendarEvent }> = ({ event }) => (
    <div className="timeline-item">
        <div className="timeline-dot" style={{ '--dot-color': '#9ca3af' } as React.CSSProperties}></div>
        <div className="timeline-header"><p className="timeline-time" style={{ '--time-color': '#9ca3af' } as React.CSSProperties}>{formatTo12Hour(event.time)}</p></div>
        <div className="timeline-card-detailed" style={{ '--card-color': '#9ca3af' } as React.CSSProperties}>
            <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                <h4 className="font-semibold text-gray-200">{event.title}</h4>
            </div>
        </div>
    </div>
);

const IntelligentAgenda: React.FC = () => {
    const { myStackContent, protocolTimeOverrides, calendarEvents } = useUserStore();
    const { protocols: allProtocols } = useDataStore();

    const myProtocols = useMemo(() => {
        const allProtocolIdsInStack = myStackContent.reduce<string[]>((acc, item) => {
            if (typeof item === 'string') {
                acc.push(item);
            } else if (item && item.protocol_ids) {
                acc.push(...item.protocol_ids);
            }
            return acc;
        }, []);

        return [...new Set(allProtocolIdsInStack)]
            .map(id => allProtocols.find(p => p.id === id))
            .filter((p): p is Protocol => !!p);
    }, [myStackContent, allProtocols]);

    const scheduledItems = useMemo(() => {
        const defaultTimes: Record<ReturnType<typeof getProtocolTimeOfDay>, string> = { 'Morning': '08:00', 'Afternoon': '13:00', 'Evening': '21:00' };
        
        const protocolItems = myProtocols.map(p => {
            const time = protocolTimeOverrides[p.id] || defaultTimes[getProtocolTimeOfDay(p)];
            return { type: 'protocol' as const, time, data: p, isOverridden: !!protocolTimeOverrides[p.id] };
        });
        
        const calendarItems = calendarEvents.map(e => ({ type: 'calendar' as const, time: e.time, data: e }));

        const allItems = [...protocolItems, ...calendarItems];
        
        return allItems.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    }, [myProtocols, protocolTimeOverrides, calendarEvents]);

    if (scheduledItems.length === 0) {
        return <div className="text-center text-sm text-gray-500 py-8">Your agenda is empty. Add protocols to your stack to get started.</div>;
    }

    return (
        <div className="timeline-container">
            {scheduledItems.map((item, index) => {
                switch (item.type) {
                    case 'protocol': {
                        const { data, time, isOverridden } = item;
                        return <ProtocolTimelineCard key={`protocol-${data.id}-${index}`} protocol={data} time={time} isOverridden={isOverridden} />;
                    }
                    case 'calendar': {
                        const { data } = item;
                        return <CalendarTimelineCard key={`calendar-${data.title}-${index}`} event={data} />;
                    }
                    default:
                        return null;
                }
            })}
        </div>
    );
};

const KaiPanel: React.FC = () => {
    const { kaiSubView, setKaiSubView, forecastData, setForecastState, isForecastLoading, clearForecast } = useUIStore();
    const { diagnosticData, myStack, userGoals, journalEntries, isDataProcessingAllowed, isPremium, ingestSimulatedBloodwork, savedReports, deleteReport, saveReport } = useUserStore();
    const { protocols, platformConfig } = useDataStore();
    
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const isMobile = useIsMobile();
    const myProtocols = myStack.filter((p): p is Protocol => 'id' in p);
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;

    const triageMutation = useMutation({
        mutationFn: () => getTriageReport(diagnosticData, myProtocols),
        onSuccess: (data) => setAnalysisResult({ type: 'triage', data }),
        onError: (error: Error) => toast.error(`Triage Failed: ${error.message}`),
    });

    const briefingMutation = useMutation({
        mutationFn: () => getStackSuggestion(myProtocols, protocols, userGoals.join(', '), [], journalEntries, isDataProcessingAllowed),
        onSuccess: (data) => setAnalysisResult({ type: 'briefing', data }),
        onError: (error: Error) => toast.error(`Briefing Failed: ${error.message}`),
    });

    const correlationMutation = useMutation({
        mutationFn: () => getCorrelationInsights(journalEntries, protocols, isDataProcessingAllowed),
        onSuccess: (data) => setAnalysisResult({ type: 'correlation', data }),
        onError: (error: Error) => toast.error(`Correlation Failed: ${error.message}`),
    });
    
    const forecastMutation = useMutation({
        mutationFn: (timeHorizon: string) => getDigitalTwinForecast(timeHorizon, diagnosticData, myProtocols, protocols),
        onMutate: () => {
            setKaiSubView('progress');
            setForecastState({ isForecastLoading: true, forecastData: null });
        },
        onSuccess: (data) => setForecastState({ isForecastLoading: false, forecastData: data }),
        onError: (error: Error) => {
            setForecastState({ isForecastLoading: false, forecastData: null });
            toast.error(`Forecast Failed: ${error.message}`);
        },
    });

    const isAnalysisLoading = triageMutation.isPending || briefingMutation.isPending || correlationMutation.isPending;
    
    const DigitalTwinConsole: React.FC = () => {
        const { openUpgradeModal } = useUIStore();
        const [consoleView, setConsoleView] = useState<'console' | 'history'>('console');
        const [isForecastSelectionOpen, setIsForecastSelectionOpen] = useState(false);
        
        const handleRunAnalysis = (type: 'triage' | 'briefing' | 'correlation') => {
            if (!isAiEnabled) { toast.error("AI features are disabled."); return; }
            setAnalysisResult(null);
            clearForecast();
            if (type === 'triage') triageMutation.mutate();
            if (type === 'briefing') briefingMutation.mutate();
            if (type === 'correlation') correlationMutation.mutate();
             setKaiSubView('progress'); // Switch to progress view to see results
        };

        const handleRunForecast = (timeHorizon: '1 Month' | '3 Months' | '6 Months') => {
            if (!isAiEnabled) { toast.error("AI features are disabled."); return; }
            if (!isPremium) { openUpgradeModal(); return; }
            setIsForecastSelectionOpen(false);
            setAnalysisResult(null);
            forecastMutation.mutate(timeHorizon);
        };
        
         const handleViewReport = (report: SavedReport) => {
            setAnalysisResult(null);
            clearForecast();
            if (report.type === 'forecast') {
                setForecastState({ isForecastLoading: false, forecastData: report.data });
            } else {
                setAnalysisResult({ type: report.type, data: report.data });
            }
            setKaiSubView('progress');
            setConsoleView('console');
        };

        return (
            <div data-view-id="digital-twin-console" className="hud-panel blueprint-bg flex flex-col" style={{ borderColor: `${VIEW_THEMES['kai'].borderColor.replace('border-','')}4D` }}>
                 {/* This content is now part of the Progress & Diagnostics tab view */}
            </div>
        );
    };

    const RightColumnContent = () => {
        const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'history'>('console');

        return (
            <div className="space-y-6">
                 {(() => {
                    switch (kaiSubView) {
                        case 'today':
                            return (
                                <>
                                    <JournalingPanel />
                                    <div className="space-y-4">
                                        <h3 data-tour-id="intelligent-agenda-title" className="font-hud text-xl font-bold text-gray-200 tracking-widest">INTELLIGENT AGENDA</h3>
                                        <div className="hud-panel !p-4 min-h-[300px]">
                                            <IntelligentAgenda />
                                        </div>
                                    </div>
                                </>
                            );
                        case 'progress':
                             return (
                                <div className="space-y-4">
                                     <div className="hud-panel min-h-[400px]">
                                        <div className="console-controls mb-4">
                                            <div className="flex-grow">
                                                <button onClick={() => setActiveConsoleTab('console')} className={`console-button ${activeConsoleTab === 'console' ? 'active' : ''}`}>Console</button>
                                                <button onClick={() => setActiveConsoleTab('history')} className={`console-button ${activeConsoleTab === 'history' ? 'active' : ''}`}>History</button>
                                            </div>
                                        </div>
                                         {(isAnalysisLoading || isForecastLoading) ? (
                                             <div className="flex items-center justify-center h-full"><svg className="animate-spin h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>
                                         ) : forecastData ? (
                                             <ForecastReport forecast={forecastData} />
                                         ) : analysisResult ? (
                                             <ContextualAIWidget type={analysisResult.type} data={analysisResult.data} />
                                         ) : <p className="text-sm text-gray-500 text-center p-8">Run an analysis from the console to view results here.</p>}
                                    </div>
                                </div>
                            );
                        case 'avatar':
                            return <BioAvatarPanel />;
                        default:
                            return null;
                    }
                })()}
            </div>
        );
    };
    
    if (isMobile) {
        return (
             <div className="h-full">
                <MobileHeader title="Kai" />
                <div className="mobile-page-content custom-scrollbar p-4 space-y-8">
                    <DashboardHeader />
                    <div className="space-y-4">
                        <h3 className="font-hud text-xl font-bold text-gray-200 tracking-widest">DIGITAL TWIN</h3>
                        <div className="h-[400px]">
                            <DigitalTwinView />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-hud text-xl font-bold text-gray-200 tracking-widest">INTELLIGENT AGENDA</h3>
                        <div className="hud-panel !p-4 min-h-[300px]">
                           <IntelligentAgenda />
                        </div>
                    </div>
                    <BioAvatarPanel />
                </div>
            </div>
        );
    }
    
    const SubViewButton: React.FC<{ view: KaiSubView; label: string }> = ({ view, label }) => {
        const isActive = kaiSubView === view;
        return (
            <button
                onClick={() => setKaiSubView(view)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400 hover:text-white'
                }`}
                data-view-id={view === 'progress' ? 'digital-twin-console' : view === 'today' ? 'intelligent-agenda' : undefined}
                data-tour-id={view === 'progress' ? 'kai-progress-tab' : undefined}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="mx-auto max-w-screen-2xl">
            <DashboardHeader />
            <div className="desktop-dashboard-grid mt-8">
                {/* Left Column (Static) */}
                <div className="dashboard-column-outer h-[850px] space-y-6">
                    <div className="flex-grow h-0">
                        <DigitalTwinView />
                    </div>
                </div>

                {/* Right Column (Dynamic) */}
                <div className="dashboard-column-outer">
                    <div className="flex border-b border-gray-700/50">
                        <SubViewButton view="today" label="Today's Agenda" />
                        <SubViewButton view="progress" label="Progress & Diagnostics" />
                        <SubViewButton view="avatar" label="Bio-Avatar" />
                    </div>
                    <div className="mt-6">
                        <RightColumnContent />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KaiPanel;