import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { ZKProof } from '../types';
import toast from 'react-hot-toast';

const ZKProofPanel: React.FC = () => {
    const zkProofs = useUserStore(state => state.zkProofs);
    const generateZKProof = useUserStore(state => state.generateZKProof);
    const journalEntries = useUserStore(state => state.journalEntries);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleGenerate = async (type: ZKProof['type'], statement: string, requirement: () => boolean) => {
        if (!requirement()) {
            toast.error("Insufficient data to generate this proof. Keep logging your progress!");
            return;
        }
        setIsLoading(type);
        await generateZKProof(type, statement);
        setIsLoading(null);
    };

    const proofOptions = [
        {
            type: 'Wellness Verification',
            title: 'Wellness Program Verification',
            description: 'Prove you completed at least 12 Zone 2 sessions last month for your insurance provider, without sharing specific workout data.',
            statement: 'I have verifiably completed 12 or more Zone 2 training sessions in the last 30 days.',
            requirement: () => journalEntries.length > 10, // Simplified check
        },
        {
            type: 'Research Contribution',
            title: 'Anonymous Research Contribution',
            description: "Prove to a research study that your average sleep score is over 80, without revealing your actual sleep logs.",
            statement: 'My average sleep score over the last 14 days is verifiably 80 or greater.',
            requirement: () => journalEntries.length > 14, // Simplified check
        },
        {
            type: 'Community Access',
            title: 'Private Group Access',
            description: "Generate a proof showing you've completed the '14-Day Stress Resilience' journey to gain access to an exclusive community channel.",
            statement: 'I have verifiably completed the "14-Day Stress Resilience" journey.',
            requirement: () => true, // Simplified check
        },
    ];

    const proofTypeDetails: Record<ZKProof['type'], { title: string; color: string }> = {
        'Wellness Verification': { title: 'Wellness Program Verification', color: 'text-blue-300' },
        'Research Contribution': { title: 'Anonymous Research Contribution', color: 'text-teal-300' },
        'Community Access': { title: 'Private Group Access', color: 'text-purple-300' },
        'Research Eligibility': { title: 'Research Study Eligibility', color: 'text-cyan-300' },
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <div className="flex items-start gap-4 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-green-300 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 4.5c.384 0 .75.023 1.11.066a.75.75 0 01.597.878A8.252 8.252 0 0110.13 10H10a.75.75 0 000 1.5h.13a8.252 8.252 0 01-1.577 4.556.75.75 0 01-.878-.597A11.96 11.96 0 014.5 10c0-1.57.3-3.074.857-4.444.24-.587.89-.868 1.48-.627A4.45 4.45 0 0110 4.5zM15.5 10c0 .942-.148 1.85-.422 2.705a.75.75 0 01-1.356-.61c.23-.7.378-1.438.378-2.095a.75.75 0 011.5 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-1.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" clipRule="evenodd" />
                </svg>
                <div>
                    <h3 className="font-title text-xl font-bold text-green-300">Zero-Knowledge Proof Subsystem</h3>
                    <p className="text-gray-400 text-sm max-w-xl">
                        This is the future of data sovereignty. Generate cryptographic proofs to verify facts about your data to third parties <span className="font-bold text-green-300">without revealing the underlying sensitive information.</span>
                    </p>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {proofOptions.map(opt => (
                     <div key={opt.type} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col">
                        <h4 className="font-semibold text-gray-200 flex-grow">{opt.title}</h4>
                        <p className="text-xs text-gray-500 my-3 flex-grow">{opt.description}</p>
                        <button
                            onClick={() => handleGenerate(opt.type as any, opt.statement, opt.requirement)}
                            disabled={!!isLoading}
                            className="w-full mt-auto bg-green-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500/80 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading === opt.type ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            ) : (
                                'Generate Proof'
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {zkProofs.length > 0 && (
                <div>
                    <h4 className="font-title text-lg font-bold text-gray-300 mb-4">My Generated Proofs</h4>
                    <div className="space-y-3">
                        {zkProofs.map(proof => (
                            <div key={proof.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <p className={`font-semibold ${proofTypeDetails[proof.type]?.color || 'text-green-400'}`}>{proofTypeDetails[proof.type]?.title || proof.type}</p>
                                <p className="text-sm text-gray-300 italic my-1">Statement: "{proof.statement}"</p>
                                <p className="text-xs text-gray-500 font-mono break-all">Proof Hash: {proof.proofData}</p>
                                <a href={proof.verificationLink} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline">View on mock verifier</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZKProofPanel;