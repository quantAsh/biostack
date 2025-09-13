import React, { useState } from 'react';
import { getWeekPlan } from '../services/geminiService';
import MarkdownIt from 'markdown-it';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { useMutation } from '@tanstack/react-query';
import SimulationEngine from './SimulationEngine';
import { KaiIcon } from './KaiIcon';
import { isFirebaseEnabled } from '../services/firebase';
import { Protocol } from '../types';
import { useDataStore } from '../stores/dataStore';

const md = new MarkdownIt({ html: true });

const WeekPlanner: React.FC = () => {
    const myStack = useUserStore(state => state.myStack);
    const userGoals = useUserStore(state => state.userGoals);
    const isCalendarConnected = useUserStore(state => state.isCalendarConnected);
    const toggleCalendar = useUserStore(state => state.toggleCalendar);
    const calendarEvents = useUserStore(state => state.calendarEvents);
  
    const plannerMutation = useMutation({
        mutationFn: () => {
        const goalsText = userGoals.length > 0 ? userGoals.join(', ') : "General improvement";
        const protocolsInStack = myStack.filter((p): p is Protocol => 'id' in p);
        return getWeekPlan(protocolsInStack, goalsText, calendarEvents);
        },
    });

    const handlePlanWeek = () => {
        plannerMutation.mutate();
    };

    const isLoading = plannerMutation.isPending;
    const response = plannerMutation.data ? md.render(plannerMutation.data) : '';

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-grow">
                    <h3 className="font-title text-xl font-bold text-blue-300 mb-2">Kai's Week Planner</h3>
                    <p className="text-gray-400 mb-4 max-w-xl text-sm">Allow Kai to create a smart schedule that fits your protocols around your life events.</p>
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                    <label htmlFor="calendar-toggle" className="flex items-center cursor-pointer">
                        <span className="mr-3 text-sm font-medium text-gray-300">Connect Calendar</span>
                        <div className="relative">
                        <input type="checkbox" id="calendar-toggle" className="sr-only" checked={isCalendarConnected} onChange={toggleCalendar} />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isCalendarConnected ? 'translate-x-6 bg-blue-400' : ''}`}></div>
                        </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">(Simulated)</p>
                </div>
            </div>

            {isCalendarConnected && (
                <div className="mt-6 space-y-6">
                    <div>
                        <h4 className="font-title text-base font-bold text-gray-300 mb-3">Your Upcoming Week</h4>
                        <div className="p-4 bg-black/30 rounded-lg border border-gray-700 max-h-40 overflow-y-auto custom-scrollbar">
                            <ul className="text-sm text-gray-400 space-y-2">
                                {calendarEvents.map(event => (
                                    <li key={`${event.day}-${event.time}`}><strong className="text-gray-200">{event.day}, {event.time}</strong> - {event.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button
                    onClick={handlePlanWeek}
                    disabled={isLoading || myStack.length === 0}
                    className="bg-blue-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-blue-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center w-full"
                    >
                    {isLoading ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <span className="flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2 5.5a3.5 3.5 0 013.5-3.5h9A3.5 3.5 0 0118 5.5v9a3.5 3.5 0 01-3.5 3.5h-9A3.5 3.5 0 012 14.5v-9zM4.5 4A.5.5 0 004 4.5v1A.5.5 0 004.5 6h11a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-11zM10 8a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 8zM5.75 11.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z" clipRule="evenodd" /></svg>
                            Plan My Week
                        </span>
                    )}
                    </button>
                    {myStack.length === 0 && <p className="text-center text-yellow-400 text-sm mt-2">Add protocols to your stack to create a plan.</p>}
                </div>
            )}
            {response && (
                <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700">
                    <div 
                    className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 prose-headings:text-blue-400 prose-strong:text-white" 
                    dangerouslySetInnerHTML={{ __html: response }} 
                    />
                </div>
            )}
        </div>
    );
};


const AISuite: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'planner' | 'simulator'>('planner');
    const isPremium = useUserStore(state => state.isPremium);
    const { platformConfig } = useDataStore();
    const openUpgradeModal = useUIStore(state => state.openUpgradeModal);
    const isApiKeyMissing = !process.env.API_KEY;
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;

    if (isApiKeyMissing || !isFirebaseEnabled) return null;
    
    const handleTabClick = (tab: 'planner' | 'simulator') => {
        if (tab === 'simulator' && !isPremium) {
            openUpgradeModal();
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <h2 className="font-title text-2xl md:text-3xl font-bold text-gray-200 mb-4">Kai's Planning & Simulation Suite</h2>
            
            {!isAiEnabled ? (
                 <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg text-sm text-center">
                    <strong>AI Suite Disabled:</strong> This feature has been disabled by the administrator.
                </div>
            ) : (
                <>
                    <div className="flex border-b border-gray-700 mb-6">
                        <button onClick={() => handleTabClick('planner')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'planner' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-white'}`}>
                            Week Planner
                        </button>
                        <button 
                            onClick={() => handleTabClick('simulator')} 
                            className={`px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'simulator' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-white'}`}
                        >
                            Simulation Engine
                            {!isPremium && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                            )}
                        </button>
                    </div>

                    {activeTab === 'planner' && <WeekPlanner />}
                    {activeTab === 'simulator' && <SimulationEngine />}
                </>
            )}
        </div>
    );
};

export default AISuite;