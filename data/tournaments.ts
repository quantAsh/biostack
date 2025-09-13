import { Tournament } from '../types';

export const mockTournaments: Tournament[] = [
    {
        id: 'tourney-1',
        name: 'The Genesis Gauntlet',
        description: 'The inaugural BiohackStack tournament. Prove your mastery and claim the grand prize!',
        entryFee: 100,
        prizePool: 10000,
        status: 'live',
        players: [],
        rounds: [],
        startDate: new Date(Date.now() + 7 * 86400000).toISOString(), // One week from now
        isLive: true,
        streamLink: 'https://www.twitch.tv/biohackstack',
        casters: {
            strategist: 'Caster_Flow',
            analyst: 'Dr. Synapse'
        },
        featuredMatch: {
            players: [
                { userId: 'user-anya-sharma', displayName: 'Dr. Anya Sharma' },
                { userId: 'user-ben-g', displayName: 'Ben G.' }
            ]
        }
    },
    {
        id: 'tourney-2',
        name: 'Metabolic Masters Open',
        description: 'A tournament focused on protocols from Nutrition, Fasting, and Movement categories. Only the most metabolically flexible will survive.',
        entryFee: 250,
        prizePool: 25000,
        status: 'upcoming',
        players: [],
        rounds: [],
        startDate: new Date(Date.now() + 14 * 86400000).toISOString(), // Two weeks from now
    },
    {
        id: 'tourney-3',
        name: 'Mindful Mogul Championship',
        description: 'A test of focus and resilience. This tournament features Cognitive, Mindfulness, and Stress Management protocols.',
        entryFee: 50,
        prizePool: 5000,
        status: 'completed',
        players: [
            { userId: 'user-anya-sharma', displayName: 'Dr. Anya Sharma' },
            { userId: 'user-ben-g', displayName: 'Ben G.' },
        ],
        rounds: [], // simplified for mock data
        startDate: new Date(Date.now() - 7 * 86400000).toISOString(), // One week ago
    },
];