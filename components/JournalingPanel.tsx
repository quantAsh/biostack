import React, { useState, useEffect } from 'react';
import { JournalEntry, DayData } from '../types';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import VisionLogger from './VisionLogger';
import VoiceMemoLogger from './VoiceMemoLogger';
import { useMutation } from '@tanstack/react-query';
import { getDraftJournalFromDayData } from '../services/geminiService';
import { getSimulatedPhotoOfTheDay } from '../data/assets';
import toast from 'react-hot-toast';

const JournalingPanel: React.FC = () => {
  const journalEntries = useUserStore(state => state.journalEntries);
  const addJournalEntry = useUserStore(state => state.addJournalEntry);
  const calendarEvents = useUserStore(state => state.calendarEvents);
  const gpsLog = useUserStore(state => state.gpsLog);
  const draftedJournalEntry = useUserStore(state => state.draftedJournalEntry);
  const clearDraftedJournal = useUserStore(state => state.clearDraftedJournal);
  
  const protocols = useDataStore(state => state.protocols);
  const platformConfig = useDataStore(state => state.platformConfig);
  
  const isJournalModalOpen = useUIStore(state => state.isJournalModalOpen);
  const openJournalModal = useUIStore(state => state.openJournalModal);
  const closeJournalModal = useUIStore(state => state.closeJournalModal);

  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);
  const [notes, setNotes] = useState('');
  const [isVisionLoggerOpen, setIsVisionLoggerOpen] = useState(false);
  const [isVoiceLoggerOpen, setIsVoiceLoggerOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = journalEntries.find(entry => entry.date === today);

  useEffect(() => {
    if (isJournalModalOpen) {
      if (draftedJournalEntry) {
        setMood(draftedJournalEntry.mood ?? 3);
        setEnergy(draftedJournalEntry.energy ?? 3);
        setFocus(draftedJournalEntry.focus ?? 3);
        setNotes(draftedJournalEntry.notes ?? '');
      } else if (todayEntry) {
        setMood(todayEntry.mood);
        setEnergy(todayEntry.energy);
        setFocus(todayEntry.focus);
        setNotes(todayEntry.notes || '');
      } else {
        setMood(3);
        setEnergy(3);
        setFocus(3);
        setNotes('');
      }
    }
  }, [todayEntry, isJournalModalOpen, draftedJournalEntry]);

  const draftMutation = useMutation({
    mutationFn: async () => {
        const photoData = await getSimulatedPhotoOfTheDay();
        const dayData: DayData = {
            photo: photoData,
            calendarEvents: calendarEvents,
            gpsLog: gpsLog,
        };
        return getDraftJournalFromDayData(dayData);
    },
    onSuccess: (data) => {
        setMood(data.mood ?? 3);
        setEnergy(data.energy ?? 3);
        setFocus(data.focus ?? 3);
        setNotes(data.notes ?? '');
        toast.success("Kai has drafted your journal entry.");
    },
    onError: (error: Error) => {
        toast.error(`Drafting failed: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    addJournalEntry({ mood, energy, focus, notes });
    if (draftedJournalEntry) {
      clearDraftedJournal();
    }
    closeJournalModal();
  };
  
  const handleCloseModal = () => {
    if (draftedJournalEntry) {
        clearDraftedJournal();
    }
    closeJournalModal();
  };

  const handleVisionLog = (data: Partial<JournalEntry>) => {
    addJournalEntry({
      mood: data.mood ?? mood,
      energy: data.energy ?? energy,
      focus: data.focus ?? focus,
      notes: data.notes ?? notes
    });
    setIsVisionLoggerOpen(false);
    handleCloseModal();
  };

  const handleVoiceLog = (data: Partial<JournalEntry>) => {
    addJournalEntry({
      mood: data.mood ?? mood,
      energy: data.energy ?? energy,
      focus: data.focus ?? focus,
      notes: data.notes ?? notes,
    });
    setIsVoiceLoggerOpen(false);
    handleCloseModal();
  };
  
  const completedTodayProtocols = todayEntry?.completedProtocols.map(id => protocols.find(p => p.id === id)).filter(Boolean) || [];

  const JournalSummary: React.FC = () => (
    <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3 flex justify-between items-center">
      <div>
        {todayEntry ? (
          <div className="flex gap-4 text-xs">
            <span className="font-semibold text-gray-300">Today's Vitals:</span>
            <span className="text-purple-300">Mood: {todayEntry.mood}/5</span>
            <span className="text-yellow-300">Energy: {todayEntry.energy}/5</span>
            <span className="text-blue-300">Focus: {todayEntry.focus}/5</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No vitals logged yet for today.</p>
        )}
      </div>
      <button onClick={openJournalModal} className="bg-cyan-500/80 text-black font-bold py-2 px-4 rounded-md hover:bg-cyan-400 text-sm transition-colors">
        {todayEntry ? 'Update' : 'Log Vitals'}
      </button>
    </div>
  );

  const RatingInput: React.FC<{ label: string, value: number, onChange: (val: number) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2 text-center">{label}</label>
        <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => onChange(v)} className={`w-10 h-10 rounded-full transition-all border-2 text-black font-bold ${v === value ? 'bg-cyan-400 border-cyan-300 scale-110' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                    {v}
                </button>
            ))}
        </div>
    </div>
  );

  const JournalModal: React.FC = () => {
    if (!isJournalModalOpen) return null;
    const isApiKeyMissing = !process.env.API_KEY;
    const isAiEnabled = platformConfig?.isAiEnabled ?? true;
    const aiFeaturesDisabled = isApiKeyMissing || !isAiEnabled;
    const buttonText = draftedJournalEntry ? 'Confirm Entry' : todayEntry ? 'Update Log' : 'Save Log';

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
        <div 
          className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-lg text-white p-6 relative shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-title text-2xl font-bold text-gray-200">Daily Log</h2>
            <button
              onClick={() => draftMutation.mutate()}
              disabled={aiFeaturesDisabled || draftMutation.isPending}
              title={!isAiEnabled ? "AI features are disabled by the administrator." : ""}
              className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
            >
              {draftMutation.isPending ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.455L12.75 18l1.177-.398a3.375 3.375 0 002.455-2.455l.398-1.177.398 1.177a3.375 3.375 0 002.455 2.455l1.177.398-1.177.398a3.375 3.375 0 00-2.455 2.455z" /></svg>
              )}
              <span>Draft with Kai</span>
            </button>
          </div>
          <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-gray-800/40 p-4 rounded-lg">
                  <RatingInput label="Mood" value={mood} onChange={setMood} />
                  <RatingInput label="Energy" value={energy} onChange={setEnergy} />
                  <RatingInput label="Focus" value={focus} onChange={setFocus} />
              </div>
              <div>
                  <label htmlFor="notes-modal" className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                  <textarea
                      id="notes-modal"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any reflections? e.g., 'Big project deadline today', 'Felt great after my run'"
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  />
              </div>
              
              {completedTodayProtocols.length > 0 && (
                  <div>
                      <h4 className="block text-sm font-medium text-gray-400 mb-2">Completed Today (Auto-logged)</h4>
                      <div className="flex flex-wrap gap-2">
                          {completedTodayProtocols.map(p => (
                               <span key={p!.id} className="text-xs px-2 py-1 rounded bg-green-900/50 border border-green-500/50 text-green-300">
                                  {p!.name}
                              </span>
                          ))}
                      </div>
                  </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsVoiceLoggerOpen(true)}
                        disabled={aiFeaturesDisabled}
                        title={!isAiEnabled ? "AI features are disabled by the administrator." : ""}
                        className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-5 5h0a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" /></svg>
                        Log with Voice
                    </button>
                    <button
                      onClick={() => setIsVisionLoggerOpen(true)}
                      disabled={aiFeaturesDisabled}
                      title={!isAiEnabled ? "AI features are disabled by the administrator." : ""}
                      className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-400 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M1 10a9 9 0 0118 0 9 9 0 01-18 0z" /><path d="M10 1a9 9 0 014.949 16.594l-1.09-1.09A7.5 7.5 0 1010 2.5a7.523 7.523 0 00-2.338.423l.63.63A8.958 8.958 0 0110 1z" /><path d="M10 2.5a7.5 7.5 0 00-4.95 13.094l1.09-1.09A6 6 0 1110 4a6.002 6.002 0 013.338 1.077l-.63-.63A7.458 7.458 0 0010 2.5z" /><path d="M7.172 10l-1.414-1.414a.5.5 0 11.707-.707l2.121 2.121.707.707 2.121-2.121a.5.5 0 01.707.707L10 12.828 7.172 10z" /></svg>
                      Log with Camera
                    </button>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-cyan-500 text-black font-bold py-3 rounded-lg h-12 hover:bg-cyan-400 transition-colors"
                >
                  {buttonText}
                </button>
              </div>
          </div>
          <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {isVisionLoggerOpen && (
          <VisionLogger 
            onClose={() => setIsVisionLoggerOpen(false)} 
            onLog={handleVisionLog} 
          />
        )}
        {isVoiceLoggerOpen && (
            <VoiceMemoLogger
                onClose={() => setIsVoiceLoggerOpen(false)}
                onLog={handleVoiceLog}
            />
        )}
      </div>
    );
  };

  return (
    <>
      <JournalSummary />
      <JournalModal />
    </>
  );
};

export default JournalingPanel;
