import { Mission, Badge, Protocol, JournalEntry } from '../types';

interface MissionCompletionState {
  myStack: Protocol[];
  journalEntries: JournalEntry[];
  sharedProtocolCount: number;
}

export const missions: Mission[] = [
  {
    id: 'log_first_journal',
    title: 'Log your first journal entry',
    xp: 50,
    isCompleted: ({ journalEntries }: MissionCompletionState) => journalEntries.length >= 1,
  },
  {
    id: 'build_stack_3',
    title: 'Build a stack of 3 protocols',
    xp: 75,
    isCompleted: ({ myStack }: MissionCompletionState) => myStack.length >= 3,
  },
  {
    id: 'log_7_days',
    title: 'Log journal entries for 7 days',
    xp: 200,
    isCompleted: ({ journalEntries }: MissionCompletionState) => journalEntries.length >= 7,
  },
  {
    id: 'share_protocol',
    title: 'Share a personalized protocol',
    xp: 150,
    isCompleted: ({ sharedProtocolCount }: MissionCompletionState) => sharedProtocolCount > 0,
  },
];

export const badges: Badge[] = [
  { id: 'bio_initiate', name: 'Bio-Initiate', description: 'Welcome to the journey of self-optimization.', icon: '🌱', level: 1 },
  { id: 'data_dabbler', name: 'Data Dabbler', description: 'You are consistently tracking your progress.', icon: '📊', level: 5 },
  { id: 'protocol_pro', name: 'Protocol Pro', description: 'You have mastered the art of stacking.', icon: '🧪', level: 10 },
  { id: 'habit_hacker', name: 'Habit Hacker', description: 'Consistency has become your superpower.', icon: '🎯', level: 15 },
  { id: 'data_alchemist', name: 'Data Alchemist', description: 'You turn raw data into wellness gold.', icon: '✨', level: 20 },
];