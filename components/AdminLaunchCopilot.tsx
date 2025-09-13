import React from 'react';
import { launchPlanData } from '../data/launchPlan';
import { useUIStore } from '../stores/uiStore';

const AdminLaunchCopilot: React.FC = () => {
    const { setAdminTab, setGrowthEngineSubTab } = useUIStore();

    const handleNavigation = (view: any, subTab?: any) => {
        setAdminTab(view);
        if (subTab) {
            setGrowthEngineSubTab(subTab);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="font-title text-3xl font-bold text-sky-300">3-Month Launch & Growth Plan</h3>
                <p className="text-gray-400 mt-2">Your operational playbook for launching and growing BiohackStack, executed directly from the Command Center.</p>
            </div>

            {launchPlanData.map(phase => (
                <div key={phase.month} className="timeline-phase">
                    <h2 className="font-hud text-2xl font-bold text-gray-200 mb-4 tracking-wider">
                        <span className="text-sky-400">Month {phase.month}:</span> {phase.phase}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 pl-2 border-l-2 border-sky-500/30">{phase.primaryGoal}</p>

                    <div className="launch-plan-timeline">
                        {phase.weeks.map(week => (
                            <div key={week.week} className="timeline-week">
                                <h3 className="font-title text-lg font-bold text-gray-300 mb-1">{week.week}</h3>
                                <p className="text-sm text-sky-300 font-semibold mb-3">{week.goal}</p>
                                <div className="space-y-4">
                                    {week.actions.map(action => (
                                        <div key={action.title} className="timeline-step">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-grow">
                                                    <h4 className="font-semibold text-white">{action.title}</h4>
                                                    <p className="text-sm text-gray-400 mt-1">{action.description}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleNavigation(action.tool.view, action.tool.subTab)}
                                                    className="step-action-button flex-shrink-0"
                                                >
                                                    {action.tool.label}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminLaunchCopilot;