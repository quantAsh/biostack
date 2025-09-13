// A wrapper around the Web Speech API for Text-to-Speech and Speech-to-Text.

// Type definitions for the Web Speech API to fix TypeScript compilation errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic { new(): SpeechRecognition; }
interface SpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: SpeechRecognitionResultList; }
interface SpeechRecognitionErrorEvent extends Event { readonly error: string; readonly message: string; }
interface SpeechRecognitionResultList { readonly length: number; item(index: number): SpeechRecognitionResult;[index: number]: SpeechRecognitionResult; }
interface SpeechRecognitionResult { readonly isFinal: boolean; readonly length: number; item(index: number): SpeechRecognitionAlternative;[index: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionAlternative { readonly transcript: string; readonly confidence: number; }

declare global {
  interface Window { SpeechRecognition: SpeechRecognitionStatic; webkitSpeechRecognition: SpeechRecognitionStatic; }
}

class SpeechService {
  private synth: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  public isSupported: boolean;
  public isRecognitionSupported: boolean;
  private isContinuous = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.isRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (this.isSupported) {
      this.synth = window.speechSynthesis;
      this.populateVoiceList();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = this.populateVoiceList;
      }
    }

    if (this.isRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
    }
  }

  private populateVoiceList = () => {
    if (this.isSupported) {
      this.voices = this.synth.getVoices();
    }
  };
  
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speak(text: string, voiceURI: string | null = null, onEnd?: () => void): void {
    if (!this.isSupported) {
      console.warn("Speech synthesis not supported.");
      return;
    }
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    
    let selectedVoice: SpeechSynthesisVoice | undefined;
    if (voiceURI) {
      selectedVoice = this.voices.find(v => v.voiceURI === voiceURI);
    }
    
    if (!selectedVoice) {
      const preferredVoices = [
        (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name.includes('Natural') && v.lang.startsWith('en-US'),
        (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.localService,
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en-GB'),
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ];
      for (const check of preferredVoices) {
          selectedVoice = this.voices.find(check);
          if (selectedVoice) break;
      }
    }

    utterance.voice = selectedVoice || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    utterance.pitch = 1;
    utterance.rate = 1;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  cancel(): void {
    if (this.isSupported && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  startSingleUtteranceListening(onResult: (transcript: string) => void, onError: (error: string) => void): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      onResult(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => onError(event.error);
    
    try {
      this.recognition.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
    }
  }

  startContinuousListening(onResult: (transcript: string, isFinal: boolean) => void, onError: (error: string) => void): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported.');
      return;
    }
    this.isContinuous = true;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      if (finalTranscript) onResult(finalTranscript, true);
      if (interimTranscript) onResult(interimTranscript, false);
    };
    
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError(event.error);
      }
    };
    
    this.recognition.onend = () => {
      if (this.isContinuous) {
        try { this.recognition?.start(); } catch(e) { console.error("Could not restart listener", e); }
      }
    };
    
    try {
      this.recognition.start();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'InvalidStateError') {
        // Recognition is already active, which is fine. Ignore the error.
      } else {
        console.error("Continuous listening already active or error starting:", e);
      }
    }
  }

  stopContinuousListening(): void {
    this.isContinuous = false;
    this.recognition?.stop();
  }
}

export const speechService = new SpeechService();