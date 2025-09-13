import { Campaign } from '../types';

export const mockCampaigns: Campaign[] = [
    {
        id: 'campaign-1',
        name: 'Focus Pack Launch',
        slug: 'focus-pack',
        protocolIds: ['1', '6', '8', '3'],
        targetSegmentId: 'new_users',
        steps: [],
        isActive: true,
    },
    {
        id: 'campaign-2',
        name: 'Longevity Special',
        slug: 'longevity-special',
        protocolIds: ['12', '20', '23', '9'],
        targetSegmentId: 'all_users',
        steps: [],
        isActive: true,
    },
];