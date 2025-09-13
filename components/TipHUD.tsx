import React from 'react';
import { useUIStore } from '../stores/uiStore';
import { tips } from '../data/tips';

const TipHUD: React.FC = () => {
  const { tipIndex, cycleTip, dismissTip } = useUIStore();

  const currentTip = tips[tipIndex];

  if (!currentTip) return null;

  return (
    <div className="tip-hud-bulletin">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex-shrink-0 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-white">{currentTip.title}</h4>
            <p className="text-sm text-gray-400">{currentTip.content}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button onClick={cycleTip} className="text-xs font-semibold bg-gray-700/50 hover:bg-gray-600/50 px-3 py-1 rounded-md">
            Next Tip
          </button>
          <button onClick={dismissTip} className="text-xs text-gray-500 hover:text-white" title="Dismiss">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipHUD;
