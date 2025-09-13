import { CommunityStack } from '../types';

export const communityStacks: CommunityStack[] = [
  {
    id: '1',
    user_id: 'user-ben-g',
    author: 'Ben G.',
    name: 'The "Deep Work" Focus Stack',
    description: 'My go-to stack for intense, focused work sessions. The fasting and coffee get me sharp, and the beats keep me in the zone. Box breathing is for pre-meeting calm.',
    protocol_ids: ['1', '6', '8', '3'],
    upvotes: 127,
    isVerified: true,
  },
  {
    id: '3',
    user_id: 'user-sleephacker-99',
    author: 'SleepHacker_99',
    name: 'Ultimate Sleep Sanctuary',
    description: 'After struggling with sleep for years, this combo is what finally worked. Grounding helps me unwind, and the sleep optimization rules are key. Binaural beats are the final piece.',
    protocol_ids: ['5', '7', '8'],
    upvotes: 88,
  },
  {
    id: '4',
    user_id: 'user-anya-sharma',
    author: 'Dr. Anya Sharma',
    name: 'Longevity Starter Pack',
    description: 'A foundational stack targeting key pillars of longevity: metabolic health, mitochondrial function, and physical stability. Great for anyone serious about healthspan.',
    protocol_ids: ['12', '20', '23', '9'],
    upvotes: 204,
    isVerified: true,
  },
  {
    id: '7-completed-bounty',
    user_id: 'user-quantumleaper',
    author: 'QuantumLeaper',
    name: 'Post-Travel Brain Fog Mitigator',
    description: 'Based on the findings from the KAIROS bounty, this stack is designed to rapidly restore mental clarity after travel using proven cognitive and cellular energy protocols.',
    protocol_ids: ['28', '26', '21'], // Feynman Technique, Creatine, Morning Sunlight
    productIds: ['prod_momentous'], // Momentous Creatine
    upvotes: 42,
    forked_from_id: 'bounty-4-completed',
    forked_from_name: 'KAIROS Insight',
  },
  {
    id: '5',
    user_id: 'user-quantumleaper',
    author: 'QuantumLeaper',
    name: 'The Neuroplasticity Stack',
    description: 'Designed for intense learning periods. Use this stack when studying for an exam or trying to acquire a new skill. The combination enhances focus, learning, and memory consolidation.',
    protocol_ids: ['28', '17', '8', '5'],
    upvotes: 158,
  },
  {
    id: '6',
    user_id: 'user-sleephacker-99',
    author: 'SleepHacker_99',
    name: 'Evening Wind-Down',
    description: 'My nightly non-negotiable stack to shut down the sympathetic nervous system and prepare for deep, restorative sleep.',
    protocol_ids: ['22', '16', '7', '24'],
    upvotes: 95,
  }
];
