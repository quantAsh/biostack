import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import toast from 'react-hot-toast';

const StakeOnUserModal: React.FC = () => {
  const { isStakeModalOpen, stakingOnUser, closeStakeModal } = useUIStore();
  const { bioTokens } = useUserStore();
  const [amount, setAmount] = useState<number | string>(100);

  if (!isStakeModalOpen || !stakingOnUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stakeAmount = Number(amount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      toast.error("Invalid stake amount.");
      return;
    }
    if (stakeAmount > bioTokens) {
      toast.error("Insufficient $BIO balance.");
      return;
    }
    // In a real app, this would trigger a smart contract interaction or backend call.
    toast.success(`Successfully staked ${stakeAmount} $BIO on ${stakingOnUser.displayName}! (Simulated)`);
    closeStakeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={closeStakeModal}>
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-md text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-title text-2xl font-bold text-purple-300 mb-2">Stake on a Biohacker</h2>
        <p className="text-gray-400 mb-4 text-sm">
          You are staking on <span className="font-bold text-white">{stakingOnUser.displayName}</span> (Level {stakingOnUser.level}).
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-300 mb-1">Amount to Stake*</label>
            <div className="relative">
              <input 
                id="stake-amount" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                min="1" 
                step="1" 
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm pr-12" 
                required 
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-purple-300 font-bold">$BIO</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">Your balance: {bioTokens.toLocaleString()} $BIO</p>
          </div>
          <p className="text-xs text-gray-500">
            This is a simulation. In a real scenario, you would select an on-chain goal (e.g., reaching a new level) and receive a payout if they succeed.
          </p>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeStakeModal} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-purple-500 rounded-lg hover:bg-purple-400">
              Stake Tokens
            </button>
          </div>
        </form>

        <button onClick={closeStakeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
      </div>
    </div>
  );
};

export default StakeOnUserModal;