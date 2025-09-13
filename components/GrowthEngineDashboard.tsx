import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDataStore } from '../stores/dataStore';
import { getAdminGrowthBriefing } from '../services/geminiService';
import { GrowthBriefing, UserFunnelSegment, WeeklyMission, PlatformAnnouncement, Protocol } from '../types';
import toast from 'react-hot-toast';

const VitalsCard: React.FC<{ title: string; value: string | number; change?: number }> = ({ title, value, change }) => (
    <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-400">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-white">{value}</p>
            {change !== undefined && (
                <span className={`text-sm font-semibold flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.28 9.64a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.97-4.03a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 4.03V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
                    }
                    {Math.abs(change)}%
                </span>
            )}
        </div>
    </div>
);

const UserFunnel: React.FC<{ data: UserFunnelSegment[] }> = ({ data }) => {
    const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-green-500'];

    const FunnelStage: React.FC<{ stage: UserFunnelSegment; color: string; }> = ({ stage, color }) => (
        <div className={`py-2 px-4 rounded-md text-center ${color}`}>
            <p className="font-bold text-sm text-white">{stage.stage}</p>
            <p className="text-xs font-mono text-white/80">{stage.count.toLocaleString()} users</p>
        </div>
    );

    const ConversionRate: React.FC<{ from: number; to: number }> = ({ from, to }) => {
        if (from === 0) return null;
        const rate = (to / from) * 100;
        const isIncrease = to > from;

        return (
            <div className={`text-center text-xs font-mono my-2 flex items-center justify-center gap-1 ${isIncrease ? 'text-green-400' : 'text-gray-400'}`}>
                {isIncrease ? '↑' : '↓'} {rate.toFixed(1)}%
            </div>
        );
    };

    return (
        <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-700/50 h-full">
            <h4 className="font-semibold text-white mb-4">User Lifecycle Funnel</h4>
            <div className="w-full space-y-2">
                {data.map((segment, index) => (
                    <React.Fragment key={segment.stage}>
                        {index > 0 && <ConversionRate from={data[index - 1].count} to={segment.count} />}
                        <FunnelStage
                            stage={segment}
                            color={colors[index % colors.length]}
                        />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const CampaignCommand: React.FC<{ briefing?: GrowthBriefing | null }> = ({ briefing }) => {
    const { protocols, platformAnnouncement, weeklyMission, setPlatformAnnouncement, setWeeklyMission } = useDataStore();
    const [announcement, setAnnouncement] = useState('');
    const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
    const [missionProtocolId, setMissionProtocolId] = useState('');
    const [missionBonusXp, setMissionBonusXp] = useState<number|string>(100);

    useEffect(() => {
        if (weeklyMission) {
            setMissionProtocolId(weeklyMission.protocolId);
            setMissionBonusXp(weeklyMission.bonusXp);
        }
        if (platformAnnouncement) {
            setAnnouncement(platformAnnouncement.message);
            setIsAnnouncementActive(platformAnnouncement.isActive);
        }
    }, [weeklyMission, platformAnnouncement]);

    const handleApplySuggestion = () => {
        if (briefing?.suggestedCampaign) {
            setMissionProtocolId(briefing.suggestedCampaign.protocolId);
            setMissionBonusXp(briefing.suggestedCampaign.bonusXp);
            toast.success("AI suggestion applied to form.");
        }
    };

    const announcementMutation = useMutation({
        mutationFn: () => setPlatformAnnouncement(announcement, isAnnouncementActive),
        onSuccess: () => toast.success("Announcement updated."),
    });

    const missionMutation = useMutation({
        mutationFn: () => {
            const protocol = protocols.find(p => p.id === missionProtocolId);
            if (!protocol) throw new Error("Protocol not found");
            return setWeeklyMission({ protocolId: missionProtocolId, protocolName: protocol.name, bonusXp: Number(missionBonusXp) });
        },
        onSuccess: () => toast.success("Weekly Mission set!"),
    });

    return (
        <div className="space-y-4">
            {briefing && (
                <div className="bg-[#1C2128] p-4 rounded-lg border border-cyan-500/30">
                     <h5 className="font-semibold text-cyan-300 text-sm mb-2">Kai's Campaign Suggestion</h5>
                     <p className="text-xs text-gray-300 bg-gray-900/50 p-3 rounded-md italic">"{briefing.suggestedCampaign.rationale}"</p>
                     <div className="mt-3 flex justify-between items-center bg-gray-900/50 p-2 rounded-md">
                        <div className="text-sm">
                            <span className="text-gray-400">Mission: </span>
                            <span className="font-semibold text-white">{briefing.suggestedCampaign.protocolName}</span>
                            <span className="text-yellow-300 ml-2"> (+{briefing.suggestedCampaign.bonusXp} XP)</span>
                        </div>
                        <button onClick={handleApplySuggestion} className="bg-cyan-500 text-black font-bold py-1 px-3 rounded-md text-xs hover:bg-cyan-400">
                            Apply Suggestion
                        </button>
                     </div>
                </div>
            )}
            <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-700/50">
                <h4 className="font-semibold text-white mb-3">Manual Campaign Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mission of the Week */}
                    <div className="space-y-3">
                        <h5 className="font-semibold text-gray-300 text-sm">Mission of the Week</h5>
                        <select value={missionProtocolId} onChange={e => setMissionProtocolId(e.target.value)} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 text-sm">
                           <option value="">-- Select Protocol --</option>
                           {protocols.filter(p => !p.isPersonalized).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" placeholder="Bonus XP" value={missionBonusXp} onChange={e => setMissionBonusXp(e.target.value)} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 text-sm" />
                        <button onClick={() => missionMutation.mutate()} disabled={missionMutation.isPending} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-500 text-sm">Set Mission</button>
                   </div>
                   {/* Platform Announcement */}
                   <div className="space-y-3 flex flex-col">
                       <h5 className="font-semibold text-gray-300 text-sm">Platform Announcement</h5>
                       <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} rows={3} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 text-sm flex-grow" />
                       <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2"><input type="checkbox" id="ann-active" checked={isAnnouncementActive} onChange={e => setIsAnnouncementActive(e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500" /><label htmlFor="ann-active" className="text-xs text-gray-300">Active</label></div>
                           <button onClick={() => announcementMutation.mutate()} disabled={announcementMutation.isPending} className="w-auto bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 text-sm">Save Announcement</button>
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
};


const GrowthEngineDashboard: React.FC = () => {
    const { getPlatformAnalytics, protocols, platformConfig } = useDataStore();
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;

    const analyticsQuery = useQuery({
        queryKey: ['platformAnalytics'],
        queryFn: getPlatformAnalytics,
    });

    const briefingQuery = useQuery({
        queryKey: ['growthBriefing', analyticsQuery.data],
        queryFn: () => getAdminGrowthBriefing(analyticsQuery.data!, protocols),
        enabled: !!analyticsQuery.data && protocols.length > 0 && isAiEnabled,
    });

    const isApiKeyMissing = !process.env.API_KEY;

    if (analyticsQuery.isLoading) {
        return <div className="text-center text-gray-400">Loading Platform Vitals...</div>;
    }

    if (analyticsQuery.error) {
        return <div className="text-center text-red-400">Error loading analytics.</div>;
    }

    if (!analyticsQuery.data) {
        return <div className="text-center text-gray-400">No analytics data available.</div>;
    }

    const { dau, newUsers, protocolsLogged, topContributor, mostPopularStack, userFunnel } = analyticsQuery.data;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <VitalsCard title="Daily Active Users" value={dau?.toLocaleString() || 'N/A'} change={2.1} />
                <VitalsCard title="New Users (Week)" value={newUsers?.toLocaleString() || 'N/A'} change={5.8} />
                <VitalsCard title="Protocols Logged (24h)" value={protocolsLogged?.toLocaleString() || 'N/A'} change={-1.5} />
                <VitalsCard title="Top Contributor" value={topContributor || 'N/A'} />
                <VitalsCard title="Most Popular Stack" value={mostPopularStack || 'N/A'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    {userFunnel && <UserFunnel data={userFunnel} />}
                </div>
                <div className="lg:col-span-2 space-y-4">
                    {isApiKeyMissing || !isAiEnabled ? (
                        <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg text-sm">
                            <strong>AI Briefing Disabled:</strong> {!isAiEnabled ? "This feature has been disabled by the administrator." : "A Gemini API key is required."}
                        </div>
                    ) : briefingQuery.isLoading ? (
                         <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-700/50 flex items-center justify-center h-full">
                            <svg className="animate-spin h-6 w-6 text-sky-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            <span className="text-gray-300">Kai is analyzing the data...</span>
                         </div>
                    ) : briefingQuery.isSuccess ? (
                        <CampaignCommand briefing={briefingQuery.data} />
                    ) : (
                         <div className="text-center text-red-400">Error loading AI briefing.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrowthEngineDashboard;