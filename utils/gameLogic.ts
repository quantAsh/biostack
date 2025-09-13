import { Protocol, Category, Combo, StackVitals } from '../types';
import { combos } from '../data/combos';

export const calculateStackScore = (hand: Protocol[]): number => {
    if (!hand || hand.length === 0) return 0;

    const baseScore = hand.reduce((acc, card) => {
        return acc + (card.gameStats?.attack || 0) + (card.gameStats?.defense || 0);
    }, 0);

    let synergyBonus = 0;
    const categoryCounts: Record<string, number> = {};
    hand.forEach(card => {
        card.categories.forEach(cat => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
    });
    Object.values(categoryCounts).forEach(count => {
        if (count > 1) synergyBonus += count * 5;
    });

    let comboBonus = 0;
    const handCategories = new Set(hand.flatMap(c => c.categories));
    combos.forEach(combo => {
        if (handCategories.has(combo.primeCategory) && handCategories.has(combo.triggerCategory)) {
            comboBonus += 50;
        }
    });

    return Math.round(baseScore + synergyBonus + comboBonus);
};

export const calculateSynergyScore = (stackProtocols: Protocol[]): 'S' | 'A' | 'B' | 'C' => {
    if (stackProtocols.length < 2) return 'C';

    let score = 0;
    const categories = new Set(stackProtocols.flatMap(p => p.categories));

    // Bonus for diversity
    score += categories.size * 10;

    // Penalty for too many of one category (overspecialization)
    const categoryCounts: { [key: string]: number } = {};
    stackProtocols.flatMap(p => p.categories).forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(categoryCounts));
    if (maxCount > 3) {
        score -= (maxCount - 3) * 10;
    }

    // Specific synergy bonuses
    const has = (cat: Category) => categories.has(cat);
    if (has(Category.Light) && has(Category.Sleep)) score += 20; // Circadian rhythm
    if (has(Category.Fasting) && has(Category.Nutrition)) score += 15; // Refeeding
    if (has(Category.Movement) && has(Category.ColdExposure)) score += 15; // Recovery
    if (has(Category.Breathwork) && has(Category.Mindfulness)) score += 20; // Mental stack
    if (has(Category.Energy) && has(Category.Sleep)) score += 25; // Energy cycle

    const scorePerProtocol = score / stackProtocols.length;

    if (scorePerProtocol >= 28) return 'S';
    if (scorePerProtocol >= 22) return 'A';
    if (scorePerProtocol >= 15) return 'B';
    return 'C';
};

const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 0;
    const lowerDuration = duration.toLowerCase();

    const rangeMatch = lowerDuration.match(/(\d+)-(\d+)\s*minutes?/);
    if (rangeMatch) {
        return (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
    }

    const singleMatch = lowerDuration.match(/(\d+)\s*minutes?/);
    if (singleMatch) {
        return parseInt(singleMatch[1]);
    }
    
    return 0; // Ignore "Varies", "Daily", "Lifestyle", etc.
};

const getSynergyInsight = (stack: Protocol[], synergyScore: StackVitals['synergyScore'], netBioRhythmImpact: number): string => {
    if (stack.length < 2) return "Add more protocols to analyze synergy.";
    
    switch (synergyScore) {
        case 'S':
            return "Exceptional synergy. This stack offers a comprehensive and balanced approach to your wellness.";
        case 'A':
            if (netBioRhythmImpact > 30) return "Excellent synergy, strongly focused on activation and energy.";
            if (netBioRhythmImpact < -30) return "Excellent synergy, strongly focused on recovery and calm.";
            return "Excellent synergy with a good balance between activating and calming protocols.";
        case 'B':
            const categories = new Set(stack.flatMap(p => p.categories));
            if (!categories.has(Category.Sleep) && !categories.has(Category.StressManagement) && !categories.has(Category.Mindfulness)) {
                return "Good synergy, but could be improved by adding protocols for recovery and stress management.";
            }
            return "A solid stack with good foundational synergy. Consider diversifying categories for a higher score.";
        default:
             return "This collection of protocols has low synergy. Try combining protocols that support each other, like 'Energy' and 'Sleep'.";
    }
};

export const calculateStackVitals = (stack: Protocol[]): StackVitals => {
    if (stack.length === 0) {
        return {
            totalBioScore: 0,
            arenaAttack: 0,
            arenaDefense: 0,
            dominantCategory: 'N/A',
            synergyScore: 'N/A',
            totalTimeMinutes: 0,
            totalStaminaCost: 0,
            netBioRhythmImpact: 0,
            synergyInsight: "Your stack is empty. Add protocols to see your vitals."
        };
    }

    const totalBioScore = stack.reduce((sum, p) => sum + (p.bioScore || 0), 0);
    const arenaAttack = stack.reduce((sum, p) => sum + (p.gameStats?.attack || 0), 0);
    const arenaDefense = stack.reduce((sum, p) => sum + (p.gameStats?.defense || 0), 0);
    
    const categoryCounts = stack.flatMap(p => p.categories).reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<Category, number>);
    
    const dominantCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as Category | 'Mixed' || 'Mixed';
    
    const synergyScore = calculateSynergyScore(stack);
    const totalTimeMinutes = stack.reduce((sum, p) => sum + parseDurationToMinutes(p.duration), 0);
    const totalStaminaCost = stack.reduce((sum, p) => sum + (p.staminaCost || 0), 0);
    const netBioRhythmImpact = stack.reduce((sum, p) => sum + (p.bioRhythmImpact || 0), 0);
    const synergyInsight = getSynergyInsight(stack, synergyScore, netBioRhythmImpact);

    return {
        totalBioScore,
        arenaAttack,
        arenaDefense,
        dominantCategory,
        synergyScore,
        totalTimeMinutes,
        totalStaminaCost,
        netBioRhythmImpact,
        synergyInsight
    };
};