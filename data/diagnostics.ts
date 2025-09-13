import React from 'react';
import { DiagnosticModule } from '../types';

export const diagnosticModules: DiagnosticModule[] = [
    {
        id: 'blood_panel',
        name: 'At-Home Blood Panel',
        description: 'Periodic blood draws to measure key biomarkers for inflammation and metabolic health.',
        icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", viewBox: "0 0 20 20", fill: "currentColor" }, 
            React.createElement('path', { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm3.707 1.293a1 1 0 00-1.414-1.414L8 9.586V8a1 1 0 00-2 0v4a1 1 0 001 1h4a1 1 0 000-2H9.414l1.293-1.293z", clipRule: "evenodd" })
        ),
        metrics: [
            { name: 'hs-CRP', unit: 'mg/L', domain: 'Inflammatory', optimalRange: [0, 1], borderlineHighRange: [1, 3] },
            { name: 'Glucose', unit: 'mg/dL', domain: 'Metabolic', optimalRange: [70, 90], borderlineHighRange: [90, 100] },
            { name: 'HbA1c', unit: '%', domain: 'Metabolic', optimalRange: [4.0, 5.4], borderlineHighRange: [5.4, 5.7] },
            { name: 'Triglycerides', unit: 'mg/dL', domain: 'Metabolic', optimalRange: [0, 100], borderlineHighRange: [100, 150] },
            { name: 'ALT (Liver Enzyme)', unit: 'U/L', domain: 'Metabolic', optimalRange: [7, 55], borderlineHighRange: [56, 70] },
        ]
    },
    {
        id: 'cgm',
        name: 'Continuous Glucose Monitor',
        description: 'A wearable sensor that tracks glucose levels in real-time, providing insights into your response to food and exercise.',
        icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", viewBox: "0 0 20 20", fill: "currentColor" },
            React.createElement('path', { d: "M10 12.5a.5.5 0 01-.5-.5v-3a.5.5 0 011 0v3a.5.5 0 01-.5.5z" }),
            React.createElement('path', { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm-5.02-3.044a.5.5 0 01.707 0L10 12.172l4.313-4.216a.5.5 0 11.707.707L10.707 12.5l4.313 4.216a.5.5 0 11-.707.707L10 13.828l-4.216 4.313a.5.5 0 01-.707-.707l4.216-4.313-4.313-4.216a.5.5 0 010-.707z", clipRule: "evenodd" })
        ),
        metrics: [
            { name: 'Average Glucose', unit: 'mg/dL', domain: 'Metabolic', optimalRange: [80, 100], borderlineHighRange: [100, 110] },
            { name: 'Glucose Variability', unit: '%', domain: 'Metabolic', optimalRange: [0, 15], borderlineHighRange: [15, 20] },
        ]
    },
    {
        id: 'smart_scale',
        name: 'Smart Scale',
        description: 'Tracks body composition metrics like body fat percentage and muscle mass over time.',
        icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", viewBox: "0 0 20 20", fill: "currentColor" },
            React.createElement('path', { fillRule: "evenodd", d: "M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046a3.5 3.5 0 014.5 2.592A3.5 3.5 0 0118 10.5a3.5 3.5 0 01-3.5 3.5H6.879a2.5 2.5 0 01-1.379-.48l-1.12-1.12a2.5 2.5 0 00-3.536 3.536l1.12 1.12A4.475 4.475 0 005.5 17z", clipRule: "evenodd" })
        ),
        metrics: [
            { name: 'Body Fat', unit: '%', domain: 'Physical', optimalRange: [10, 20], borderlineHighRange: [20, 25] },
            { name: 'Muscle Mass', unit: 'kg', domain: 'Physical', optimalRange: [30, 50] }, // Example range
        ]
    }
];