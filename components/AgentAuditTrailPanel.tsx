import React from 'react';
import { useUserStore } from '../stores/userStore';

const AgentAuditTrailPanel: React.FC = () => {
    const auditTrail = useUserStore(state => state.auditTrail);
    const user = useUserStore(state => state.user);

    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <div className="flex items-start gap-4 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-red-300 flex-shrink-0">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                </svg>
                <div>
                    <h3 className="font-title text-xl font-bold text-red-300">Agent Audit Trail</h3>
                    <p className="text-gray-400 text-sm max-w-xl">
                        For transparency and accountability, every significant action taken by an AI agent is recorded and anchored. This creates an immutable, verifiable log of all AI-driven recommendations.
                    </p>
                </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {auditTrail.length > 0 ? (
                    auditTrail.map(event => (
                        <div key={event.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-red-400">{event.agent}</p>
                                    <p className="text-sm text-gray-300">{event.summary}</p>
                                    <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                                </div>
                                <a 
                                    href={`https://sepolia.etherscan.io/tx/${event.txHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-400 hover:underline flex-shrink-0 ml-4"
                                >
                                    Verify
                                </a>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1">
                                <p className="text-xs text-gray-400 font-mono break-all">
                                    <span className="font-semibold">Data Hash:</span> {event.dataSnapshotHash}
                                </p>
                                <p className="text-xs text-gray-400 font-mono break-all">
                                    <span className="font-semibold">Tx Hash:</span> {event.txHash}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No agent actions recorded yet. Use an AI feature like "Kai's Intelligence Briefing" to generate an audit event.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentAuditTrailPanel;
