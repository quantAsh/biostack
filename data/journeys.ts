import { Journey } from '../types';

export const journeys: Journey[] = [
    {
        id: 'energy_boost_7d',
        name: '7-Day Energy Boost',
        description: 'A one-week program designed to naturally increase your energy levels and combat midday slumps using a combination of movement, nutrition, and cold exposure.',
        duration: '7 Days',
        protocolIds: ['21', '19', '29'] // Morning Sunlight, Sun Salutation, Optimal Hydration
    },
    {
        id: 'stress_reduction_14d',
        name: '14-Day Stress Resilience',
        description: 'A two-week journey to calm your nervous system, improve focus under pressure, and build long-term stress resilience.',
        duration: '14 Days',
        protocolIds: ['3', '7', '13', '30'] // Box Breathing, Grounding (Earthing), Forest Bathing, Social Connection
    },
    {
        id: 'sleep_optimization_10d',
        name: '10-Day Sleep Overhaul',
        description: 'A focused program to reset your circadian rhythm and improve sleep quality, based on the latest sleep science.',
        duration: '10 Days',
        protocolIds: ['5', '22', '16'] // Sleep Optimization, Evening Light Restriction, Alternate Nostril Breathing
    },
    {
        id: 'cognitive_enhancement_21d',
        name: '21-Day Cognitive Focus',
        description: 'A three-week journey to enhance mental clarity, improve focus, and support long-term brain health through a synergistic stack.',
        duration: '21 Days',
        protocolIds: ['1', '17', '8', '26'] // 16/8 Intermittent Fasting, Nootropics, Binaural Beats, Creatine
    },
    {
        id: 'wim_hof_adv_30d',
        name: 'Wim Hof: The Art of Cold',
        description: 'A 30-day advanced journey into the Wim Hof Method, led by The Iceman himself. Master your mind and body, and earn a rare collectible protocol.',
        duration: '30 Days',
        protocolIds: ['14', '2', '16'], // Wim Hof, Cold Thermogenesis, Alt Nostril Breathing
        isSpecialEdition: true,
        enrollmentFee: 250, // in $BIO
        influencer: {
            name: 'Wim Hof',
            image: '/assets/wim-hof.png'
        },
        nftReward: {
            protocolId: 'nft_wh_01',
            artist: 'AI Gen/BiohackStack'
        }
    },
    {
        id: 'metabolic_reset_14d',
        name: '14-Day Metabolic Reset',
        description: 'A two-week intensive program focused on improving your body\'s ability to manage blood sugar, utilize fat for fuel, and reduce metabolic inflammation.',
        duration: '14 Days',
        protocolIds: ['1', '23', '12', '27'] // Intermittent Fasting, Post-Meal Walk, Zone 2 Training, Mindful Eating
    },
    {
        id: 'mindful_month_30d',
        name: '30-Day Mindful Month',
        description: 'A gentle yet powerful 30-day journey to build a consistent mindfulness practice, reduce stress, and improve your relationship with your thoughts and emotions.',
        duration: '30 Days',
        protocolIds: ['11', '3', '24', '13'] // Mindfulness Meditation, Box Breathing, Gratitude Journaling, Forest Bathing
    },
    {
        id: 'longevity_blueprint_30d',
        name: 'The Longevity Blueprint',
        description: 'An advanced, 30-day program guided by Dr. Anya Sharma, incorporating cutting-edge protocols to optimize for a long and vibrant healthspan. Requires Kai+ subscription.',
        duration: '30 Days',
        protocolIds: ['25', '12', '9', '1', '20'], // VO2 Max, Zone 2, Sauna, IF, Single-Leg Balance
        isSpecialEdition: true,
        enrollmentFee: 300,
        influencer: {
            name: 'Dr. Anya Sharma',
            image: 'https://storage.googleapis.com/gemini-ui-params/1b92c6b4-4b55-4673-8278-62d3a95f560f'
        },
        nftReward: {
            protocolId: 'nft_as_01',
            artist: 'AI Gen/BiohackStack'
        }
    }
];