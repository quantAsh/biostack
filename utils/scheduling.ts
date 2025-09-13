import { Protocol, Category } from '../types';

export const getProtocolTimeOfDay = (protocol: Protocol): 'Morning' | 'Afternoon' | 'Evening' => {
    const name = protocol.name.toLowerCase();
    const description = protocol.description.toLowerCase();
    
    // PRIORITY 1: Explicit keywords in the protocol NAME take precedence over everything.
    if (name.includes('morning') || name.includes('sunrise')) return 'Morning';
    if (name.includes('evening') || name.includes('bedtime') || name.includes('sleep optimization')) return 'Evening';

    // PRIORITY 2: Check for unambiguous keywords in the full text (name + description).
    const fullText = `${name} ${description}`;
    const morningKeywords = ['waking', 'daytime', 'energize', 'alertness'];
    const eveningKeywords = ['wind down', 'relax', 'unwind', 'prepare for sleep'];

    const hasMorningKeyword = morningKeywords.some(kw => fullText.includes(kw));
    const hasEveningKeyword = eveningKeywords.some(kw => fullText.includes(kw));

    if (hasMorningKeyword && !hasEveningKeyword) return 'Morning';
    if (hasEveningKeyword && !hasMorningKeyword) return 'Evening';
    
    // PRIORITY 3: Fallback to CATEGORIES, handling potential conflicts.
    const morningCats = new Set([Category.Energy, Category.Movement, Category.Light, Category.ColdExposure]);
    const eveningCats = new Set([Category.Sleep, Category.Mindfulness, Category.StressManagement, Category.Sound]);

    const isMorningCat = protocol.categories.some(c => morningCats.has(c));
    const isEveningCat = protocol.categories.some(c => eveningCats.has(c));

    if (isMorningCat && !isEveningCat) return 'Morning';
    if (isEveningCat && !isMorningCat) return 'Evening';
    
    // Default for protocols that don't fit cleanly.
    return 'Afternoon';
};
