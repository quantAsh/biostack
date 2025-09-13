import { ResearchStudy, DiagnosticDataPoint, JournalEntry } from '../types';

interface UserData {
  diagnosticData: DiagnosticDataPoint[];
  journalEntries: JournalEntry[]; 
}

export const researchStudies: ResearchStudy[] = [
  {
    id: 'study_inflammation_01',
    title: 'Impact of Cold Exposure on Systemic Inflammation',
    sponsor: 'Stanford University School of Medicine',
    description: 'Seeking participants to study the link between cold thermogenesis protocols and hs-CRP levels.',
    eligibilityCriteria: ({ diagnosticData }: UserData) => {
      const crp = diagnosticData.find(d => d.metricName === 'hs-CRP');
      return !!crp && crp.status === 'high';
    },
    proofStatement: 'I am a user with a verifiably high hs-CRP reading in the last 30 days.',
  },
  {
    id: 'study_metabolic_01',
    title: 'Metabolic Health & Time-Restricted Eating',
    sponsor: 'Harvard T.H. Chan School of Public Health',
    description: 'A study on the effects of consistent intermittent fasting on glucose variability in individuals with borderline metabolic markers.',
    eligibilityCriteria: ({ diagnosticData }: UserData) => {
      const glucose = diagnosticData.find(d => d.metricName === 'Average Glucose');
      const hba1c = diagnosticData.find(d => d.metricName === 'HbA1c');
      return (!!glucose && glucose.status === 'borderline') || (!!hba1c && hba1c.status === 'borderline');
    },
    proofStatement: 'I have verifiably borderline glucose or HbA1c readings.',
  },
  {
    id: 'study_sleep_01',
    title: 'Effectiveness of Auditory Stimulation on Sleep Quality',
    sponsor: 'Johns Hopkins Center for Sleep',
    description: 'Investigating the impact of sound-based protocols on individuals who have consistently logged poor sleep.',
    eligibilityCriteria: ({ journalEntries }: UserData) => {
       if (journalEntries.length < 14) return false;
       const recentEntries = journalEntries.slice(-14);
       const averageMood = recentEntries.reduce((acc, entry) => acc + entry.mood, 0) / recentEntries.length;
       return averageMood < 3.0; // Simple proxy for poor sleep
    },
    proofStatement: 'I have verifiably logged below-average mood scores for the past 14 days.',
  },
];