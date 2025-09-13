import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useDataStore } from '../../stores/dataStore';
import Logo from '../Logo';
import { useMutation } from '@tanstack/react-query';

const PublicWaitlistPage: React.FC = () => {
    const openAuthModal = useUIStore(state => state.openAuthModal);
    const addToMailingList = useDataStore(state => state.addToMailingList);
    const [email, setEmail] = useState('');

    const mutation = useMutation({
        mutationFn: (email: string) => addToMailingList(email),
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
                <div className="flex-1"></div>
                <div className="flex-1 flex justify-center items-center gap-6">
                    <a href="#" className="text-gray-400 font-semibold hover:text-white transition-colors text-sm">Blog</a>
                    <a href="#" className="text-gray-400 font-semibold hover:text-white transition-colors text-sm">Twitter/X</a>
                    <a href="#" className="text-gray-400 font-semibold hover:text-white transition-colors text-sm">Discord</a>
                </div>
                <div className="flex-1 text-right">
                     <button onClick={openAuthModal} className="text-gray-400 font-semibold hover:text-white transition-colors text-sm">
                        Sign In
                    </button>
                </div>
            </header>

            <div className="text-center max-w-2xl z-10">
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <Logo className="text-gray-200 w-12 h-12" />
                    <h1 className="font-title text-5xl md:text-6xl font-extrabold text-gray-100 tracking-tighter">
                        BiohackStack
                    </h1>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mt-4">The Operating System for Your Life.</h2>
                <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                    Collect, stack, and deploy biohacking protocols with an AI-powered coach to achieve peak performance. We are preparing for our public launch. Join the waitlist to get early access and be notified.
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

            <footer className="absolute bottom-6 text-gray-600 text-sm z-10">
                &copy; {new Date().getFullYear()} BiohackStack. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicWaitlistPage;