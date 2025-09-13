import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { KaiIcon } from './KaiIcon';
import toast from 'react-hot-toast';

const SubscriptionPanel: React.FC = () => {
  const isPremium = useUserStore(state => state.isPremium);
  const walletAddress = useUserStore(state => state.walletAddress);
  const redeemPromoCode = useUserStore(state => state.redeemPromoCode);
  const did = useUserStore(state => state.did);
  const claimKaiPlusVC = useUserStore(state => state.claimKaiPlusVC);
  const verifiableCredentials = useUserStore(state => state.verifiableCredentials);
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const hasKaiPlusVC = verifiableCredentials.some(vc => vc.type === 'KaiPlusMembership');

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setIsRedeeming(true);
    await redeemPromoCode(promoCode.trim());
    setIsRedeeming(false);
    setPromoCode('');
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-yellow-400/10 rounded-lg flex items-center justify-center border border-yellow-400/20">
                <KaiIcon className="w-7 h-7 text-yellow-300"/>
            </div>
            <div className="flex-grow">
                <h3 className="font-title text-xl font-bold text-gray-200">Subscription Status</h3>
                <p className={`font-semibold ${isPremium ? 'text-yellow-300' : 'text-gray-400'}`}>
                    You are currently on the {isPremium ? 'Kai+ Premium Tier' : 'Free Tier'}.
                </p>
                <p className="text-xs text-gray-500 mt-1">Kai+ access is granted via a Verifiable Credential linked to your DID.</p>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
                {!isPremium && (
                     <button
                        onClick={claimKaiPlusVC}
                        disabled={!did}
                        className="w-full bg-yellow-500 text-black font-bold py-2.5 px-5 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        title={!did ? "Activate your Sovereign Identity first" : "Claim your Kai+ Membership Credential"}
                    >
                        Claim Kai+ Membership
                    </button>
                )}
            </div>
        </div>

        <div className="mt-6 border-t border-gray-700/50 pt-6">
            <h4 className="font-title text-lg font-bold text-gray-300 mb-2">Redeem a Code</h4>
            <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promotional code"
                    className="flex-grow w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:ring-yellow-500 focus:border-yellow-500 transition"
                />
                <button
                    type="submit"
                    disabled={!promoCode.trim() || isRedeeming}
                    className="w-full sm:w-auto flex-shrink-0 bg-gray-700 text-gray-200 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                    {isRedeeming ? 'Redeeming...' : 'Redeem'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default SubscriptionPanel;