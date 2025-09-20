import React, { useState, useMemo } from 'react';
import { Campaign, Protocol } from '../../types';
import Logo from '../Logo';
import ProtocolCard from '../ProtocolCard';
import { useDataStore } from '../../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

interface CampaignLandingPageProps {
    campaign: Campaign;
}

const CampaignLandingPage: React.FC<CampaignLandingPageProps> = ({ campaign }) => {
    const { protocols, addToMailingList } = useDataStore();
    const { openAuthModal } = useUIStore();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [justJoined, setJustJoined] = useState(false);

    const campaignProtocols = useMemo(() => {
        if (!campaign.protocolIds) return [];
        return campaign.protocolIds.map(id => protocols.find(p => p.id === id)).filter((p): p is Protocol => !!p);
    }, [campaign, protocols]);

    const mutation = useMutation({
        mutationFn: (emailString: string) => addToMailingList(emailString),
        onSuccess: () => {
            setEmail('');
            setEmailError(null);
            setJustJoined(true);
            setTimeout(() => setJustJoined(false), 5000);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        const normalized = (email || '').trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized)) {
            const msg = 'Invalid email format';
            setEmailError(msg);
            toast.error('Please enter a valid email address.');
            return;
        }
        mutation.mutate(normalized);
    };

    const showLogoText = !(campaign.name || '').toLowerCase().startsWith('biostack');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6 relative font-sans">
            <div className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none" style={{ backgroundImage: `url('/assets/vitruvian.png')` }} />

            <main className="relative z-10 w-full max-w-2xl">
                <div className="bg-black/60 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center space-x-4 mb-4">
                        <Logo className="text-gray-200 w-10 h-10" showText={showLogoText} />
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight gradient-text">{campaign.name}</h1>
                            <p className="text-sm text-gray-300">Get early access — limited cohort invitations.</p>
                        </div>
                    </div>

                    <p className="text-gray-400 mt-2">The adaptive performance stack: protocols, AI guidance, and bio-feedback loops unified in one glassy interface.</p>

                    <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row items-center gap-3" noValidate>
                        <label htmlFor="landing-email" className="sr-only">Email</label>
                        <input
                            id="landing-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@domain.com"
                            required
                            aria-invalid={emailError ? 'true' : 'false'}
                            aria-describedby={emailError ? 'email-error' : undefined}
                            className={`w-full flex-grow bg-gray-900/60 border rounded-lg p-3 text-sm text-gray-100 focus:ring-2 focus:ring-cyan-500 transition ${emailError ? 'border-red-500 input-error focus:ring-red-500' : 'border-gray-700 focus:border-cyan-400'}`}
                        />
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className={`w-full sm:w-auto brand-cta py-3 px-6 rounded-lg hover:opacity-95 transition-colors disabled:opacity-60 ${mutation.isPending ? 'loading' : ''}`}
                        >
                            {mutation.isPending ? 'Joining...' : 'Join Waitlist'}
                        </button>
                    </form>
                    {emailError && (
                        <p id="email-error" className="error-text helper-text mt-1">{emailError}</p>
                    )}
                    {justJoined && !emailError && (
                        <div className="success-banner" role="status" aria-live="polite">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Added to waitlist. Welcome aboard.
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">We respect your privacy. We only use your email to send critical launch updates. No spam.</p>
                </div>

                <section className="features-grid" aria-label="Platform Pillars">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h4>Adaptive Protocols</h4>
                        <p>Dynamically tuned stacks that learn from your adherence & biometrics.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🧠</div>
                        <h4>AI Coaching</h4>
                        <p>Guided decision support and contextual micro‑adjustments in real time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h4>Insight Graph</h4>
                        <p>Correlate inputs with outcomes. Surface hidden leverage points.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔐</div>
                        <h4>Data Sovereignty</h4>
                        <p>Own your performance data. Export, revoke, or anonymize anytime.</p>
                    </div>
                </section>

                {campaignProtocols.length > 0 && (
                    <section className="mt-14" aria-label="Featured Protocol Pack">
                        <h3 className="text-lg font-semibold text-cyan-300 mb-4">Featured Protocol Pack</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {campaignProtocols.map(p => <ProtocolCard key={p.id} protocol={p} />)}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default CampaignLandingPage;