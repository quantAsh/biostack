import { Category, Wearable, View, ProtocolMasteryLevel } from './types';
import { CategoryIcon } from './components/CategoryIcon';
import React from 'react';
import { WearableIcon } from './components/WearableIcon';
import { ViewIcon } from './components/ViewIcon';

export const CATEGORY_DETAILS: { [key in Category]: { color: string; icon: React.ReactNode } } = {
  [Category.Fasting]: { color: '#EAB308', icon: React.createElement(CategoryIcon, { category: Category.Fasting }) },
  [Category.ColdExposure]: { color: '#0EA5E9', icon: React.createElement(CategoryIcon, { category: Category.ColdExposure }) },
  [Category.Breathwork]: { color: '#A78BFA', icon: React.createElement(CategoryIcon, { category: Category.Breathwork }) },
  [Category.Movement]: { color: '#F87171', icon: React.createElement(CategoryIcon, { category: Category.Movement }) },
  [Category.Sleep]: { color: '#818CF8', icon: React.createElement(CategoryIcon, { category: Category.Sleep }) },
  [Category.Mindfulness]: { color: '#4ADE80', icon: React.createElement(CategoryIcon, { category: Category.Mindfulness }) },
  [Category.Nutrition]: { color: '#34D399', icon: React.createElement(CategoryIcon, { category: Category.Nutrition }) },
  [Category.StressManagement]: { color: '#60A5FA', icon: React.createElement(CategoryIcon, { category: Category.StressManagement }) },
  [Category.Light]: { color: '#FBBF24', icon: React.createElement(CategoryIcon, { category: Category.Light }) },
  [Category.Sound]: { color: '#E879F9', icon: React.createElement(CategoryIcon, { category: Category.Sound }) },
  [Category.Longevity]: { color: '#2DD4BF', icon: React.createElement(CategoryIcon, { category: Category.Longevity }) },
  [Category.Cognitive]: { color: '#6366F1', icon: React.createElement(CategoryIcon, { category: Category.Cognitive }) },
  [Category.Energy]: { color: '#FBBF24', icon: React.createElement(CategoryIcon, { category: Category.Energy }) },
};

export const WEARABLE_DETAILS: { [key in Wearable]: { icon: React.ReactNode } } = {
  [Wearable.Oura]: { icon: React.createElement(WearableIcon, { wearable: Wearable.Oura }) },
  [Wearable.Whoop]: { icon: React.createElement(WearableIcon, { wearable: Wearable.Whoop }) },
  [Wearable.AppleWatch]: { icon: React.createElement(WearableIcon, { wearable: Wearable.AppleWatch }) },
  [Wearable.Garmin]: { icon: React.createElement(WearableIcon, { wearable: Wearable.Garmin }) },
  [Wearable.Fitbit]: { icon: React.createElement(WearableIcon, { wearable: Wearable.Fitbit }) },
}

export const XP_VALUES = {
  JOURNAL_LOG: 25,
  ADD_TO_STACK: 5,
  SHARE_PROTOCOL: 150,
  COMPLETE_PROTOCOL: 15,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 6000, 6850, 7750, 8700, 9700, 10750,
];

export const getLevelFromXp = (xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
};

export const VIEW_THEMES: Record<View, { name: string; icon: React.ReactNode; textColor: string; borderColor: string; bgColor: string; darkBgColor: string; }> = {
    'kai': { name: 'Kai', icon: React.createElement(ViewIcon, { view: 'kai' }), textColor: 'text-cyan-300', borderColor: 'border-cyan-400/30', bgColor: 'bg-cyan-500', darkBgColor: 'bg-cyan-900/50' },
    'explore': { name: 'Explore', icon: React.createElement(ViewIcon, { view: 'explore' }), textColor: 'text-blue-300', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500', darkBgColor: 'bg-blue-900/50' },
    'my-stack-lab': { name: 'Stack Lab', icon: React.createElement(ViewIcon, { view: 'my-stack-lab' }), textColor: 'text-teal-300', borderColor: 'border-teal-500/30', bgColor: 'bg-teal-500', darkBgColor: 'bg-teal-900/50' },
    'store': { name: 'Store', icon: React.createElement(ViewIcon, { view: 'store' }), textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', bgColor: 'bg-yellow-500', darkBgColor: 'bg-yellow-900/50' },
    'arena': { name: 'Arena', icon: React.createElement(ViewIcon, { view: 'arena' }), textColor: 'text-red-300', borderColor: 'border-red-500/30', bgColor: 'bg-red-500', darkBgColor: 'bg-red-900/50' },
    'settings': { name: 'Settings', icon: React.createElement(ViewIcon, { view: 'settings' }), textColor: 'text-gray-300', borderColor: 'border-gray-500/30', bgColor: 'bg-gray-700', darkBgColor: 'bg-gray-900/50' },
    'admin': { name: 'Admin', icon: React.createElement(ViewIcon, { view: 'admin' }), textColor: 'text-sky-300', borderColor: 'border-sky-500/30', bgColor: 'bg-sky-500', darkBgColor: 'bg-slate-800' },
    'coaching': { name: 'Coaching', icon: React.createElement(ViewIcon, { view: 'coaching' }), textColor: 'text-cyan-300', borderColor: 'border-cyan-500/30', bgColor: 'bg-cyan-500', darkBgColor: 'bg-cyan-900/50' },
};

export const MASTERY_LEVELS: Record<ProtocolMasteryLevel, { 
    requiredStreaks: number, 
    nextLevel: ProtocolMasteryLevel | null,
    canForge: boolean,
    forgeTier?: 'Polished' | 'Artisan' | 'Genesis'
}> = {
  'Novice': { requiredStreaks: 0, nextLevel: 'Adept', canForge: false },
  'Adept': { requiredStreaks: 10, nextLevel: 'Expert', canForge: false },
  'Expert': { requiredStreaks: 30, nextLevel: 'Master', canForge: true, forgeTier: 'Polished' },
  'Master': { requiredStreaks: 60, nextLevel: 'Grandmaster', canForge: true, forgeTier: 'Artisan' },
  'Grandmaster': { requiredStreaks: 100, nextLevel: null, canForge: true, forgeTier: 'Genesis' },
};