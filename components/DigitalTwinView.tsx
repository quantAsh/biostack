import React from 'react';
import { useUserStore } from '../stores/userStore';
import { DiagnosticDataPoint, DiagnosticStatus } from '../types';
import { useUIStore } from '../stores/uiStore';

const statusStyles: Record<DiagnosticStatus, { dot: string; dotColor: string; border: string }> = {
    optimal: { dot: 'bg-green-400', dotColor: '#4ade80', border: 'border-green-500/30' },
    borderline: { dot: 'bg-yellow-400', dotColor: '#facc15', border: 'border-yellow-500/30' },
    high: { dot: 'bg-red-500', dotColor: '#f87171', border: 'border-red-500/30' },
    low: { dot: 'bg-red-500', dotColor: '#f87171', border: 'border-red-500/30' },
};

const dataPinPositions: Record<string, { top: string; left: string }> = {
    'hs-CRP': { top: '35%', left: '52%' },
    'Glucose': { top: '55%', left: '45%' },
    'HbA1c': { top: '56%', left: '55%' },
    'Triglycerides': { top: '40%', left: '48%' },
    'Average Glucose': { top: '58%', left: '50%' },
    'Glucose Variability': { top: '60%', left: '42%' },
    'Body Fat': { top: '65%', left: '58%' },
    'Muscle Mass': { top: '75%', left: '40%' },
    'ALT (Liver Enzyme)': { top: '48%', left: '60%' },
};

const DataHotspot: React.FC<{ point: DiagnosticDataPoint }> = ({ point }) => {
    const style = statusStyles[point.status];
    const position = dataPinPositions[point.metricName];
    if (!position) return null;

    return (
        <div className="data-hotspot group" style={{ top: position.top, left: position.left }}>
            <div className="hotspot-dot" style={{ '--dot-color': style.dotColor, '--dot-bg': `${style.dotColor}4D` } as React.CSSProperties}></div>
            <div className="hotspot-label" style={{ '--dot-color': style.dotColor, '--dot-border': `${style.dotColor}4D` } as React.CSSProperties}>
                {point.metricName}
            </div>
            <div className="hotspot-card bg-gray-900/80 border rounded-lg" style={{ borderColor: `${style.dotColor}4D`}}>
                <div className="p-3">
                    <p className="font-bold text-sm" style={{ color: style.dotColor }}>{point.metricName}</p>
                    <p className="font-mono text-xl font-bold text-white">{point.value} <span className="text-sm opacity-70">{point.unit}</span></p>
                    <p className="text-xs capitalize" style={{ color: style.dotColor }}>{point.status}</p>
                </div>
            </div>
        </div>
    );
};

const DigitalTwinView: React.FC = () => {
    const { diagnosticData } = useUserStore();
    const { setView } = useUIStore();
    const isTwinOnline = diagnosticData && diagnosticData.length > 0;

    return (
        <div className="hud-panel blueprint-bg digital-twin-viewport h-full">
            {isTwinOnline ? (
                <div className="relative w-full h-full">
                    <img src="/assets/digitaltwin.jpeg" alt="Anatomical model" className="human-img" />
                    {diagnosticData.map(point => <DataHotspot key={point.metricName} point={point} />)}
                </div>
            ) : (
                <div className="relative w-full h-full">
                    <img src="/assets/digitaltwin.jpeg" alt="Anatomical model" className="human-img filter grayscale opacity-30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                        <h3 className="font-hud text-2xl font-bold text-cyan-300 tracking-widest">TWIN OFFLINE // NO DATASTREAM</h3>
                        <p className="text-gray-400 mt-2 max-w-xs">Activate diagnostic modules to initialize biological snapshot.</p>
                        <button onClick={() => setView('settings')} className="mt-6 bg-cyan-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-cyan-400 transition-colors">Activate Diagnostics</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalTwinView;