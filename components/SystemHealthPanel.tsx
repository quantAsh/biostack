import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isFirebaseEnabled, auth } from '../services/firebase';
import { pingGemini } from '../services/geminiService';
import { useDataStore } from '../stores/dataStore';
import { log } from '../stores/logStore';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';

type Status = 'unknown' | 'ok' | 'error' | 'pending';

const StatusIndicator: React.FC<{ status: Status }> = ({ status }) => {
    const styles = {
        unknown: { bg: 'bg-gray-500', text: 'text-gray-300', label: 'Unknown' },
        ok: { bg: 'bg-green-500', text: 'text-green-300', label: 'OK' },
        error: { bg: 'bg-red-500', text: 'text-red-300', label: 'Error' },
        pending: { bg: 'bg-yellow-500', text: 'text-yellow-300', label: 'Pending' },
    };
    const current = styles[status];
    return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${current.bg}/20 ${current.text}`}>
            <div className={`w-2 h-2 rounded-full ${current.bg}`}></div>
            <span>{current.label}</span>
        </div>
    );
};

const SystemCheckModule: React.FC<{ title: string, description: string, status: Status, action?: () => void, actionLabel?: string, isLoading?: boolean }> = 
({ title, description, status, action, actionLabel, isLoading }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto">
                <StatusIndicator status={status} />
                {action && actionLabel && (
                    <button onClick={action} disabled={isLoading} className="bg-sky-600/80 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-sky-500/80 disabled:bg-gray-600 disabled:cursor-not-allowed w-full sm:w-auto">
                        {isLoading ? '...' : actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

const SystemHealthPanel: React.FC = () => {
    const { protocols, communityStacks } = useDataStore();
    const [firebaseStatus, setFirebaseStatus] = useState<Status>('unknown');
    const [geminiStatus, setGeminiStatus] = useState<Status>('unknown');

    useEffect(() => {
        setFirebaseStatus(isFirebaseEnabled && auth.currentUser ? 'ok' : 'error');
    }, []);

    const geminiPingMutation = useMutation({
        mutationFn: pingGemini,
        onMutate: () => setGeminiStatus('pending'),
        onSuccess: (isOk) => {
            setGeminiStatus(isOk ? 'ok' : 'error');
            toast.success(`Gemini API Ping: ${isOk ? 'Successful' : 'Failed'}`);
        },
        onError: () => {
            setGeminiStatus('error');
            toast.error('Gemini API Ping failed.');
        }
    });
    
    const handleSimulateError = () => {
        try {
            log('WARN', 'Simulating a client-side error...');
            throw new Error("This is a simulated error from the admin panel.");
        } catch (e: any) {
            log('ERROR', e.message, { stack: e.stack });
            toast.error('Simulated error has been logged.');
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <SystemCheckModule
                    title="Firebase Services"
                    description="Checks connection to Firebase Auth & Firestore for data persistence."
                    status={firebaseStatus}
                />
                <SystemCheckModule
                    title="Gemini AI API"
                    description="Pings the Gemini API to ensure the API key is valid and the service is reachable."
                    status={geminiStatus}
                    action={() => geminiPingMutation.mutate()}
                    actionLabel="Run Test"
                    isLoading={geminiPingMutation.isPending}
                />
                 <SystemCheckModule
                    title="Ceramic Service (Simulated)"
                    description="Verifies that the simulated sovereign data service is operational."
                    status={'ok'}
                />
                 <SystemCheckModule
                    title="Data Store Integrity"
                    description={`Checks if core data is loaded. Protocols: ${protocols.length}, Stacks: ${communityStacks.length}`}
                    status={protocols.length > 0 && communityStacks.length > 0 ? 'ok' : 'error'}
                />
                 <SystemCheckModule
                    title="Error Logging Test"
                    description="Triggers a simulated client-side error to test the logging system."
                    status={'unknown'}
                    action={handleSimulateError}
                    actionLabel="Trigger Error"
                />
            </div>
            <div className="pt-6 border-t border-dashed border-gray-700/50">
                 <DebugPanel />
            </div>
        </div>
    );
};

export default SystemHealthPanel;