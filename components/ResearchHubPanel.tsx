import React, { useState, useMemo } from 'react';
import { useUserStore } from '../stores/userStore';
import { researchStudies } from '../data/researchStudies';
import { ResearchStudy } from '../types';
import toast from 'react-hot-toast';

const ResearchHubPanel: React.FC = () => {
    const generateZKProof = useUserStore(state => state.generateZKProof);
    const diagnosticData = useUserStore(state => state.diagnosticData);
    const journalEntries = useUserStore(state => state.journalEntries);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const eligibleStudies = useMemo(() => {
        return researchStudies.map(study => ({
            ...study,
            isEligible: study.eligibilityCriteria({ diagnosticData, journalEntries })
        }));
    }, [diagnosticData, journalEntries]);

    const handleGenerateProof = async (study: ResearchStudy) => {
        setIsLoading(study.id);
        await generateZKProof('Research Eligibility', study.proofStatement);
        setIsLoading(null);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <div className="flex items-start gap-4 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-cyan-300 flex-shrink-0">
                   <path d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1.586a1.5 1.5 0 01-.44 1.06L9.5 9.585V12.5a.5.5 0 01-1 0V9.585L5.44 6.146A1.5 1.5 0 015 5.086V3.5A1.5 1.5 0 016.5 2H7z" />
                   <path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9z" />
                </svg>
                <div>
                    <h3 className="font-title text-xl font-bold text-cyan-300">Research Hub</h3>
                    <p className="text-gray-400 text-sm max-w-xl">
                        Contribute to cutting-edge science while preserving your privacy. If you are eligible for a study, you can generate a Zero-Knowledge Proof to confirm your eligibility without sharing any of your raw health data.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {eligibleStudies.map(study => (
                    <div key={study.id} className={`p-4 rounded-lg border flex flex-col md:flex-row items-start gap-4 ${study.isEligible ? 'bg-gray-800/50 border-cyan-500/30' : 'bg-gray-800/30 border-gray-700/50 opacity-70'}`}>
                        <div className="flex-grow">
                            <h4 className={`font-semibold ${study.isEligible ? 'text-cyan-300' : 'text-gray-400'}`}>{study.title}</h4>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Sponsored by: {study.sponsor}</p>
                            <p className="text-sm text-gray-400">{study.description}</p>
                        </div>
                        <div className="w-full md:w-auto flex-shrink-0">
                            {study.isEligible ? (
                                <button
                                    onClick={() => handleGenerateProof(study)}
                                    disabled={!!isLoading}
                                    className="w-full bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500/80 transition-colors disabled:bg-gray-600"
                                >
                                    {isLoading === study.id ? 'Generating...' : 'Generate Eligibility Proof'}
                                </button>
                            ) : (
                                <div className="text-xs text-center text-gray-500 p-2 bg-gray-900/40 rounded-md w-full">
                                    You are not currently eligible.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResearchHubPanel;