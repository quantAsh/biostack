import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';

const ArGuideModal: React.FC = () => {
    const { isArGuideModalOpen, closeArGuideModal, activeArGuideProtocol } = useUIStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        const startCamera = async () => {
            if (isArGuideModalOpen) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' }
                    });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        streamRef.current = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please check permissions in your browser settings.");
                }
            } else {
                stopCamera();
            }
        };

        startCamera();
        
        return () => {
            stopCamera();
        };
    }, [isArGuideModalOpen, stopCamera]);
    
    if (!isArGuideModalOpen) return null;

    const renderOverlay = () => {
        if (!activeArGuideProtocol) return null;
        switch (activeArGuideProtocol.name) {
            case 'Box Breathing':
                return (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="ar-box-breathing-pacer"></div>
                        <p className="mt-4 bg-black/50 p-2 rounded-md font-hud tracking-widest text-white">Follow the Pacer</p>
                    </div>
                );
            case 'Sun Salutation (Surya Namaskar)':
            case 'Yoga':
                return (
                    <div className="bg-black/50 p-4 rounded-md text-white">
                        <h3 className="font-bold">AR Instructor</h3>
                        <p className="text-sm">A 3D model would appear here to guide your posture.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="ar-guide-overlay" onClick={closeArGuideModal}>
            <div className="ar-guide-content" onClick={e => e.stopPropagation()}>
                {error ? (
                    <div className="p-4 text-center text-red-400">{error}</div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="ar-video-feed"></video>
                )}
                <div className="ar-overlay-content">{renderOverlay()}</div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <button onClick={closeArGuideModal} className="bg-red-600/80 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-500/80">
                        End Guide
                    </button>
                </div>

                <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-2 rounded-md">
                    <h3 className="font-bold">{activeArGuideProtocol?.name}</h3>
                </div>
            </div>
        </div>
    );
};

export default ArGuideModal;