import { KairosDataPoint } from '../types';

export const kairosCollectiveData: KairosDataPoint[] = [
  // Sleep Optimization
  { userTraits: ['poor_sleep_score', 'high_stress'], protocolIds: ['5', '22'], outcomeMetric: 'Sleep Score', outcomeChange: 12.5, efficacy: 0.92, dataPoints: 1205 },
  { userTraits: ['poor_sleep_score'], protocolIds: ['16'], outcomeMetric: 'HRV', outcomeChange: 5.2, efficacy: 0.78, dataPoints: 850 },
  { userTraits: ['poor_sleep_score', 'high_stress'], protocolIds: ['5', '22', '16'], outcomeMetric: 'Sleep Score', outcomeChange: 18.1, efficacy: 0.95, dataPoints: 432 },
  { userTraits: ['general_optimization'], protocolIds: ['8'], outcomeMetric: 'Deep Sleep', outcomeChange: 15.0, efficacy: 0.65, dataPoints: 2100 },

  // Stress & Inflammation
  { userTraits: ['high_stress', 'low_hrv'], protocolIds: ['3'], outcomeMetric: 'HRV', outcomeChange: 8.1, efficacy: 0.91, dataPoints: 3120 },
  { userTraits: ['high_stress', 'high_inflammation'], protocolIds: ['13'], outcomeMetric: 'Self-reported Stress', outcomeChange: -2.5, efficacy: 0.88, dataPoints: 980 },
  { userTraits: ['high_inflammation'], protocolIds: ['2'], outcomeMetric: 'hs-CRP', outcomeChange: -0.6, efficacy: 0.75, dataPoints: 755 },
  { userTraits: ['high_inflammation', 'high_stress'], protocolIds: ['10', '2'], outcomeMetric: 'hs-CRP', outcomeChange: -1.1, efficacy: 0.89, dataPoints: 312 },
  { userTraits: ['low_hrv'], protocolIds: ['14'], outcomeMetric: 'HRV', outcomeChange: 11.3, efficacy: 0.85, dataPoints: 640 },
  { userTraits: ['high_stress'], protocolIds: ['11'], outcomeMetric: 'Cortisol', outcomeChange: -22.0, efficacy: 0.93, dataPoints: 4500 },

  // Metabolic Health
  { userTraits: ['metabolic_dysfunction'], protocolIds: ['1'], outcomeMetric: 'Fasting Glucose', outcomeChange: -8.5, efficacy: 0.9, dataPoints: 2800 },
  { userTraits: ['metabolic_dysfunction'], protocolIds: ['23'], outcomeMetric: 'Glucose Variability', outcomeChange: -25.0, efficacy: 0.96, dataPoints: 1540 },
  { userTraits: ['metabolic_dysfunction', 'general_optimization'], protocolIds: ['1', '23'], outcomeMetric: 'HbA1c', outcomeChange: -0.3, efficacy: 0.91, dataPoints: 880 },
  { userTraits: ['metabolic_dysfunction'], protocolIds: ['6'], outcomeMetric: 'Ketone Levels', outcomeChange: 1.2, efficacy: 0.82, dataPoints: 1120 },

  // Cognitive & Energy
  { userTraits: ['cognitive_decline'], protocolIds: ['6', '1'], outcomeMetric: 'Focus Score', outcomeChange: 1.8, efficacy: 0.85, dataPoints: 1950 },
  { userTraits: ['general_optimization'], protocolIds: ['22'], outcomeMetric: 'Energy Score', outcomeChange: 1.5, efficacy: 0.94, dataPoints: 5200 },
  { userTraits: ['cognitive_decline'], protocolIds: ['17'], outcomeMetric: 'Verbal Memory', outcomeChange: 7.2, efficacy: 0.77, dataPoints: 430 },

  // Longevity & Movement
  { userTraits: ['general_optimization'], protocolIds: ['10'], outcomeMetric: 'All-cause Mortality Risk', outcomeChange: -30.0, efficacy: 0.98, dataPoints: 2315 },
  { userTraits: ['low_hrv'], protocolIds: ['20'], outcomeMetric: 'Balance', outcomeChange: 18.0, efficacy: 0.88, dataPoints: 650 },
  { userTraits: ['metabolic_dysfunction'], protocolIds: ['12'], outcomeMetric: 'Muscle Mass', outcomeChange: 1.5, efficacy: 0.83, dataPoints: 3100 },
];