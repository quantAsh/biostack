import React, { useMemo } from 'react';
import { Protocol, Category } from '../types';
import { useUserStore } from '../stores/userStore';
import { VIEW_THEMES } from '../constants';
import { calculateStackVitals } from '../utils/gameLogic';
import TipHUD from './TipHUD';
import { useUIStore } from '../stores/uiStore';
import { KaiIcon } from './KaiIcon';

interface StackLabHeaderProps {
  myProtocols?: Protocol[];
  stackAlpha?: Protocol[];
  stackBravo?: Protocol[];
}

const StackAnalysisHUD: React.FC<{ myProtocols: Protocol[] }> = ({ myProtocols }) => {
    const analysis = useMemo(() => {
        if (myProtocols.length < 2) {
            return { insight: null, recommendation: "Add at least two protocols to your stack for Kai to provide an analysis." };
        }

        const categoryCounts = myProtocols.flatMap(p => p.categories).reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<Category, number>);

        const dominantCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => Number(b) - Number(a))[0]?.[0] as Category | undefined;
        
        let insight = `Your stack has a strong focus on <strong>${dominantCategory}</strong> protocols.`;
        let recommendation = null;

        const allCategories = new Set(Object.keys(categoryCounts));

        if (dominantCategory === Category.Cognitive || dominantCategory === Category.Energy || dominantCategory === Category.Movement) {
            if (!allCategories.has(Category.Sleep) && !allCategories.has(Category.StressManagement) && !allCategories.has(Category.Mindfulness)) {
                recommendation = "Consider adding a <strong>Sleep</strong> or <strong>Stress Management</strong> protocol to balance activation with recovery.";
            }
        } else if (dominantCategory === Category.Sleep || dominantCategory === Category.StressManagement) {
             if (!allCategories.has(Category.Movement) && !allCategories.has(Category.Energy) && !allCategories.has(Category.Light)) {
                recommendation = "Excellent for recovery. A <strong>Morning Light</strong> or <strong>Movement</strong> protocol could boost your daytime energy.";
            }
        } else if (dominantCategory === Category.Fasting && !allCategories.has(Category.Nutrition)) {
            recommendation = "Fasting is powerful. Pair it with a <strong>Nutrition</strong> protocol to optimize your refeeding window.";
        }
        
        if (!recommendation && myProtocols.length > 3) {
            recommendation = "This is a well-balanced stack. To further optimize, explore <strong>Sandbox Mode</strong> to A/B test different combinations.";
        }

        return { insight, recommendation };

    }, [myProtocols]);

    if (!analysis.insight && !analysis.recommendation) {
        return null;
    }

    return (
        <div className="mt-3 pt-3 border-t border-teal-500/20">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <KaiIcon className="w-6 h-6 text-teal-300 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-white">Kai's Stack Analysis</h4>
                        {analysis.insight && <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: analysis.insight }} />}
                        {analysis.recommendation && (
                            <p className="text-sm text-teal-300 mt-1" dangerouslySetInnerHTML={{ __html: analysis.recommendation }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const StackVitalsDisplay: React.FC<{ stack: Protocol[], name: string, nameColor: string }> = ({ stack, name, nameColor }) => {
    const vitals = calculateStackVitals(stack);
    const synergyColor = { S: '#fde047', A: '#4ade80', B: '#60a5fa', C: '#9ca3af', 'N/A': '#9ca3af' }[vitals.synergyScore];
    
    return (
        <div className="comparison-pod">
            <h3 className="font-hud text-xl font-bold mb-3" style={{ color: nameColor }}>{name}</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="vitals-pod">
                    <div className="value text-xl" style={{'--value-color': synergyColor} as React.CSSProperties}>{vitals.synergyScore}</div>
                    <p className="label">Synergy</p>
                </div>
                <div className="vitals-pod">
                    <div className="value text-xl" style={{'--value-color': "#a78bfa"} as React.CSSProperties}>{vitals.totalBioScore}</div>
                    <p className="label">Bio-Score</p>
                </div>
                 <div className="vitals-pod">
                    <div className="value text-xl" style={{'--value-color': "#f87171"} as React.CSSProperties}>{vitals.arenaAttack}</div>
                    <p className="label">ATK</p>
                </div>
                <div className="vitals-pod">
                    <div className="value text-xl" style={{'--value-color': "#60a5fa"} as React.CSSProperties}>{vitals.arenaDefense}</div>
                    <p className="label">DEF</p>
                </div>
            </div>
        </div>
    );
};

const StackLabHeader: React.FC<StackLabHeaderProps> = ({ myProtocols = [], stackAlpha, stackBravo }) => {
    const theme = VIEW_THEMES['my-stack-lab'];
    const isTipDismissed = useUIStore(state => state.isTipDismissed);

    if (stackAlpha && stackBravo) {
        return (
            <div className="dashboard-header comparison-hud !p-4 !border-teal-500/30">
                <StackVitalsDisplay stack={stackAlpha} name="Stack Alpha" nameColor="#38bdf8" />
                <div className="text-center">
                    <h2 className={`font-hud text-3xl font-bold ${theme.textColor}`} style={{ textShadow: '0 0 15px #14b8a6' }}>Sandbox Mode</h2>
                    <p className="text-gray-400 text-sm mt-1">A/B Test Your Stacks</p>
                </div>
                <StackVitalsDisplay stack={stackBravo} name="Stack Bravo" nameColor="#f472b6" />
            </div>
        );
    }

    const vitals = calculateStackVitals(myProtocols);
    const synergyClass = `value synergy-${vitals.synergyScore}`;
    const synergyColor = { S: '#fde047', A: '#4ade80', B: '#60a5fa', C: '#9ca3af', 'N/A': '#9ca3af' }[vitals.synergyScore];
    const bioRhythmPercent = ((Math.max(-150, Math.min(150, vitals.netBioRhythmImpact)) + 150) / 300) * 100;

    return (
        <div className="dashboard-header">
            <div className="header-vitals-bar">
                <div className="vitals-item">
                    <span className="label">SYNERGY</span>
                    <span className="value" style={{ color: synergyColor }}>{vitals.synergyScore}</span>
                </div>
                <div className="divider" />
                <div className="vitals-item">
                    <span className="label">BIO-SCORE</span>
                    <span className="value">{vitals.totalBioScore}</span>
                </div>
                <div className="divider" />
                <div className="vitals-item">
                    <span className="label">ATK/DEF</span>
                    <span className="value">
                        <span className="text-red-400">{vitals.arenaAttack}</span>
                        /
                        <span className="text-blue-400">{vitals.arenaDefense}</span>
                    </span>
                </div>
                <div className="divider" />
                <div className="vitals-item">
                    <span className="label">TIME</span>
                    <span className="value">{vitals.totalTimeMinutes}m</span>
                </div>
                <div className="divider" />
                <div className="vitals-item">
                    <span className="label">STAMINA</span>
                    <span className="value">{vitals.totalStaminaCost}</span>
                </div>
                <div className="divider" />
                <div className="vitals-item biorhythm-item">
                    <span className="label">BIORHYTHM</span>
                    <div className="biorhythm-meter-horizontal">
                        <div className="indicator" style={{ left: `${bioRhythmPercent}%` }} />
                    </div>
                </div>
            </div>
            <StackAnalysisHUD myProtocols={myProtocols} />
            {!isTipDismissed && myProtocols.length > 0 && <div className="mt-3"><TipHUD /></div>}
        </div>
    );
};

export default StackLabHeader;