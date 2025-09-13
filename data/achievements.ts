import { Achievement, Category } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'first_stack',
    name: 'Stack Builder',
    description: 'Add your first protocol to your stack.',
    isUnlocked: (stack) => stack.length >= 1,
    color: '#a0aec0', // Silver
  },
  {
    id: 'stack_of_five',
    name: 'Bio-Explorer',
    description: 'Build a stack with 5 or more protocols.',
    isUnlocked: (stack) => stack.length >= 5,
    color: '#38bdf8', // Light Blue
  },
  {
    id: 'cold_warrior',
    name: 'Cold Warrior',
    description: 'Add a Cold Exposure protocol to your stack.',
    isUnlocked: (stack) => stack.some(p => p.categories.includes(Category.ColdExposure)),
    color: '#22d3ee', // Cyan
  },
   {
    id: 'mindful_master',
    name: 'Mindful Master',
    description: 'Add 3 different Mindfulness or Breathwork protocols.',
    isUnlocked: (stack) => stack.filter(p => p.categories.includes(Category.Mindfulness) || p.categories.includes(Category.Breathwork)).length >= 3,
    color: '#a78bfa', // Indigo
  },
  {
    id: 'first_journal',
    name: 'Data-Driven',
    description: 'Log your first daily journal entry.',
    isUnlocked: (stack, journal) => journal.length >= 1,
    color: '#4ade80', // Green
  },
   {
    id: 'seven_day_journal',
    name: 'Consistent Logger',
    description: 'Log 7 daily journal entries.',
    isUnlocked: (stack, journal) => journal.length >= 7,
    color: '#facc15', // Gold/Yellow
  },
    {
    id: 'balanced_stack',
    name: 'Holistic Hacker',
    description: 'Build a stack with protocols from at least 4 different categories.',
    isUnlocked: (stack) => {
        if (stack.length < 4) return false;
        const categories = new Set(stack.flatMap(p => p.categories));
        return categories.size >= 4;
    },
    color: '#f97316', // Orange
  },
];