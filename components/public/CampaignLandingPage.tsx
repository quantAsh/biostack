import React, { useState, useMemo } from 'react';
import { Campaign, Protocol } from '../../types';
import Logo from '../Logo';
import ProtocolCard from '../ProtocolCard';
import { useDataStore } from '../../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';

interface CampaignLandingPageProps {
    campaign: Campaign;
}

const CampaignLandingPage: React.FC<CampaignLandingPageProps> = ({ campaign }) => {
    const { protocols, addToMailingList } = useDataStore();
    const { openAuthModal } = useUIStore();
    const [email, setEmail] = useState('');

    const campaignProtocols = useMemo(() => {
        if (!campaign.protocolIds) return [];
        return campaign.protocolIds.map(id => protocols.find(p => p.id === id)).filter((p): p is Protocol => !!p);
    }, [campaign, protocols]);

    const mutation = useMutation({
        mutationFn: (emailString: string) => addToMailingList(emailString),
        onSuccess: () => {
            setEmail('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(email);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative font-sans">
            <div className={`starfield-bg active`}></div>
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                 <div className="flex items-center space-x-3">
                    <Logo className="text-gray-200 w-8 h-8" />
                    <h1 className="font-title text-2xl font-extrabold text-gray-100 tracking-tighter hidden sm:block">
                        BiohackStack
                    </h1>
                </div>
                <div className="flex-1 text-right">
                     <button onClick={openAuthModal} className="text-gray-400 font-semibold hover:text-white transition-colors text-sm">
                        Sign In
                    </button>
                </div>
            </header>

            <div className="text-center max-w-2xl z-10 pt-20 pb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mt-4">{campaign.name}</h2>
                <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                    A special promotion from BiohackStack. Join the waitlist to get early access and be notified.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full sm:w-auto bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-colors disabled:bg-gray-600"
                    >
                        {mutation.isPending ? 'Joining...' : 'Join Waitlist'}
                    </button>
                </form>
            </div>
            
            {campaignProtocols.length > 0 && (
                <div className="mt-4 mb-20 w-full max-w-5xl z-10">
                    <h3 className="text-center font-title text-2xl font-bold text-cyan-300 mb-6">Featured Protocol Pack</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaignProtocols.map(p => <ProtocolCard key={p.id} protocol={p} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignLandingPage;