import { AdminTab } from '../types';
import { GrowthEngineSubTab } from '../types';

interface LaunchPlanStep {
  title: string;
  description: string;
  tool: {
    label: string;
    view: AdminTab;
    subTab?: GrowthEngineSubTab;
  };
}

interface LaunchPlanWeek {
  week: string;
  goal: string;
  actions: LaunchPlanStep[];
}

interface LaunchPlanPhase {
  month: number;
  phase: string;
  primaryGoal: string;
  weeks: LaunchPlanWeek[];
}

export const launchPlanData: LaunchPlanPhase[] = [
  // Month 1
  {
    month: 1,
    phase: 'The Ignition Phase (Pre-Launch & Launch)',
    primaryGoal: 'Generate initial hype, seed the platform with high-quality content, and execute a smooth, engaging launch for our first cohort of users.',
    weeks: [
      {
        week: 'Weeks 1-2 (Pre-Launch)',
        goal: 'Build the Hype Engine',
        actions: [
          {
            title: 'Create Targeted Landing Pages',
            description: 'Use A/B testing to create and track targeted landing pages for different user personas (e.g., focus optimizers, longevity enthusiasts) to see which acquisition channels are most effective.',
            tool: { label: 'Go to A/B Testing', view: 'growth-engine', subTab: 'ab-testing' },
          },
          {
            title: 'Build Waitlist',
            description: 'Monitor your waitlist growth and export the list to use with your email marketing service for pre-launch announcements.',
            tool: { label: 'Go to Integrations', view: 'growth-engine', subTab: 'integrations' },
          },
        ],
      },
      {
        week: 'Week 3 (Pre-Launch)',
        goal: 'Seed the Ecosystem',
        actions: [
          {
            title: 'Verify High-Quality Stacks',
            description: "Ensure the platform feels alive from day one by creating and verifying 5-10 high-quality 'official' community stacks. A verified checkmark builds immediate trust.",
            tool: { label: 'Go to Content Mgt.', view: 'content' },
          },
          {
            title: 'Optimize Core Content for SEO',
            description: 'Click "SEO" on your most important protocols and stacks to write compelling meta titles and descriptions, preparing them for future public discovery.',
            tool: { label: 'Go to Content Mgt.', view: 'content' },
          },
        ],
      },
      {
        week: 'Week 4 (Launch Week)',
        goal: 'Execute a Flawless Launch',
        actions: [
          {
            title: 'Enable Guided Walkthrough',
            description: 'This is the single most important step for Day 1 user activation. Ensure every new user is guided through the platform\'s core features.',
            tool: { label: 'Go to Platform Settings', view: 'platform' },
          },
          {
            title: 'Set a Launch Week Announcement',
            description: 'Create a sense of a live, dynamic event with a special announcement. Example: "LAUNCH WEEK SPECIAL: Complete 3 protocols in 3 days for a 250 $BIO bonus!"',
            tool: { label: 'Go to Platform Settings', view: 'platform' },
          },
        ],
      },
    ],
  },
  // Month 2
  {
    month: 2,
    phase: 'The Activation Phase (Engagement & Habit Formation)',
    primaryGoal: 'Convert new sign-ups into active, engaged users by helping them experience the "aha!" moment and build daily habits.',
    weeks: [
      {
        week: 'Weeks 5-6',
        goal: 'Drive Core Actions & Habits',
        actions: [
          {
            title: 'Set the Mission of the Week',
            description: 'Use the AI Co-Pilot to set a compelling "Mission of the Week". This simple feature provides a powerful, recurring engagement loop for all users.',
            tool: { label: 'Go to AI Co-Pilot', view: 'growth-engine', subTab: 'dashboard' },
          },
          {
            title: 'Re-engage Slipping Users',
            description: 'Create a segment for new users who have been inactive for 3+ days. Use the Direct Message feature to send them a helpful, encouraging message from Kai.',
            tool: { label: 'Go to User Segments', view: 'users' },
          },
        ],
      },
      {
        week: 'Weeks 7-8',
        goal: 'Foster Community & Competition',
        actions: [
          {
            title: 'Promote the First Tournament',
            description: 'Launch "The Genesis Gauntlet" to create excitement. Use your social channels (managed under Integrations) to promote the live stream.',
            tool: { label: 'Go to Integrations', view: 'growth-engine', subTab: 'integrations' },
          },
          {
            title: 'Spark Collaborative Problem-Solving',
            description: 'Manually resolve an existing research bounty to demonstrate its value. Then, create a new official bounty to address a common user pain point.',
            tool: { label: 'Go to Content Mgt.', view: 'content' },
          },
        ],
      },
    ],
  },
  // Month 3
  {
    month: 3,
    phase: 'The Expansion Phase (Retention & Advocacy)',
    primaryGoal: 'Retain engaged users by providing deep, rewarding experiences and empower them to become advocates who drive organic growth.',
    weeks: [
      {
        week: 'Weeks 9-10',
        goal: 'Deepen Mastery & Utility',
        actions: [
          {
            title: 'Reward Top Users',
            description: "The Genesis Forge is now a key feature. Monitor the Users tab for players reaching Level 20 and encourage them to forge their first NFT protocols.",
            tool: { label: 'Go to Users', view: 'users' },
          },
          {
            title: 'Drive Store Utility',
            description: 'Create a special coupon code and send it directly to your most engaged user segment to drive the utility of the $BIO token and the Store.',
            tool: { label: 'Go to Store Mgt.', view: 'store-management' },
          },
        ],
      },
      {
        week: 'Weeks 11-12',
        goal: 'Fuel the Flywheel',
        actions: [
          {
            title: 'Incentivize Referrals',
            description: 'Systematize organic growth by turning users into advocates. Ensure the Referral XP Reward is set to a generous amount to incentivize sharing.',
            tool: { label: 'Go to Platform Settings', view: 'platform' },
          },
          {
            title: 'Use Social Proof',
            description: 'Start a weekly tradition: find the top-ranked PvP player in the Users tab and use the "Post to Social Media" feature to celebrate the "Biohacker of the Week".',
            tool: { label: 'Go to Integrations', view: 'growth-engine', subTab: 'integrations' },
          },
        ],
      },
    ],
  },
];