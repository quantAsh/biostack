import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getJournalEntryFromText } from '../services/geminiService';
import { JournalEntry } from '../types';
import { speechService } from '../services/speechService';
import toast from 'react-hot-toast';

interface VoiceMemoLoggerProps {
  onClose: () => void;
  onLog: (data: Partial<JournalEntry>) => void;
}

const VoiceMemoLogger: React.FC<VoiceMemoLoggerProps> = ({ onClose, onLog }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (text: string) => getJournalEntryFromText(text),
    onSuccess: (data) => {
      onLog(data);
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  });

  const handleStartListening = () => {
    if (!speechService.isRecognitionSupported) {
      toast.error("Speech recognition is not supported by your browser.");
      return;
    }
    setIsListening(true);
    setTranscript('');
    setError(null);
    speechService.startSingleUtteranceListening(
      (result) => {
        setTranscript(result);
        setIsListening(false);
      },
      (err) => {
        setError(`Speech recognition error: ${err}`);
        setIsListening(false);
      }
    );
  };
  
  const handleAnalyze = () => {
    if (transcript.trim()) {
      mutation.mutate(transcript);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative">
        <h2 className="font-title text-2xl font-extrabold text-purple-300 mb-4">Voice Journal</h2>
        
        <div className="relative w-full h-48 bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
            <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Click the button below to start recording your thoughts for the day...'}
                className="w-full h-full bg-transparent text-gray-300 resize-none outline-none custom-scrollbar"
                readOnly={isListening}
            />
        </div>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        {mutation.isPending && (
             <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 rounded-2xl">
                <svg className="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <p className="text-purple-300 font-semibold">Kai is analyzing your memo...</p>
             </div>
        )}

        <div className="flex gap-4">
            <button
                onClick={handleStartListening}
                disabled={isListening || mutation.isPending}
                className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50
                ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-5 5h0a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" /></svg>
              {isListening ? 'Listening...' : 'Start Recording'}
            </button>
            <button
                onClick={handleAnalyze}
                disabled={!transcript.trim() || mutation.isPending || isListening}
                className="w-full bg-purple-500 text-white font-bold py-3 rounded-lg hover:bg-purple-400 disabled:bg-gray-600"
            >
              Analyze Memo
            </button>
        </div>
        
        <button onClick={onClose} disabled={mutation.isPending} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors disabled:opacity-50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default VoiceMemoLogger;