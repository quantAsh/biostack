import React from 'react';
import { Wearable } from '../types';
import { WEARABLE_DETAILS } from '../constants';
import { useUserStore } from '../stores/userStore';

const IntegrationsPanel: React.FC = () => {
  const connectedWearables = useUserStore(state => state.connectedWearables);
  const toggleWearable = useUserStore(state => state.toggleWearable);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
      <h2 className="font-title text-2xl font-bold text-gray-200 mb-1">Connect Wearables</h2>
      <p className="text-gray-400 mb-6">Connect your devices to get hyper-personalized AI recommendations based on your real-time data.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Object.values(Wearable).map(wearable => {
          const isConnected = connectedWearables.includes(wearable);
          return (
            <div key={wearable} className={`bg-gray-800/50 rounded-lg p-4 text-center flex flex-col items-center justify-between border-2 transition-all duration-300 ${isConnected ? 'border-cyan-400' : 'border-gray-700 hover:border-gray-600'}`}>
              <div className="text-white mb-3">
                {WEARABLE_DETAILS[wearable].icon}
              </div>
              <h3 className="font-semibold text-sm text-gray-300 mb-4 h-10 flex items-center">{wearable}</h3>
              <button
                onClick={() => toggleWearable(wearable)}
                className={`w-full py-2 text-xs font-bold rounded-md transition-colors duration-300 ${isConnected ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationsPanel;