import { DiagnosticService } from '../types';

export const diagnosticServices: DiagnosticService[] = [
  {
    id: 'viome_microbiome',
    name: 'Viome Gut Intelligence Test',
    category: 'Microbiome',
    description: 'Analyzes your gut microbiome to provide personalized food recommendations and insights into your digestive wellness, immune system, and more.',
    provider: 'Viome',
    priceRange: '$199 - $399',
    bookingLink: 'https://www.viome.com/',
    providerLogoUrl: 'https://storage.googleapis.com/gemini-ui-params/viome-logo.png'
  },
  {
    id: 'quest_blood_panel',
    name: 'Comprehensive Blood Panel',
    category: 'Bloodwork',
    description: 'A full suite of blood tests covering metabolic health, inflammation, lipids, and key vitamins to establish a detailed health baseline.',
    provider: 'Quest Diagnostics',
    priceRange: '$150 - $500',
    bookingLink: 'https://www.questdiagnostics.com/',
    providerLogoUrl: 'https://storage.googleapis.com/gemini-ui-params/quest-diagnostics-logo.png'
  },
  {
    id: 'nebula_genomics',
    name: 'Whole Genome Sequencing',
    category: 'Genetics',
    description: 'Decode 100% of your DNA to explore your ancestry, genetic predispositions, and traits with clinical-grade accuracy.',
    provider: 'Nebula Genomics',
    priceRange: '$299+',
    bookingLink: 'https://nebula.org/',
    providerLogoUrl: 'https://storage.googleapis.com/gemini-ui-params/nebula-genomics-logo.png'
  },
  {
    id: 'prenuvo_mri',
    name: 'Prenuvo Full-Body MRI Scan',
    category: 'Imaging',
    description: 'A radiation-free, full-body MRI scan designed for proactive detection of cancer and over 500 other conditions.',
    provider: 'Prenuvo',
    priceRange: '$999 - $2499',
    bookingLink: 'https://www.prenuvo.com/',
    providerLogoUrl: 'https://storage.googleapis.com/gemini-ui-params/prenuvo-logo.png'
  },
];
