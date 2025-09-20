import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';

const AuthModal: React.FC = () => {
  const isAuthModalOpen = useUIStore((state) => state.isAuthModalOpen);
  const closeAuthModal = useUIStore((state) => state.closeAuthModal);
  const { signInWithGoogle, signInWithWallet, signInAsSuperUser, signInAsNewUser } = useUserStore();
  const { signInWithGithub } = useUserStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isSimLoading, setIsSimLoading] = useState(false);
  const [isNewUserLoading, setIsNewUserLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signInWithGoogle();
    setIsGoogleLoading(false);
  };

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    await signInWithGithub();
    setIsGithubLoading(false);
  };

  const handleWalletSignIn = async () => {
    setIsWalletLoading(true);
    await signInWithWallet();
    setIsWalletLoading(false);
  };
  
  const handleSimSignIn = async () => {
    setIsSimLoading(true);
    await signInAsSuperUser();
    setIsSimLoading(false);
  };
  
  const handleNewUserSignIn = async () => {
    setIsNewUserLoading(true);
    await signInAsNewUser();
    setIsNewUserLoading(false);
  };
  
  const AuthButton: React.FC<{
    onClick: () => void;
    isLoading: boolean;
    provider: 'Google' | 'Wallet' | 'Dev';
    children: React.ReactNode;
  }> = ({ onClick, isLoading, provider, children }) => (
    <button
      onClick={onClick}
      disabled={isLoading || isWalletLoading || isGoogleLoading || isSimLoading || isNewUserLoading}
      className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed
        ${provider === 'Google' ? 'bg-white text-gray-800 hover:bg-gray-200' 
        : provider === 'Wallet' ? 'bg-purple-600 text-white hover:bg-purple-500' 
        : 'bg-orange-600 text-white hover:bg-orange-500'}`}
    >
      {(isLoading) ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      ) : children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={closeAuthModal}>
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm text-white p-8 relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
            <h2 className="font-title text-3xl font-extrabold text-gray-100 mb-2">Sign In</h2>
            <p className="text-gray-400 mb-8">Choose a method to access your BiohackStack account.</p>
        </div>
        
        <div className="space-y-4">
          <AuthButton onClick={handleGoogleSignIn} isLoading={isGoogleLoading} provider="Google">
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44.5 24c0-1.54-.14-3.04-.4-4.47H24v8.48h11.45c-.5 2.76-2.07 5.1-4.4 6.7v5.5h7.08c4.14-3.82 6.57-9.46 6.57-16.21z" fill="#4285F4"/>
                <path d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.08-5.5c-2.15 1.45-4.92 2.3-8.81 2.3-6.77 0-12.5-4.55-14.56-10.66H1.9v5.68C5.83 41.73 14.13 48 24 48z" fill="#34A853"/>
                <path d="M9.44 28.34c-.38-1.13-.6-2.33-.6-3.59s.22-2.46.6-3.59V15.5H1.9C.66 18.04 0 20.94 0 24s.66 5.96 1.9 8.5l7.54-5.66z" fill="#FBBC05"/>
                <path d="M24 9.8c3.52 0 6.66 1.22 9.15 3.6l6.27-6.26C35.91 2.2 30.5 0 24 0 14.13 0 5.83 6.27 1.9 15.5l7.54 5.66c2.04-6.1 7.79-10.66 14.56-10.66z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </AuthButton>

          <AuthButton onClick={handleGithubSignIn} isLoading={isGithubLoading} provider="Google">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.75.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 012.87-.39c.98.01 1.97.13 2.87.39 2.18-1.5 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.77 1.08.77 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.51 11.51 0 0023.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>
            <span>Continue with GitHub</span>
          </AuthButton>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <AuthButton onClick={handleWalletSignIn} isLoading={isWalletLoading} provider="Wallet">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 3.5A1.5 1.5 0 013.5 2h13A1.5 1.5 0 0118 3.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 16.5v-13z" /><path d="M11.5 11.5a1 1 0 100-2 1 1 0 000 2zM10 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
            <span>Continue with Wallet</span>
          </AuthButton>
          
          <div className="mt-4 pt-4 border-t border-dashed border-gray-700">
            <div className="space-y-2">
                <AuthButton onClick={handleSimSignIn} isLoading={isSimLoading} provider="Dev">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                  <span>Super User (Admin)</span>
                </AuthButton>
                 <AuthButton onClick={handleNewUserSignIn} isLoading={isNewUserLoading} provider="Dev">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.046 15.11a.75.75 0 00-.256.966 8.5 8.5 0 001.354 1.765 8.5 8.5 0 005.856 2.159 8.5 8.5 0 005.856-2.159 8.5 8.5 0 001.354-1.765.75.75 0 00-.256-.966c-1.233-.424-2.693-.66-4.234-.66s-3.001.236-4.234.66zM15.75 8.25a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5z" /></svg>
                  <span>New User (Walkthrough)</span>
                </AuthButton>
            </div>
          </div>
        </div>
        
        <button onClick={closeAuthModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default AuthModal;