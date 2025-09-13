import React, { useState, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';

const VoiceSettings: React.FC = () => {
  const { kaiVoiceURI, setKaiVoiceURI, openUpgradeModal } = useUIStore(state => ({
    kaiVoiceURI: state.kaiVoiceURI,
    setKaiVoiceURI: state.setKaiVoiceURI,
    openUpgradeModal: state.openUpgradeModal,
  }));
  const isPremium = useUserStore(state => state.isPremium);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(kaiVoiceURI || '');
  
  const isDisabled = !isPremium;

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = speechService.getVoices();
      if (availableVoices.length > 0) {
        const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
        setVoices(englishVoices);
        if (!kaiVoiceURI && englishVoices.length > 0) {
          const defaultVoice = 
            englishVoices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
            englishVoices.find(v => v.name.includes('Natural') && v.lang === 'en-US') ||
            englishVoices.find(v => v.lang === 'en-US') || 
            englishVoices[0];
            
          if (defaultVoice) {
            const uri = defaultVoice.voiceURI;
            setSelectedVoice(uri);
            setKaiVoiceURI(uri);
          }
        }
      }
    };
    
    // Voices might load asynchronously
    if (speechService.isSupported) {
        fetchVoices();
        // Use a timeout to handle browsers where onvoiceschanged doesn't fire reliably on load
        const voiceTimeout = setTimeout(fetchVoices, 200);
        speechSynthesis.onvoiceschanged = fetchVoices;

        return () => {
            clearTimeout(voiceTimeout);
            speechSynthesis.onvoiceschanged = null;
        };
    }
  }, [kaiVoiceURI, setKaiVoiceURI]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isDisabled) return;
    const uri = e.target.value;
    setSelectedVoice(uri);
    setKaiVoiceURI(uri);
  };

  const handleTestVoice = () => {
    if (isDisabled) return;
    if (selectedVoice) {
        speechService.speak("This is the selected voice for Kai.", selectedVoice);
    }
  };

  const handleInteraction = () => {
      if(isDisabled) {
          openUpgradeModal();
      }
  }

  if (!speechService.isSupported || !speechService.isRecognitionSupported) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
          <h3 className="font-title text-xl font-bold text-gray-200 mb-2">Voice Configuration</h3>
          <p className="text-gray-500">Voice features are not supported by your current browser.</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 my-8 mx-auto max-w-4xl ${isDisabled ? 'opacity-70' : ''}`} onClick={handleInteraction}>
        {isDisabled && <div className="absolute inset-0 z-10 cursor-pointer"></div>}
        <div className="flex items-center gap-2 mb-4">
            <h3 className="font-title text-xl font-bold text-gray-200">Voice Configuration</h3>
            {!isPremium && <span className="px-2 py-0.5 text-xs font-bold text-black bg-yellow-400 rounded-full">Kai+</span>}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-grow w-full">
                <label htmlFor="voice-select" className="block text-sm font-medium text-gray-400 mb-2">Kai's Voice</label>
                <select
                    id="voice-select"
                    value={selectedVoice}
                    onChange={handleVoiceChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-gray-800 disabled:cursor-not-allowed"
                    disabled={voices.length === 0 || isDisabled}
                >
                    {voices.length > 0 ? (
                        voices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))
                    ) : (
                        <option>Loading voices...</option>
                    )}
                </select>
            </div>
            <button
                onClick={handleTestVoice}
                disabled={!selectedVoice || isDisabled}
                className="w-full sm:w-auto mt-2 sm:mt-8 bg-gray-700 text-gray-200 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                Test Voice
            </button>
        </div>
         {isDisabled && <p className="text-xs text-yellow-300 mt-3">Upgrade to Kai+ to customize Kai's voice.</p>}
    </div>
  );
};

export default VoiceSettings;