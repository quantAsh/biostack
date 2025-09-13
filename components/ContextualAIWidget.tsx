import React, { useState } from 'react';
import { TriageReportData, BriefingData, CorrelationData, DiagnosticStatus, Protocol, UserStack, FeedbackRating, SavedReport } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORY_DETAILS } from '../constants';
import { KaiIcon } from './KaiIcon';
import toast from 'react-hot-toast';

type ContextualAIWidgetProps = {
    type: 'triage' | 'briefing' | 'correlation';
    data: TriageReportData | BriefingData | CorrelationData[];
};

const FeedbackComponent: React.FC<{ contextData: any, view: string }> = ({ contextData, view }) => {
    const { submitFeedback } = useDataStore();
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState('');

    const handleFeedback = (rating: FeedbackRating) => {
        if (feedbackSent) return;
        
        if (rating === 'negative') {
            setShowComment(true);
        } else {
            submitFeedback({
                type: 'ai_response',
                rating: 'positive',
                context: {
                    response: JSON.stringify(contextData),
                    view
                }
            });
            toast.success("Feedback submitted!");
            setFeedbackSent(true);
        }
    };
    
    const handleCommentSubmit = () => {
        submitFeedback({
            type: 'ai_response',
            rating: 'negative',
            comment: comment,
            context: {
                response: JSON.stringify(contextData),
                view
            }
        });
        toast.success("Thank you for your feedback!");
        setFeedbackSent(true);
        setShowComment(false);
    };

    if (feedbackSent) {
        return <span className="text-xs text-gray-500">Feedback received</span>;
    }

    if (showComment) {
        return (
            <div className="flex items-center gap-1">
                <input 
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What was wrong?"
                    className="w-full bg-gray-700 text-xs p-1 rounded-md border border-gray-600"
                />
                <button onClick={handleCommentSubmit} className="p-1 rounded-md bg-gray-600 hover:bg-gray-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M2.87 2.22A.75.75 0 0 0 2 2.993v10.014c0 .815.933 1.25 1.58 1.03l10.332-3.399a.75.75 0 0 0 0-1.261L3.58 6.001A.75.75 0 0 0 2.87 2.22Z" /></svg></button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Rate this analysis:</span>
            <button onClick={() => handleFeedback('positive')} title="Good response" className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M11.238 2.517a1.75 1.75 0 0 1 2.33 2.232l-1.343 4.21a1.75 1.75 0 0 1-1.658 1.291H6.25V14a.75.75 0 0 1-1.5 0V7.5h-.5a.75.75 0 0 1 0-1.5h.5V2.75a.75.75 0 0 1 1.5 0v3.522l1.68-.84c.34-.17.712-.257 1.082-.257H10.5v-.5a.75.75 0 0 1 .738-.75Z" />
                </svg>
            </button>
            <button onClick={() => handleFeedback('negative')} title="Bad response" className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-red-400">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M4.762 13.483a1.75 1.75 0 0 1-2.33-2.232l1.343-4.21a1.75 1.75 0 0 1 1.658-1.291h4.25V2a.75.75 0 0 1 1.5 0v6.5h.5a.75.75 0 0 1 0 1.5h-.5v3.25a.75.75 0 0 1-1.5 0V9.978l-1.68.84c-.34.17-.712-.257-1.082-.257H5.5v.5a.75.75 0 0 1-.738-.75Z" />
                </svg>
            </button>
        </div>
    );
};

const statusStyles: Record<DiagnosticStatus, { text: string; bg: string; dot: string; dotColor: string }> = {
    optimal: { text: 'text-green-300', bg: 'bg-green-900/50 border border-green-500/30', dot: 'bg-green-400', dotColor: '#4ade80' },
    borderline: { text: 'text-yellow-300', bg: 'bg-yellow-900/50 border border-yellow-500/30', dot: 'bg-yellow-400', dotColor: '#facc15' },
    high: { text: 'text-red-400', bg: 'bg-red-900/50 border border-red-500/30', dot: 'bg-red-500', dotColor: '#f87171' },
    low: { text: 'text-red-400', bg: 'bg-red-900/50 border border-red-500/30', dot: 'bg-red-500', dotColor: '#f87171' },
};

const TriageReportWidget: React.FC<{ data: TriageReportData; onSave: () => void; }> = ({ data, onSave }) => {
    const { protocols } = useDataStore();
    const { toggleStack, myStack, isAgentModeEnabled } = useUserStore();
    const { showDetails } = useUIStore();
    const style = statusStyles[data.status] || statusStyles.optimal;
    const recommendedProtocol = data.recommendation ? protocols.find(p => p.id === data.recommendation?.protocolId) : null;
    const isInStack = recommendedProtocol ? myStack.some(p => 'id' in p && p.id === recommendedProtocol.id) : false;

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="font-hud text-sm uppercase tracking-widest text-cyan-300/80">Priority Metric</p>
                <p className={`font-hud font-bold text-4xl ${style.text}`}>{data.priorityMetric}</p>
                <p className={`font-hud font-semibold text-xl ${style.text}`}>{data.value} <span className="text-lg uppercase opacity-70">{data.status}</span></p>
            </div>
            <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-400/30">
                <h4 className="font-bold text-sm text-cyan-300 mb-1">Insight</h4>
                <p className="text-sm text-gray-300">{data.insight}</p>
            </div>
            {recommendedProtocol && data.recommendation && (
                 <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-400/30">
                    <h4 className="font-bold text-sm text-cyan-300 mb-2">Recommended Intervention</h4>
                    <div className="bg-black/30 p-3 rounded-lg flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                            <CategoryIcon category={recommendedProtocol.categories[0]} className="w-8 h-8" style={{color: CATEGORY_DETAILS[recommendedProtocol.categories[0]].color}}/>
                        </div>
                        <div>
                            <p className="font-bold text-white">{recommendedProtocol.name}</p>
                            <p className="text-xs text-gray-400">{data.recommendation.rationale}</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-2 mt-3 text-sm font-semibold">
                         <button onClick={() => showDetails(recommendedProtocol)} className="w-full text-center py-2 rounded-md bg-gray-600/50 hover:bg-gray-600/80 transition-colors">Details</button>
                         <button onClick={() => toggleStack(recommendedProtocol)} className={`w-full text-center py-2 rounded-md ${isInStack ? 'bg-red-800/80 hover:bg-red-700/80' : 'bg-cyan-600 hover:bg-cyan-500'} transition-colors`}>
                            {isInStack ? 'In Stack' : 'Add to Stack'}
                         </button>
                     </div>
                </div>
            )}
            <div className="mt-2 space-y-2">
                 <button 
                    disabled={!isAgentModeEnabled} 
                    title={!isAgentModeEnabled ? "Enable Agent Mode in Settings to unlock." : "Book a follow-up test with a partner lab."}
                    className="w-full text-center py-2 rounded-md bg-gray-800/50 text-gray-400 border border-dashed border-gray-600 enabled:cursor-pointer enabled:hover:bg-purple-800/50 enabled:hover:text-purple-300 enabled:hover:border-purple-600 transition-colors"
                  >
                    Book Follow-up Test (KAI-Concierge)
                 </button>
            </div>
             <div className="mt-4 pt-4 border-t border-cyan-500/20 flex justify-between items-center">
                <FeedbackComponent contextData={data} view="digital-twin-triage" />
                <button onClick={onSave} className="text-xs font-semibold bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md">Save Report</button>
            </div>
        </div>
    );
}

const BriefingWidget: React.FC<{ data: BriefingData; onSave: () => void; }> = ({ data, onSave }) => {
    const { protocols } = useDataStore();
    return (
        <div className="space-y-4">
            <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-400/30">
                <h4 className="font-bold text-sm text-cyan-300 mb-1 flex items-center gap-2"><KaiIcon className="w-4 h-4" /> Intelligence Analysis</h4>
                <p className="text-sm text-gray-300">{data.analysis}</p>
            </div>
            {data.recommendations.length > 0 && (
                <div>
                    <h4 className="font-bold text-sm text-cyan-300 mb-2">Protocol Recommendations</h4>
                    <div className="space-y-2">
                        {data.recommendations.map(rec => {
                            const protocol = protocols.find(p => p.id === rec.protocolId);
                            if (!protocol) return null;
                            return (
                                <div key={rec.protocolId} className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-400/30 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                                        <CategoryIcon category={protocol.categories[0]} className="w-5 h-5" style={{color: CATEGORY_DETAILS[protocol.categories[0]].color}}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-white">{protocol.name}</p>
                                        <p className="text-xs text-gray-400">{rec.justification}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
             <div className="mt-4 pt-4 border-t border-cyan-500/20 flex justify-between items-center">
                <FeedbackComponent contextData={data} view="digital-twin-briefing" />
                 <button onClick={onSave} className="text-xs font-semibold bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md">Save Report</button>
            </div>
        </div>
    );
};

const CorrelationWidget: React.FC<{ data: CorrelationData[]; onSave: () => void; }> = ({ data, onSave }) => {
    return (
        <div className="space-y-3">
            {data.map((corr, index) => (
                <div key={index} className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center gap-3">
                        {corr.change.includes('increase') || corr.change.includes('improvement') ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-400 flex-shrink-0"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.28 9.64a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400 flex-shrink-0"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.97-4.03a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 4.03V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
                        )}
                        <p className="text-sm text-gray-300">
                            <strong className="text-white">{corr.correlatedProtocol}</strong> appears correlated with an <strong className={corr.change.includes('increase') || corr.change.includes('improvement') ? 'text-green-300' : 'text-red-300'}>{corr.change}</strong> in <strong className="text-white">{corr.metric}</strong>.
                        </p>
                    </div>
                     <p className="text-xs text-gray-500 mt-1 pl-9">Insight: {corr.insight}</p>
                </div>
            ))}
            <div className="mt-4 pt-4 border-t border-cyan-500/20 flex justify-between items-center">
                <FeedbackComponent contextData={data} view="digital-twin-correlation" />
                 <button onClick={onSave} className="text-xs font-semibold bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md">Save Report</button>
            </div>
        </div>
    );
};

const ContextualAIWidget: React.FC<ContextualAIWidgetProps> = ({ type, data }) => {
    const { saveReport } = useUserStore();

    if (!data) return null;

    const handleSaveReport = () => {
        saveReport({ type, data });
    };
    
    switch (type) {
        case 'triage':
            return <TriageReportWidget data={data as TriageReportData} onSave={handleSaveReport} />;
        case 'briefing':
            return <BriefingWidget data={data as BriefingData} onSave={handleSaveReport} />;
        case 'correlation':
            return <CorrelationWidget data={data as CorrelationData[]} onSave={handleSaveReport} />;
        default:
            return <p className="text-gray-500">Unsupported analysis format.</p>;
    }
};

export default ContextualAIWidget;