import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const BountyModal: React.FC = () => {
  const { isBountyModalOpen, bountyModalMode, activeBounty, closeBountyModal } = useUIStore();
  const { user, bioTokens } = useUserStore();
  const { createResearchBounty, stakeOnBounty, products } = useDataStore();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [stakeAmount, setStakeAmount] = useState<number | string>(100);
  const [productId, setProductId] = useState<string | undefined>(undefined);

  const createMutation = useMutation({
    mutationFn: (data: { question: string; description: string; initialStake: number, productId?: string }) =>
      createResearchBounty({ question: data.question, description: data.description }, data.initialStake, data.productId),
    onSuccess: () => {
      toast.success("New research bounty created!");
      closeBountyModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const stakeMutation = useMutation({
    mutationFn: (data: { bountyId: string; amount: number }) =>
      stakeOnBounty(data.bountyId, data.amount),
    onSuccess: () => {
      toast.success("Successfully staked $BIO tokens!");
      closeBountyModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid stake amount.");
      return;
    }
    if (amount > bioTokens) {
      toast.error("Insufficient $BIO balance.");
      return;
    }

    if (bountyModalMode === 'create') {
      if (!question.trim() || !description.trim()) {
        toast.error("Please fill out all fields.");
        return;
      }
      createMutation.mutate({ question, description, initialStake: amount, productId: productId || undefined });
    } else if (activeBounty) {
      stakeMutation.mutate({ bountyId: activeBounty.id, amount });
    }
  };

  const isLoading = createMutation.isPending || stakeMutation.isPending;
  const isCreateMode = bountyModalMode === 'create';

  if (!isBountyModalOpen) return null;
  if (!user || user.isAnonymous) {
      toast.error("Please sign in to participate in bounties.");
      closeBountyModal();
      return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={closeBountyModal}>
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-title text-2xl font-bold text-purple-300 mb-4">{isCreateMode ? "Propose a New Research Bounty" : "Stake on a Bounty"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCreateMode ? (
            <>
              <div>
                <label htmlFor="bounty-question" className="block text-sm font-medium text-gray-300 mb-1">Research Question*</label>
                <input id="bounty-question" type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., What is the optimal protocol for brain fog after international travel?" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required />
              </div>
              <div>
                <label htmlFor="bounty-description" className="block text-sm font-medium text-gray-300 mb-1">Description*</label>
                <textarea id="bounty-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Provide more context. Why is this question important?" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required />
              </div>
              <div>
                <label htmlFor="bounty-product" className="block text-sm font-medium text-gray-300 mb-1">Link a Product (Optional)</label>
                <select id="bounty-product" value={productId || ''} onChange={(e) => setProductId(e.target.value || undefined)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm">
                    <option value="">None</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">You are staking on:</p>
                <p className="font-semibold text-white">{activeBounty?.question}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-300 mb-1">{isCreateMode ? 'Initial Stake Amount*' : 'Amount to Stake*'}</label>
            <div className="relative">
              <input id="stake-amount" type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} min="1" step="1" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm pr-12" required />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-purple-300 font-bold">$BIO</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">Your balance: {bioTokens.toLocaleString()} $BIO</p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeBountyModal} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-bold text-black bg-purple-500 rounded-lg hover:bg-purple-400 disabled:bg-gray-600">
              {isLoading ? 'Processing...' : isCreateMode ? 'Create Bounty' : 'Stake Tokens'}
            </button>
          </div>
        </form>

        <button onClick={closeBountyModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
      </div>
    </div>
  );
};

export default BountyModal;
