import { ResearchBounty } from '../types';

export const mockResearchBounties: ResearchBounty[] = [
    {
        id: 'bounty-1',
        user_id: 'user-anya-sharma',
        author: 'Dr. Anya Sharma',
        question: 'What is the collective\'s most effective non-caffeine protocol for overcoming the 2 PM energy slump after a high-carb lunch?',
        description: 'Many of us experience post-prandial somnolence, especially after carbohydrate-rich meals. This bounty seeks to identify the highest-efficacy, non-stimulant protocols to counteract this dip in energy and focus, based on real-world user data.',
        totalStake: 25500,
        stakers: {
            'user-anya-sharma': 10000,
            'user-ben-g': 5000,
            'user-sleephacker-99': 2500,
            'dev-super-user': 8000,
        },
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
        status: 'active',
        results: null,
    },
    {
        id: 'bounty-4-completed',
        user_id: 'user-quantumleaper',
        author: 'QuantumLeaper',
        question: 'What is the optimal protocol for mitigating brain fog after international travel?',
        description: 'Jet lag and travel stress often lead to significant cognitive impairment and brain fog. This research aims to find the single most effective protocol for rapidly restoring mental clarity after long-haul flights.',
        totalStake: 10000,
        stakers: { 'user-quantumleaper': 10000 },
        createdAt: new Date(Date.now() - 20 * 86400000), // 20 days ago
        status: 'completed',
        results: {
            summary: 'The collective data indicates that protocols enhancing cognitive flexibility and providing cellular energy are most effective. The Feynman Technique showed the highest efficacy in restoring self-reported mental clarity within 48 hours post-travel.',
            protocolId: '28' // The Feynman Technique
        },
    },
    {
        id: 'bounty-2',
        user_id: 'user-ben-g',
        author: 'Ben G.',
        question: 'Which specific breathwork technique shows the highest correlation with increased HRV on the following day?',
        description: 'While many breathwork protocols claim to improve Heart Rate Variability (HRV), this bounty aims to quantify which specific method (e.g., Box Breathing, Wim Hof, 4-7-8) has the most statistically significant positive impact on next-day HRV readings from wearables like Oura and WHOOP.',
        totalStake: 12000,
        stakers: {
            'user-ben-g': 5000,
            'dev-super-user': 7000,
        },
        createdAt: new Date(Date.now() - 7 * 86400000), // 7 days ago
        status: 'active',
        results: null,
    },
     {
        id: 'bounty-3',
        user_id: 'user-sleephacker-99',
        author: 'SleepHacker_99',
        question: 'Identify the most potent protocol stack (2-3 protocols) for increasing deep sleep duration by over 15%.',
        description: 'Deep sleep is critical for physical recovery and memory consolidation. This research seeks to find emergent patterns from the collective data, identifying synergistic combinations of protocols that lead to the largest improvements in deep sleep percentage and duration.',
        totalStake: 8500,
        stakers: {
            'user-sleephacker-99': 8500,
        },
        createdAt: new Date(Date.now() - 1 * 86400000), // 1 day ago
        status: 'active',
        results: null,
    },
];
