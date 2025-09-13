import React from 'react';
import { useUserStore } from '../stores/userStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const IdentityPanel: React.FC = () => {
    const did = useUserStore(state => state.did);
    const verifiableCredentials = useUserStore(state => state.verifiableCredentials);
    const createDID = useUserStore(state => state.createDID);

    const createDidMutation = useMutation({
        mutationFn: createDID,
    });

    const handleCreateDid = () => {
        createDidMutation.mutate();
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <div className="flex items-start gap-4 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-blue-300 flex-shrink-0">
                    <path d="M10 2a.75.75 0 01.75.75v.518a4.5 4.5 0 010 8.464v.518a.75.75 0 01-1.5 0v-.518a4.5 4.5 0 010-8.464v-.518A.75.75 0 0110 2zM5.5 6.5A.5.5 0 005 7v6a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V7a.5.5 0 00-.5-.5h-9z" />
                    <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM10 1.25a8.75 8.75 0 100 17.5 8.75 8.75 0 000-17.5z" />
                </svg>
                <div>
                    <h3 className="font-title text-xl font-bold text-blue-300">Sovereign Identity</h3>
                    <p className="text-gray-400 text-sm max-w-xl">
                        Your Decentralized Identifier (DID) is your universal, self-owned identity on the decentralized web. Use it to receive and manage verifiable credentials.
                    </p>
                </div>
            </div>

            {did ? (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Your Decentralized Identifier (DID)</h4>
                        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 font-mono text-sm text-blue-300 break-all">
                            {did}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">My Verifiable Credentials</h4>
                        <div className="space-y-3">
                            {verifiableCredentials.length > 0 ? (
                                verifiableCredentials.map(vc => (
                                    <div key={vc.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                        <p className="font-semibold text-green-400">{vc.type}</p>
                                        <p className="text-xs text-gray-500">Issued by: {vc.issuer}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">You have not claimed any credentials yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-gray-800/40 p-6 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-lg text-gray-200 mb-2">Activate Your Sovereign Identity</h4>
                    <p className="text-gray-400 text-sm mb-4">Generate your personal DID to start managing your data with full sovereignty.</p>
                    <button
                        onClick={handleCreateDid}
                        disabled={createDidMutation.isPending}
                        className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600"
                    >
                        {createDidMutation.isPending ? 'Generating...' : 'Activate Identity'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default IdentityPanel;