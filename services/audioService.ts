import { log } from '../stores/logStore';

class AudioService {
  private audioContext: AudioContext | null = null;
  // For Binaural Beats (output)
  private oscillatorL: OscillatorNode | null = null;
  private oscillatorR: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  // For Microphone (input)
  private microphoneStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  public isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  private initContext() {
    if (!this.audioContext) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // --- BINAURAL BEATS METHODS ---
  createBeats(baseFrequency: number, beatFrequency: number) {
    if (!this.isSupported) return;
    this.stop();
    this.initContext();
    if (!this.audioContext) return;

    this.oscillatorL = this.audioContext.createOscillator();
    this.oscillatorR = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();
    const merger = this.audioContext.createChannelMerger(2);

    this.oscillatorL.frequency.setValueAtTime(baseFrequency - (beatFrequency / 2), this.audioContext.currentTime);
    this.oscillatorR.frequency.setValueAtTime(baseFrequency + (beatFrequency / 2), this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

    this.oscillatorL.connect(merger, 0, 0);
    this.oscillatorR.connect(merger, 0, 1);
    merger.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.oscillatorL.start();
    this.oscillatorR.start();
    log('DEBUG', 'Binaural beats created', { baseFrequency, beatFrequency });
  }

  play() {
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.5, this.audioContext.currentTime + 0.5);
      log('DEBUG', 'Binaural beats playing');
    }
  }

  stop() {
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);
      setTimeout(() => {
        this.oscillatorL?.stop();
        this.oscillatorR?.stop();
        this.oscillatorL?.disconnect();
        this.oscillatorR?.disconnect();
        this.gainNode?.disconnect();
        this.oscillatorL = null;
        this.oscillatorR = null;
        this.gainNode = null;
        log('DEBUG', 'Binaural beats stopped');
      }, 500);
    }
  }

  // --- MICROPHONE METHODS ---
  async startMicrophoneListener(onVolumeChange: (volume: number) => void): Promise<void> {
    if (!this.isSupported || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Microphone access not supported.");
      throw new Error("Microphone access not supported.");
    }
    this.stopMicrophoneListener();
    this.initContext();
    if (!this.audioContext) throw new Error("Audio context could not be created.");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.microphoneStream = stream;
        const source = this.audioContext!.createMediaStreamSource(stream);
        this.analyser = this.audioContext!.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const loop = () => {
            if (!this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const averageVolume = sum / bufferLength;
            onVolumeChange(averageVolume);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
        log('DEBUG', 'Microphone listener started.');
    } catch (err) {
        console.error("Error accessing microphone:", err);
        log('ERROR', 'Error accessing microphone', { error: err });
        throw new Error("Could not access microphone. Please check permissions.");
    }
  }

  stopMicrophoneListener(): void {
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    if (this.microphoneStream) {
        this.microphoneStream.getTracks().forEach(track => track.stop());
        this.microphoneStream = null;
    }
    if (this.analyser) {
        this.analyser.disconnect();
        this.analyser = null;
    }
    log('DEBUG', 'Microphone listener stopped.');
  }
}

export const audioService = new AudioService();
