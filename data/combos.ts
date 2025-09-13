import { Combo, Category } from '../types';

export const combos: Combo[] = [
    {
        name: 'Circadian Sync',
        primeCategory: Category.Light,
        triggerCategory: Category.Movement,
        effect: 'double_damage',
        effectDescription: 'Doubles the damage of the triggering Movement protocol.',
    },
    {
        name: 'Resilience Shield',
        primeCategory: Category.Breathwork,
        triggerCategory: Category.Mindfulness,
        effect: 'immune',
        effectValue: 1, // Immune for 1 turn
        effectDescription: 'Become immune to all negative status effects for your opponent\'s next turn.',
    },
    {
        name: 'Metabolic Flexibility',
        primeCategory: Category.Fasting,
        triggerCategory: Category.Nutrition,
        effect: 'heal',
        effectValue: 30,
        effectDescription: 'Heals you for 30 HP when you consume a Nutrition protocol after Fasting.',
    },
    {
        name: 'Thermic Shock',
        primeCategory: Category.ColdExposure,
        triggerCategory: Category.Longevity, // Often associated with heat (Sauna)
        effect: 'stun',
        effectDescription: 'The opponent is Stunned and misses their next turn.',
    },
];
