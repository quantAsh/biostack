import React, { useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import toast from 'react-hot-toast';

interface DirectMessageModalProps {
    onClose: () => void;
}

const DirectMessageModal: React.FC<DirectMessageModalProps> = ({ onClose }) => {
    const { userSegments } = useDataStore();
    const [segmentId, setSegmentId] = useState<string>(userSegments[0]?.id || '');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!segmentId || !message.trim()) {
            toast.error("Please select a segment and write a message.");
            return;
        }
        const segment = userSegments.find(s => s.id === segmentId);
        toast.success(`Message sent to "${segment?.name}" (${segment?.userCount} users). (Simulated)`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="font-title text-2xl font-bold text-purple-300 mb-4">Send Direct Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="segment-select" className="block text-sm font-medium text-gray-300 mb-1">Target Segment</label>
                        <select id="segment-select" value={segmentId} onChange={e => setSegmentId(e.target.value)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required>
                            {userSegments.map(segment => (
                                <option key={segment.id} value={segment.id}>{segment.name} ({segment.userCount} users)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message-content" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                        <textarea id="message-content" value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-purple-500 rounded-lg hover:bg-purple-400">Send Message</button>
                    </div>
                </form>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default DirectMessageModal;
