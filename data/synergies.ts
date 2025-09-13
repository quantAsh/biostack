import { Category } from '../types';

export const protocolSynergies: Partial<Record<Category, Category[]>> = {
  // Morning routine synergy
  [Category.Light]: [Category.Movement, Category.ColdExposure, Category.Energy],
  // Cognitive stack
  [Category.Cognitive]: [Category.Fasting, Category.Nutrition, Category.Mindfulness],
  // Sleep and recovery stack
  [Category.Sleep]: [Category.StressManagement, Category.Mindfulness, Category.Breathwork, Category.Sound],
  // Metabolic health
  [Category.Fasting]: [Category.Nutrition, Category.Movement, Category.Longevity],
  // General Resilience
  [Category.ColdExposure]: [Category.Breathwork, Category.StressManagement],
};
