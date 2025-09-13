import React from 'react';
import { useUserStore } from '../stores/userStore';

const AutonomousKaiPanel: React.FC = () => {
  const { 
    isAgentModeEnabled,
    toggleAgentMode,
    isLivingStackEnabled, 
    toggleLivingStack,
    isAmbientJournalingEnabled,
    toggleAmbientJournaling,
  } = useUserStore();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
      <h3 className="font-title text-xl font-bold text-purple-300">Autonomous Kai</h3>
      <p className="text-gray-400 text-sm mt-1 mb-6">
        Allow Kai to take a more proactive role in managing your Life OS. These features are experimental and require your explicit consent.
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-purple-900/20 p-4 rounded-lg border border-purple-700">
          <div>
            <h4 className="font-semibold text-white">Enable Agent Mode</h4>
            <p className="text-xs text-gray-400">Master switch for all proactive and autonomous features.</p>
          </div>
          <label htmlFor="agent-mode-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="agent-mode-toggle" className="sr-only" checked={isAgentModeEnabled} onChange={toggleAgentMode} />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isAgentModeEnabled ? 'translate-x-6 bg-purple-400' : ''}`}></div>
            </div>
          </label>
        </div>

        <div className={`space-y-4 transition-opacity duration-300 ${isAgentModeEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex items-center justify-between bg-gray-800/40 p-4 rounded-lg border border-gray-700">
            <div>
              <h4 className="font-semibold text-white">The Living Stack</h4>
              <p className="text-xs text-gray-500">Allow Kai to proactively suggest and run A/B tests on your stack based on your data.</p>
            </div>
            <label htmlFor="living-stack-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" id="living-stack-toggle" className="sr-only" checked={isLivingStackEnabled} onChange={toggleLivingStack} disabled={!isAgentModeEnabled} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isLivingStackEnabled ? 'translate-x-6 bg-purple-400' : ''}`}></div>
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between bg-gray-800/40 p-4 rounded-lg border border-gray-700">
            <div>
              <h4 className="font-semibold text-white">Ambient Journaling</h4>
              <p className="text-xs text-gray-500">Enable Kai to passively detect stress signals or activities via your device's microphone.</p>
            </div>
            <label htmlFor="ambient-journaling-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" id="ambient-journaling-toggle" className="sr-only" checked={isAmbientJournalingEnabled} onChange={toggleAmbientJournaling} disabled={!isAgentModeEnabled} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isAmbientJournalingEnabled ? 'translate-x-6 bg-purple-400' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousKaiPanel;