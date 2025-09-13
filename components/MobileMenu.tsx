import React from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import Logo from './Logo';

const MobileMenu: React.FC = () => {
    const { isMobileMenuOpen, closeMobileMenu, openAuthModal, openFeedbackModal } = useUIStore();
    const { user, displayName, signOut, level, xp, walletAddress } = useUserStore();
    
    const handleSignIn = () => {
        closeMobileMenu();
        openAuthModal();
    };
    
    const handleSignOut = () => {
        closeMobileMenu();
        signOut();
    };

    const handleFeedbackClick = () => {
        closeMobileMenu();
        openFeedbackModal();
    };

    const xpPercentage = xp.nextLevel > 0 ? (xp.current / xp.nextLevel) * 100 : 0;

    return (
        <>
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
            <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="flex items-center space-x-3 mb-8">
                    <Logo className="text-gray-200" />
                    <h1 className="font-title text-2xl font-extrabold text-gray-100 tracking-tighter">
                      BiohackStack
                    </h1>
                </div>
                
                <div className="flex-grow space-y-2">
                    <button onClick={handleFeedbackClick} className="w-full flex items-center gap-3 text-left text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M5 3.75A2.75 2.75 0 017.75 1h4.5A2.75 2.75 0 0115 3.75v.443c.57.174 1.096.433 1.567.757a2.75 2.75 0 011.433 2.54V11.5a2.75 2.75 0 01-2.75 2.75h-.443a4.008 4.008 0 00-1.32.339 3.994 3.994 0 00-1.246 1.09.75.75 0 01-1.214 0 3.994 3.994 0 00-1.246-1.09 4.008 4.008 0 00-1.32-.339H5A2.75 2.75 0 012.25 11.5v-4a2.75 2.75 0 011.433-2.54c.47-.324.997-.583 1.567-.757V3.75z" clipRule="evenodd" />
                        </svg>
                        <span>Submit Feedback</span>
                    </button>
                </div>
                
                <div className="mt-auto">
                    {user && !user.isAnonymous ? (
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-lg text-green-400 truncate">{displayName || `${walletAddress?.slice(0, 6)}...`}</p>
                                <p className="font-mono text-xs text-cyan-300">LVL {level}</p>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2" title={`${xp.current} / ${xp.nextLevel} XP`}>
                                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                                </div>
                            </div>
                            <button onClick={handleSignOut} className="w-full text-left text-gray-300 hover:text-red-400 p-2 rounded-md hover:bg-gray-800 transition-colors">Sign Out</button>
                        </div>
                    ) : (
                        <button onClick={handleSignIn} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-500">
                            Sign In / Register
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
export default MobileMenu;