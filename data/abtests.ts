import { ABTest } from '../types';

export const mockABTests: ABTest[] = [
  {
    id: 'ab_test_1',
    name: 'Re-engagement: Walk vs. Breathwork',
    targetSegment: 'inactive_7_days',
    conversionGoal: 'User completes any protocol within 24 hours of notification.',
    status: 'active',
    variants: [
      {
        name: 'A',
        protocolId: '23', // Post-Meal Walk
        results: { impressions: 1250, conversions: 150 },
      },
      {
        name: 'B',
        protocolId: '3', // Box Breathing
        results: { impressions: 1245, conversions: 182 },
      },
    ],
  },
  {
    id: 'ab_test_2',
    name: 'New User Activation: Sunlight vs. Gratitude',
    targetSegment: 'new_users',
    conversionGoal: 'User logs first journal entry.',
    status: 'completed',
    variants: [
      {
        name: 'A',
        protocolId: '21', // Morning Sunlight
        results: { impressions: 800, conversions: 240 }, // 30%
      },
      {
        name: 'B',
        protocolId: '24', // Gratitude Journaling
        results: { impressions: 810, conversions: 300 }, // 37%
      },
    ],
    winner: 'B',
  },
];
