import React from 'react';
import AISuite from './AIPlanner';
import VoiceSettings from './VoiceSettings';
import IdentityPanel from './IdentityPanel';
import DataVaultPanel from './DataVaultPanel';
import ResearchHubPanel from './ResearchHubPanel';
import ZKProofPanel from './ZKProofPanel';
import AgentAuditTrailPanel from './AgentAuditTrailPanel';
import IntegrationsPanel from './IntegrationsPanel';
import SubscriptionPanel from './SubscriptionPanel';
import DiagnosticsPanel from './DiagnosticsPanel';
import { VIEW_THEMES } from '../constants';
import { useUserStore } from '../stores/userStore';
import toast from 'react-hot-toast';
import { useDataStore } from '../stores/dataStore';
import { useTheme } from './ThemeContext';
import { Theme, SettingsTab } from '../types';
import WalletPanel from './WalletPanel';
import useIsMobile from '../hooks/useIsMobile';
import MobileHeader from './MobileHeader';
import { useUIStore } from '../stores/uiStore';
import DiagnosticsHubPanel from './DiagnosticsHubPanel';
import AutonomousKaiPanel from './AutonomousKaiPanel';

const ReferralPanel: React.FC = () => {
    const { user } = useUserStore();
    const { platformConfig } = useDataStore();

    if (!user) return null;

    const referralLink = `https://biohackstack.io/invite?ref=${user.uid}`;
    const reward = platformConfig?.referralXpReward || 0;
    
    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied!");
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <h3 className="font-title text-xl font-bold text-green-300">Refer a Friend</h3>
            <p className="text-gray-400 text-sm mt-1 mb-4">
                Share your unique link to invite friends. For each friend that joins, you'll receive <span className="font-bold text-yellow-300">{reward} XP!</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-grow w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-green-300 font-mono"
                />
                <button
                    onClick={copyLink}
                    className="w-full sm:w-auto flex-shrink-0 bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-500 transition-colors"
                >
                    Copy Link
                </button>
            </div>
        </div>
    );
};

const ThemeSelectorPanel: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes: { id: Theme, name: string, description: string }[] = [
        { id: 'classic', name: 'Classic', description: 'A sleek, data-rich interface with holographic card effects.' },
        { id: 'aura', name: 'Aura', description: 'A futuristic, heads-up display (HUD) inspired theme with neon accents.' },
        { id: 'digital-human', name: 'Digital Human', description: 'A clean, modern theme focused on clarity and beautiful imagery.' },
    ];
    
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <h3 className="font-title text-xl font-bold text-gray-200 mb-4">Interface Theme</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {themes.map(t => (
                    <button 
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all h-full ${theme === t.id ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                    >
                        <h4 className="font-bold text-lg text-white">{t.name}</h4>
                        <p className="text-sm text-gray-400">{t.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


const SettingsPanel: React.FC = () => {
    const theme = VIEW_THEMES['settings'];
    const isMobile = useIsMobile();
    const { settingsTab, setSettingsTab } = useUIStore();
    const { isAdmin } = useUserStore();

    const TABS: { id: SettingsTab; label: string; icon: React.ReactNode, adminOnly?: boolean }[] = [
        { id: 'account', label: 'Account', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" /></svg> },
        { id: 'sovereignty', label: 'Sovereignty & Data', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.5c-3.314 0-6 2.686-6 6v3c0 .878.342 1.717.95 2.326l3.268 3.268a2.5 2.5 0 003.536 0l3.268-3.268A4.48 4.48 0 0016 10.5v-3c0-3.314-2.686-6-6-6zm-4.5 9v-3c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5v3c0 .445-.173.871-.476 1.185l-3.256 3.256a1 1 0 01-1.414 0L6.024 11.685A2.983 2.983 0 015.5 10.5z" clipRule="evenodd" /></svg> },
        { id: 'integrations', label: 'Integrations', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" /></svg> },
        { id: 'diagnostics', label: 'Diagnostics', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1.586a1.5 1.5 0 01-.44 1.06L9.5 9.585V12.5a.5.5 0 01-1 0V9.585L5.44 6.146A1.5 1.5 0 015 5.086V3.5A1.5 1.5 0 016.5 2H7z" /><path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9z" /></svg> },
        { id: 'preferences', label: 'Preferences', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg> },
    ];
    
    const visibleTabs = TABS.filter(tab => !tab.adminOnly || isAdmin);

    const renderContent = () => {
        switch (settingsTab) {
            case 'account': return <><SubscriptionPanel /><ReferralPanel /></>;
            case 'sovereignty': return <><DataVaultPanel /><IdentityPanel /><ZKProofPanel /><ResearchHubPanel /><AgentAuditTrailPanel /></>;
            case 'integrations': return <><IntegrationsPanel /><DiagnosticsPanel /></>;
            case 'diagnostics': return <DiagnosticsHubPanel />;
            case 'preferences': return <><ThemeSelectorPanel /><WalletPanel /><VoiceSettings /><AutonomousKaiPanel /><AISuite /></>;
            default: return <SubscriptionPanel />;
        }
    };
    
    const mainLayout = (
        <>
             <div className="text-center mb-12">
                <h2 className={`font-title text-3xl md:text-4xl font-extrabold mb-2 ${theme.textColor}`}>System Settings</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Configure your AI, manage data integrations, and access advanced features.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block md:w-1/4 lg:w-1/5 flex-shrink-0">
                    <nav className="space-y-2">
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSettingsTab(tab.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors text-left ${settingsTab === tab.id ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
                                data-view-id={`settings-${tab.id}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Mobile Tab Bar */}
                <div className="md:hidden">
                    <div className="border-b border-gray-700/50">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto custom-scrollbar" aria-label="Tabs">
                            {visibleTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSettingsTab(tab.id)}
                                    className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${settingsTab === tab.id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
                                    data-view-id={`settings-${tab.id}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <main className="flex-grow min-w-0">
                    {renderContent()}
                </main>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <div className="h-full">
                <MobileHeader title="Settings" />
                <div className="mobile-page-content custom-scrollbar p-4">
                    {mainLayout}
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl">
            {mainLayout}
        </div>
    );
};

export default SettingsPanel;