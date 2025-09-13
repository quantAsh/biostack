import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { KaiIcon } from './KaiIcon';
import toast from 'react-hot-toast';

const LivingStackSuggestion: React.FC = () => {
    const { isAgentModeEnabled, isLivingStackEnabled } = useUserStore();
    const [isVisible, setIsVisible] = useState(true);

    // This component will only show if the user has opted into Agent Mode and the Living Stack feature.
    // In a real app, its appearance would be triggered by a complex backend event. Here, we show it by default if enabled.
    if (!isAgentModeEnabled || !isLivingStackEnabled || !isVisible) {
        return null;
    }
    
    const handleAccept = () => {
        toast.success("3-Day Trial Accepted! 'Evening Meditation' will be temporarily replaced.");
        setIsVisible(false);
    };

    const handleDecline = () => {
        toast.error("Suggestion declined. Your stack remains unchanged.");
        setIsVisible(false);
    };

    return (
        <div className="proactive-suggestion-bulletin !border-t-purple-500/20 !bg-purple-900/10">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <KaiIcon className="w-6 h-6 text-purple-300 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-white">Living Stack Optimization</h4>
                        <p className="text-sm text-gray-400">
                            Kai noticed your deep sleep has declined. The collective data suggests swapping 'Evening Meditation' for 'Magnesium Glycinate'.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={handleDecline} className="text-gray-400 font-bold py-2 px-4 rounded-lg hover:bg-gray-700/50 text-sm">
                        Decline
                    </button>
                    <button onClick={handleAccept} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 text-sm">
                        Accept 3-Day Trial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LivingStackSuggestion;