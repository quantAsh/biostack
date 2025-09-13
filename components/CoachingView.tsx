import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useMutation } from '@tanstack/react-query';
import { getCoachingStep } from '../services/geminiService';
import { speechService } from '../services/speechService';
import { ChatMessage, CoachingMode, FeedbackRating } from '../types';
import { KaiIcon } from './KaiIcon';
import MarkdownIt from 'markdown-it';
import { useDataStore } from '../stores/dataStore';
import toast from 'react-hot-toast';

const md = new MarkdownIt({ html: true });

const FeedbackComponent: React.FC<{ message: ChatMessage, history: ChatMessage[] }> = ({ message, history }) => {
    const { submitFeedback } = useDataStore();
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState('');

    const handleFeedback = (rating: FeedbackRating) => {
        if (feedbackSent) return;
        
        if (rating === 'negative') {
            setShowComment(true);
        } else {
            submitFeedback({
                type: 'ai_response',
                rating: 'positive',
                context: {
                    prompt: history,
                    response: message.content,
                    view: 'coaching'
                }
            });
            toast.success("Feedback submitted!");
            setFeedbackSent(true);
        }
    };
    
    const handleCommentSubmit = () => {
        submitFeedback({
            type: 'ai_response',
            rating: 'negative',
            comment: comment,
            context: {
                prompt: history,
                response: message.content,
                view: 'coaching'
            }
        });
        toast.success("Thank you for your feedback!");
        setFeedbackSent(true);
        setShowComment(false);
    };

    if (feedbackSent) {
        return <span className="text-xs text-gray-500">Feedback received</span>;
    }

    if (showComment) {
        return (
            <div className="flex items-center gap-1 mt-2">
                <input 
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Briefly, what was wrong?"
                    className="w-full bg-gray-700 text-xs p-1 rounded-md border border-gray-600"
                />
                <button onClick={handleCommentSubmit} className="p-1 rounded-md bg-gray-600 hover:bg-gray-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M2.87 2.22A.75.75 0 0 0 2 2.993v10.014c0 .815.933 1.25 1.58 1.03l10.332-3.399a.75.75 0 0 0 0-1.261L3.58 6.001A.75.75 0 0 0 2.87 2.22Z" /></svg></button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1.5 mt-2">
            <button onClick={() => handleFeedback('positive')} title="Good response" className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M11.238 2.517a1.75 1.75 0 0 1 2.33 2.232l-1.343 4.21a1.75 1.75 0 0 1-1.658 1.291H6.25V14a.75.75 0 0 1-1.5 0V7.5h-.5a.75.75 0 0 1 0-1.5h.5V2.75a.75.75 0 0 1 1.5 0v3.522l1.68-.84c.34-.17.712-.257 1.082-.257H10.5v-.5a.75.75 0 0 1 .738-.75Z" />
                </svg>
            </button>
            <button onClick={() => handleFeedback('negative')} title="Bad response" className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-red-400">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M4.762 13.483a1.75 1.75 0 0 1-2.33-2.232l1.343-4.21a1.75 1.75 0 0 1 1.658-1.291h4.25V2a.75.75 0 0 1 1.5 0v6.5h.5a.75.75 0 0 1 0 1.5h-.5v3.25a.75.75 0 0 1-1.5 0V9.978l-1.68.84c-.34.17-.712.257-1.082.257H5.5v.5a.75.75 0 0 1-.738.75Z" />
                </svg>
            </button>
        </div>
    );
}

const ModeIconButton: React.FC<{ mode: CoachingMode }> = ({ mode }) => {
    switch (mode) {
        case 'text':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.5a2 2 0 004 0 .75.75 0 011.5 0 3.5 3.5 0 01-7 0A.75.75 0 0110 2zM3 9.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 14a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
        case 'pushToTalk':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-5 5h0a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" /></svg>;
        case 'handsFree':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v.34c0 .32.1.63.29.88l1.12 1.49A1.5 1.5 0 006.9 12H13.1a1.5 1.5 0 001.48-1.29l1.12-1.49a1.2 1.2 0 00.29-.88V8a6 6 0 00-6-6zM10 13a1 1 0 100 2 1 1 0 000-2z" /><path d="M4.12 15.186A11.02 11.02 0 0010 18a11.02 11.02 0 005.88-2.814l-1.12.747a9.02 9.02 0 01-9.52 0l-1.12-.747z" /></svg>;
        default:
            return null;
    }
};

const CoachingView: React.FC = () => {
  const {
    activeCoachingProtocol,
    coachingMessages,
    endCoachingSession,
    addCoachingMessage,
    coachingMode,
    setCoachingMode,
    kaiVoiceURI,
    openUpgradeModal,
  } = useUIStore();
  const isPremium = useUserStore(state => state.isPremium);
  const { platformConfig } = useDataStore();
  const isAiEnabled = platformConfig?.isAiEnabled ?? true;

  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const speechTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const coachingMutation = useMutation({
    mutationFn: (data: { history: ChatMessage[]; isVoiceEnabled: boolean }) => {
      if (!activeCoachingProtocol) throw new Error("No active protocol for coaching.");
      return getCoachingStep(activeCoachingProtocol, data.history, data.isVoiceEnabled);
    },
    onSuccess: (response) => {
      addCoachingMessage({ role: 'kai', content: response });
      if (useUIStore.getState().coachingMode !== 'text') {
        const plainText = response.replace(/<\/?[^>]+(>|$)/g, "").replace(/###|##|#|\*|_/g, '');
        speechService.speak(plainText, useUIStore.getState().kaiVoiceURI);
      }
    },
    onError: (error) => {
      const errorMessage = `Apologies, an error occurred. ${error.message}`;
      addCoachingMessage({ role: 'kai', content: errorMessage });
      if (useUIStore.getState().coachingMode !== 'text') {
        speechService.speak(errorMessage, useUIStore.getState().kaiVoiceURI);
      }
    },
  });

  const handleSend = (text: string) => {
    if (text.trim() === '' || coachingMutation.isPending) return;
    
    if (!isAiEnabled) {
        addCoachingMessage({ role: 'kai', content: "AI coaching is currently disabled by the administrator." });
        return;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: text };
    const newHistory = [...coachingMessages, newUserMessage];
    addCoachingMessage(newUserMessage);
    coachingMutation.mutate({ history: newHistory, isVoiceEnabled: coachingMode !== 'text' });
    setUserInput('');
  };

  useEffect(() => {
    if (coachingMessages.length === 0) {
        if (!isAiEnabled) {
            addCoachingMessage({ role: 'kai', content: "AI coaching is currently disabled by the administrator." });
            return;
        }
        coachingMutation.mutate({ history: [], isVoiceEnabled: coachingMode !== 'text' });
    }
  }, [coachingMode, isAiEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [coachingMessages]);
  
  // Effect to handle continuous listening
  useEffect(() => {
    if (coachingMode === 'handsFree' && isPremium && isAiEnabled) {
      setIsListening(true);
      let fullTranscript = '';
      
      const onSpeechResult = (transcript: string, isFinal: boolean) => {
          if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
          
          if (isFinal) {
            fullTranscript += transcript + ' ';
            setInterimTranscript('');
          } else {
            setInterimTranscript(transcript);
          }
          
          speechTimeoutRef.current = window.setTimeout(() => {
            if (fullTranscript.trim()) {
              handleSend(fullTranscript.trim());
              fullTranscript = '';
            }
          }, 1500); // Send after 1.5s of silence
      };

      speechService.startContinuousListening(onSpeechResult, (error) => console.error(error));
    } else {
      speechService.stopContinuousListening();
      setIsListening(false);
    }
    return () => {
      speechService.stopContinuousListening();
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
  }, [coachingMode, isPremium, isAiEnabled]);


  const handleListenSingle = () => {
    if (!speechService.isRecognitionSupported) {
      alert("Speech recognition is not supported by your browser.");
      return;
    }
    setIsListening(true);
    speechService.startSingleUtteranceListening(
      (transcript) => {
        handleSend(transcript);
        setIsListening(false);
      },
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(userInput);
    }
  };

  const handleCycleMode = () => {
    speechService.cancel();
    speechService.stopContinuousListening();

    if (coachingMode === 'text') {
        setCoachingMode('pushToTalk');
    } else if (coachingMode === 'pushToTalk') {
        if (!isPremium) {
            openUpgradeModal();
            return;
        }
        setCoachingMode('handsFree');
    } else { // handsFree
        setCoachingMode('text');
    }
  };

  const handleEndSession = () => {
    speechService.cancel();
    speechService.stopContinuousListening();
    endCoachingSession();
  };

  if (!activeCoachingProtocol) {
    return null; // Should not happen as view is controlled
  }
  
  const modeTitles: Record<CoachingMode, string> = {
    text: "Text Mode",
    pushToTalk: "Push-to-Talk Mode",
    handsFree: "Hands-Free Mode"
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/20 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <KaiIcon className="w-8 h-8 text-cyan-300" />
          <div>
            <h2 className="font-title text-xl font-bold text-cyan-300">Coaching Session</h2>
            <p className="text-gray-400 text-sm">{activeCoachingProtocol.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleCycleMode}
            title={`Switch Mode (Current: ${modeTitles[coachingMode]})`}
            className="p-2 rounded-full transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 relative"
          >
            <ModeIconButton mode={coachingMode} />
            {coachingMode === 'pushToTalk' && !isPremium && (
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 ring-2 ring-gray-900"></span>
                </span>
            )}
          </button>
          <button onClick={handleEndSession} className="bg-red-800/80 text-red-100 font-bold py-2 px-4 rounded-lg hover:bg-red-700/80 transition-colors text-sm">End Session</button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-grow overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-4">
        {coachingMessages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'kai' && <KaiIcon className="w-8 h-8 flex-shrink-0 text-cyan-400 mt-1" />}
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'kai' ? 'bg-gray-800 text-gray-300' : 'bg-cyan-600 text-white'}`}>
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1" dangerouslySetInnerHTML={{ __html: md.render(msg.content) }}/>
              {msg.role === 'kai' && (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <FeedbackComponent message={msg} history={coachingMessages} />
                </div>
              )}
            </div>
          </div>
        ))}
        {coachingMutation.isPending && (
          <div className="flex items-start gap-3"><KaiIcon className="w-8 h-8 flex-shrink-0 text-cyan-400 mt-1" /><div className="max-w-xl p-3 rounded-lg bg-gray-800 text-gray-300"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div></div></div></div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-gray-900/80 backdrop-blur-md border-t border-cyan-500/20 p-4 flex-shrink-0">
        <div className="flex flex-col gap-2 max-w-3xl mx-auto items-center">
            {coachingMode === 'text' && (
                <div className="w-full flex items-center gap-2">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your response..."
                        rows={1}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none custom-scrollbar"
                        disabled={coachingMutation.isPending || !isAiEnabled}
                    />
                     <button
                        onClick={() => handleSend(userInput)}
                        disabled={userInput.trim() === '' || coachingMutation.isPending || !isAiEnabled}
                        className="bg-cyan-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.53l4.949-1.414a.75.75 0 00-.424-1.425L4.09 7.84a.75.75 0 00-.985-.55z" /><path d="M10.295 1.105a.75.75 0 01.95.826l-1.414 4.949a.75.75 0 01-.53.95l-4.949 1.414a.75.75 0 01-1.425-.424l-.001-.002 1.414-4.949a.75.75 0 01.55-.985l4.949-1.414zM17.71 8.95a.75.75 0 01.023 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.038-.022zM8.95 17.71a.75.75 0 01-1.06.022l-4.25-4.25a.75.75 0 011.06-1.06l4.25 4.25a.75.75 0 01-.023 1.06z" /></svg>
                    </button>
                </div>
            )}

            {coachingMode === 'pushToTalk' && (
                <button
                    onClick={handleListenSingle}
                    disabled={isListening || coachingMutation.isPending || !isAiEnabled}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-cyan-500 text-black hover:bg-cyan-400 scale-100'} disabled:bg-gray-600`}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-5 5h0a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" /></svg>
                </button>
            )}

            {coachingMode === 'handsFree' && (
                <div className="flex items-center gap-2 text-indigo-300">
                    <div className="listening-indicator-container !p-0">
                        <div className="listening-dot"></div><div className="listening-dot"></div><div className="listening-dot"></div>
                    </div>
                    <span>Kai is listening...</span>
                </div>
            )}
        </div>
      </footer>
    </div>
  );
};

export default CoachingView;