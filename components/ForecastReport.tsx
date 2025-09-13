import React from 'react';
import { DigitalTwinForecast, ForecastMetric, ForecastRisk } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import toast from 'react-hot-toast';

const TrendIndicator: React.FC<{ trend: ForecastMetric['trend'] }> = ({ trend }) => {
  if (trend === 'improving') {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.28 9.64a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
  }
  if (trend === 'declining') {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.97-4.03a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 4.03V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>;
  }
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500"><path d="M6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" /></svg>;
};

const ForecastReport: React.FC<{ forecast: DigitalTwinForecast }> = ({ forecast }) => {
  const { protocols } = useDataStore();
  const { toggleStack, saveReport } = useUserStore();
  const { clearForecast } = useUIStore();

  const handleMitigation = (protocolId: string) => {
    const protocol = protocols.find(p => p.id === protocolId);
    if (protocol) {
      toggleStack(protocol);
      toast.success(`${protocol.name} added to your stack.`);
    }
  };

  const handleSaveReport = () => {
    saveReport({ type: 'forecast', data: forecast });
  };

  return (
    <div className="flex flex-col h-full text-white">
      <header className="flex-shrink-0 text-center mb-4">
        <h3 className="font-title text-xl font-bold text-blue-300">Digital Twin Forecast</h3>
        <p className="text-gray-400 text-sm">Projection for the next {forecast.timeHorizon}</p>
      </header>

      <main className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-4 max-h-[calc(100% - 120px)]">
        <div>
          <h3 className="font-semibold text-gray-200 text-sm mb-2">Overall Summary</h3>
          <p className="text-xs text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700">{forecast.overallSummary}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-200 text-sm mb-2">Projected Biomarkers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {forecast.projectedMetrics.map(metric => (
              <div key={metric.metricName} className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white text-sm">{metric.metricName}</p>
                  <TrendIndicator trend={metric.trend} />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs text-gray-500">{metric.currentValue}</span>
                  <span className="text-gray-400">&rarr;</span>
                  <span className="text-base font-bold text-blue-300">{metric.projectedValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-red-300 text-sm mb-2">Potential Risks (Pre-mortem)</h3>
          <div className="space-y-2">
            {forecast.identifiedRisks.map(risk => (
              <div key={risk.risk} className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-red-300 text-sm">{risk.risk}</h4>
                  <span className="text-xs font-mono text-red-200 bg-red-800/50 px-2 py-0.5 rounded-md">{(risk.probability * 100).toFixed(0)}% PROB.</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">{risk.rationale}</p>
                {risk.mitigation && (
                  <div className="mt-2 pt-2 border-t border-red-500/20">
                     <div className="bg-gray-800 p-2 rounded-lg flex justify-between items-center">
                         <div>
                             <p className="font-semibold text-white text-xs">{risk.mitigation.protocolName}</p>
                             <p className="text-[10px] text-gray-400">{risk.mitigation.reason}</p>
                         </div>
                         <button onClick={() => handleMitigation(risk.mitigation!.protocolId)} className="bg-green-600 text-white font-bold py-1 px-2 rounded-md text-xs hover:bg-green-500">
                             Add
                         </button>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="mt-4 text-center flex-shrink-0 flex items-center justify-center gap-4">
          <button onClick={clearForecast} className="bg-gray-700 text-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-600">Clear</button>
          <button onClick={handleSaveReport} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-500">Save Report</button>
      </footer>
    </div>
  );
};

export default ForecastReport;