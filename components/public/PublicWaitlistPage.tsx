import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useDataStore } from '../../stores/dataStore';
import Logo from '../Logo';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const PublicWaitlistPage: React.FC = () => {
    const openAuthModal = useUIStore(state => state.openAuthModal);
    const addToMailingList = useDataStore(state => state.addToMailingList);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [justJoined, setJustJoined] = useState(false);

    const mutation = useMutation({
        mutationFn: (email: string) => addToMailingList(email),
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6 relative font-sans overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" style={{ backgroundImage: `url('/assets/digitaltwin.jpeg')` }} />
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Logo className="text-gray-200 w-8 h-8" />
                    <span className="text-xs uppercase tracking-wider text-gray-500">Early Access</span>
                </div>
                <nav className="flex items-center gap-6 text-sm">
                    <a href="/blog" className="text-gray-400 font-medium hover:text-white transition-colors">Blog</a>
                    <a href="#" className="text-gray-400 font-medium hover:text-white transition-colors">Twitter/X</a>
                    <a href="#" className="text-gray-400 font-medium hover:text-white transition-colors">Discord</a>
                    <button onClick={openAuthModal} className="text-gray-400 font-medium hover:text-white transition-colors">Sign In</button>
                </nav>
            </header>

            <main className="relative z-10 w-full max-w-2xl mt-36 md:mt-28 lg:mt-32">
                <div className="bg-black/60 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center space-x-4 mb-4">
                        <Logo className="text-gray-200 w-10 h-10" showText />
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight gradient-text"></h1>

                           
                        </div>
                    </div>
                     <p className="text-sm text-gray-300">Get early access — limited cohort invitations.</p>
                    <p className="text-gray-400 mt-2">The adaptive performance stack: protocols, AI guidance, and bio-feedback loops unified in one glassy interface.</p>
                    <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row items-center gap-3" noValidate>
                        <label htmlFor="waitlist-email" className="sr-only">Email</label>
                        <input
                            id="waitlist-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@domain.com"
                            required
                            aria-invalid={emailError ? 'true' : 'false'}
                            aria-describedby={emailError ? 'waitlist-email-error' : undefined}
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
                        <p id="waitlist-email-error" className="error-text helper-text mt-1">{emailError}</p>
                    )}
                    {justJoined && !emailError && (
                        <div className="success-banner" role="status" aria-live="polite">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Added to waitlist. Welcome aboard.
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3">We respect your privacy. We only use your email to send critical launch updates. No spam.</p>
                </div>

                <section className="mt-16" aria-label="Platform Pillars">
                    <h3 className="text-sm font-semibold tracking-wider text-cyan-300/80 mb-6">WHY BIOSTACK</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="relative group rounded-xl border border-gray-800/70 bg-gray-900/40 backdrop-blur-sm px-5 py-6 overflow-hidden hover:border-cyan-700/40 transition-colors">
                            <div className="absolute inset-px rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.20), transparent 70%)'}} />
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-transparent flex items-center justify-center text-xl">⚡</div>
                                <h4 className="font-semibold text-gray-100 tracking-tight">Adaptive Protocols</h4>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">Stacks evolve from your inputs, adherence & biometric response windows.</p>
                        </div>
                        <div className="relative group rounded-xl border border-gray-800/70 bg-gray-900/40 backdrop-blur-sm px-5 py-6 overflow-hidden hover:border-cyan-700/40 transition-colors">
                            <div className="absolute inset-px rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.20), transparent 70%)'}} />
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-transparent flex items-center justify-center text-xl">🧠</div>
                                <h4 className="font-semibold text-gray-100 tracking-tight">Contextual AI Coaching</h4>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">Predictive nudges & micro-adjustments keep momentum without overwhelm.</p>
                        </div>
                        <div className="relative group rounded-xl border border-gray-800/70 bg-gray-900/40 backdrop-blur-sm px-5 py-6 overflow-hidden hover:border-cyan-700/40 transition-colors">
                            <div className="absolute inset-px rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.20), transparent 70%)'}} />
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-transparent flex items-center justify-center text-xl">📊</div>
                                <h4 className="font-semibold text-gray-100 tracking-tight">Insight Graph Engine</h4>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">Correlates behaviors & biomarkers to surface asymmetric leverage.</p>
                        </div>
                        <div className="relative group rounded-xl border border-gray-800/70 bg-gray-900/40 backdrop-blur-sm px-5 py-6 overflow-hidden hover:border-cyan-700/40 transition-colors">
                            <div className="absolute inset-px rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.20), transparent 70%)'}} />
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/30 via-cyan-400/20 to-transparent flex items-center justify-center text-xl">🔐</div>
                                <h4 className="font-semibold text-gray-100 tracking-tight">Data Sovereignty</h4>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">Own, export, or revoke. Zero dark patterns. Privacy by architecture.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="absolute bottom-6 text-gray-600 text-xs z-10">
                &copy; {new Date().getFullYear()} Biostack. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicWaitlistPage;