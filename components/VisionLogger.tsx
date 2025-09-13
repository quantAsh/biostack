

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getJournalEntryFromImage } from '../services/geminiService';
import { JournalEntry } from '../types';

interface VisionLoggerProps {
  onClose: () => void;
  onLog: (data: Partial<JournalEntry>) => void;
}

const VisionLogger: React.FC<VisionLoggerProps> = ({ onClose, onLog }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (base64: string) => getJournalEntryFromImage(base64),
    onSuccess: (data) => {
      onLog(data);
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageData(dataUrl);
      }
    }
  };

  const handleAnalyze = () => {
    if (imageData) {
      const base64 = imageData.split(',')[1];
      mutation.mutate(base64);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg text-white p-6 relative">
        <h2 className="font-title text-2xl font-extrabold text-indigo-300 mb-4">Vision Logger</h2>
        
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
          {error && <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4">{error}</div>}
          
          {imageData ? (
            <img src={imageData} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          )}

          {mutation.isPending && (
             <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-indigo-300 font-semibold">Kai is analyzing...</p>
             </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {mutation.error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center mb-4">{String(mutation.error)}</div>}

        <div className="flex gap-4">
          {imageData ? (
            <>
              <button onClick={() => setImageData(null)} className="w-full bg-gray-700 text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-600">Retake</button>
              <button onClick={handleAnalyze} disabled={mutation.isPending} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-lg hover:bg-indigo-400 disabled:bg-gray-600">Use this image</button>
            </>
          ) : (
            <button onClick={captureImage} className="w-full bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400">Capture</button>
          )}
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default VisionLogger;