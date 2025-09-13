import React from 'react';
import { useUIStore } from '../stores/uiStore';
import { KaiIcon } from './KaiIcon';

const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, closeUpgradeModal } = useUIStore(state => ({
    isUpgradeModalOpen: state.isUpgradeModalOpen,
    closeUpgradeModal: state.closeUpgradeModal,
  }));

  if (!isUpgradeModalOpen) return null;

  const premiumFeatures = [
    "Unlimited AI coaching sessions",
    "Coaching for Advanced-difficulty protocols",
    "Full Simulation & Correlation Engines",
    "Regenerate your Daily Plan anytime",
    "Unlock all multi-week Journeys",
    "Full voice customization & continuous listening",
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={closeUpgradeModal}>
      <div 
        className="bg-gray-900 border border-yellow-400/50 rounded-2xl w-full max-w-md text-white p-8 relative shadow-2xl shadow-yellow-500/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/10 border-2 border-yellow-400/50 flex items-center justify-center">
                <KaiIcon className="w-8 h-8 text-yellow-300" />
            </div>
            <h2 className="font-title text-3xl font-extrabold text-yellow-300 mb-2">Unlock Kai+</h2>
            <p className="text-gray-400 mb-6">Upgrade to the premium tier to unlock the full power of your personal AI wellness coach.</p>
        </div>
        
        <ul className="space-y-3 mb-8">
            {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
        
        <div className="flex flex-col gap-3">
            <button
              onClick={closeUpgradeModal} // In a real app, this would go to a payment screen
              className="w-full bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-all duration-300"
            >
              Upgrade Now
            </button>
             <button
              type="button"
              onClick={closeUpgradeModal}
              className="w-full text-center text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Maybe Later
            </button>
        </div>

        <button onClick={closeUpgradeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;