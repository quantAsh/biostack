import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useDataStore } from '../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FeedbackType } from '../types';

const FeedbackModal: React.FC = () => {
  const { closeFeedbackModal } = useUIStore();
  const { submitFeedback } = useDataStore();

  const [type, setType] = useState<FeedbackType>('general');
  const [comment, setComment] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  const mutation = useMutation({
    mutationFn: (feedbackData: Parameters<typeof submitFeedback>[0]) => submitFeedback(feedbackData),
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      closeFeedbackModal();
    },
    onError: (error: Error) => toast.error(`Submission failed: ${error.message}`),
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
        toast.error("Please enter a comment.");
        return;
    }
    
    let diagnostics = {};
    if (includeDiagnostics) {
        diagnostics = {
            browser: navigator.userAgent,
            view: useUIStore.getState().view,
        };
    }

    mutation.mutate({
        type,
        comment,
        context: {
            view: useUIStore.getState().view,
            diagnostics: includeDiagnostics ? JSON.stringify(diagnostics) : undefined,
        }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[1100] flex items-center justify-center p-4" onClick={closeFeedbackModal}>
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-title text-2xl font-bold text-purple-300 mb-4">Submit Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Type</label>
            <div className="flex gap-2">
              {(['general', 'bug', 'feature_request'] as FeedbackType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${type === t ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                >
                  {t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-300 mb-1">Comment</label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={5}
              placeholder="Please be as detailed as possible..."
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="include-diagnostics"
              type="checkbox"
              checked={includeDiagnostics}
              onChange={e => setIncludeDiagnostics(e.target.checked)}
              className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="include-diagnostics" className="ml-3 text-sm text-gray-400">
              Include anonymous diagnostic data
            </label>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeFeedbackModal} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2 text-sm font-bold text-black bg-purple-500 rounded-lg hover:bg-purple-400 disabled:bg-gray-600">
              {mutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
        <button onClick={closeFeedbackModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
      </div>
    </div>
  );
};

export default FeedbackModal;