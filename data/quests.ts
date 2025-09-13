import { Quest } from '../types';

export const mockQuests: Quest[] = [
    {
        id: 'quest-1',
        title: 'Morning Anchor',
        description: 'Start your day right by anchoring your circadian rhythm. Perform the Morning Sunlight protocol.',
        protocolId: '21',
        location: 'Outdoors',
        xpReward: 25,
        bioTokenReward: 5,
    },
    {
        id: 'quest-2',
        title: 'Nature\'s Calm',
        description: 'Connect with nature to reduce stress. Find a park and perform the Forest Bathing protocol.',
        protocolId: '13',
        location: 'Any Park',
        xpReward: 50,
        bioTokenReward: 10,
    },
    {
        id: 'quest-3',
        title: 'Metabolic Reset',
        description: 'Blunt a post-meal glucose spike. Take a short walk after your largest meal.',
        protocolId: '23',
        location: 'Anywhere',
        xpReward: 20,
        bioTokenReward: 5,
    },
];
