import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useDataStore } from '../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ResolveBountyModal: React.FC = () => {
  const { isResolveBountyModalOpen, resolvingBounty, closeResolveBountyModal } = useUIStore();
  const { resolveBounty, protocols } = useDataStore();

  const [summary, setSummary] = useState('');
  const [protocolId, setProtocolId] = useState('');

  const mutation = useMutation({
    mutationFn: (data: { bountyId: string; results: { summary: string; protocolId: string; } }) =>
      resolveBounty(data.bountyId, data.results),
    onSuccess: () => {
      toast.success("Bounty resolved and findings published!");
      closeResolveBountyModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !protocolId) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (resolvingBounty) {
      mutation.mutate({ bountyId: resolvingBounty.id, results: { summary, protocolId } });
    }
  };

  if (!isResolveBountyModalOpen || !resolvingBounty) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={closeResolveBountyModal}>
      <div className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-title text-2xl font-bold text-green-300 mb-4">Resolve Research Bounty</h2>
        <p className="text-sm text-gray-400 mb-2">Resolving for: <span className="font-semibold text-white">{resolvingBounty.question}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bounty-summary" className="block text-sm font-medium text-gray-300 mb-1">Research Summary*</label>
            <textarea id="bounty-summary" value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="Summarize the findings from the collective data..." className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required />
          </div>
          <div>
            <label htmlFor="bounty-protocol" className="block text-sm font-medium text-gray-300 mb-1">Highest Efficacy Protocol*</label>
            <select id="bounty-protocol" value={protocolId} onChange={e => setProtocolId(e.target.value)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required>
                <option value="">-- Select Winning Protocol --</option>
                {protocols.filter(p => !p.isPersonalized).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeResolveBountyModal} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2 text-sm font-bold text-black bg-green-500 rounded-lg hover:bg-green-400 disabled:bg-gray-600">
              {mutation.isPending ? 'Resolving...' : 'Resolve Bounty'}
            </button>
          </div>
        </form>

        <button onClick={closeResolveBountyModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
      </div>
    </div>
  );
};

export default ResolveBountyModal;
