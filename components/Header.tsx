import React, { useState, useMemo } from 'react';
import Logo from './Logo';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { useDataStore } from '../stores/dataStore';
import { View } from '../types';
import { VIEW_THEMES } from '../constants';

const Header: React.FC = () => {
  const user = useUserStore(state => state.user);
  const walletAddress = useUserStore(state => state.walletAddress);
  const displayName = useUserStore(state => state.displayName);
  const userSignOut = useUserStore(state => state.signOut);
  const level = useUserStore(state => state.level);
  const xp = useUserStore(state => state.xp);
  const myStack = useUserStore(state => state.myStack);
  const isAdmin = useUserStore(state => state.isAdmin);
  const bioTokens = useUserStore(state => state.bioTokens);

  const view = useUIStore(state => state.view);
  const setView = useUIStore(state => state.setView);
  const clearSearch = useUIStore(state => state.clearSearch);
  const openFeedbackModal = useUIStore(state => state.openFeedbackModal);
  const { platformConfig } = useDataStore();
  const openAuthModal = useUIStore(state => state.openAuthModal);

  const handleLogoClick = () => {
    setView('explore');
    clearSearch();
  };
  
  const getGreeting = () => {
    if (displayName) return displayName;
    if (walletAddress) return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    return "Signed In";
  };
  
  const xpPercentage = xp.nextLevel > 0 ? (xp.current / xp.nextLevel) * 100 : 100;

  const navigationOrder: View[] = useMemo(() => {
    const order: View[] = ['explore', 'my-stack-lab'];
    if (platformConfig?.isAiEnabled) {
      order.push('kai');
    }
    order.push('arena');
    if (platformConfig?.isStoreEnabled) {
      order.push('store');
    }
    order.push('settings');
    if (isAdmin) {
      order.push('admin');
    }
    return order;
  }, [isAdmin, platformConfig?.isAiEnabled, platformConfig?.isStoreEnabled]);

  const TabButton: React.FC<{ targetView: View }> = ({ targetView }) => {
    const theme = VIEW_THEMES[targetView];
    const searchResults = useUIStore(state => state.searchResults);
    const isActive = view === targetView && !searchResults;
    const isMyStack = targetView === 'my-stack-lab' && useUIStore.getState().myStackLabSubView === 'stack-x';

    const handleClick = () => {
        // This order is critical. Set the primary view first, then clear secondary state.
        setView(targetView);
        clearSearch();
    };
    
    const activeClasses = `bg-white/10 ${theme.textColor} ${theme.borderColor}`;
    const inactiveClasses = 'text-gray-400 border-transparent hover:bg-white/5';

    return (
      <button 
        onClick={handleClick} 
        className={`font-hud uppercase tracking-wider text-xs font-bold rounded-lg transition-colors relative flex items-center gap-2 px-3 py-1.5 border
          ${isActive ? activeClasses : inactiveClasses}`
        }
        title={theme.name}
        data-view-id={targetView}
      >
        {targetView !== 'explore' && theme.icon}
        {targetView !== 'settings' && <span>{theme.name}</span>}
        {isMyStack && myStack.length > 0 && (
            <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-gray-900
            ${isActive ? `${theme.bgColor} text-black` : 'bg-cyan-400 text-black'}`}>
                {myStack.length}
            </span>
        )}
      </button>
    )
  }

  return (
    <header className="main-header-hud z-50">
      <div className="flex-1 flex justify-start">
        <button onClick={handleLogoClick} className="flex items-center space-x-3 text-left">
          <Logo className="text-gray-200" />
          <h1 className="font-title text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tighter hidden sm:block">
            BiohackStack
          </h1>
        </button>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2">
          {navigationOrder.map(v => <TabButton key={v} targetView={v} />)}
        </div>
      </div>
      
      <div className="flex-1 flex justify-end items-center gap-2">
        <button
          onClick={openFeedbackModal}
          title="Submit Feedback"
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5 3.75A2.75 2.75 0 017.75 1h4.5A2.75 2.75 0 0115 3.75v.443c.57.174 1.096.433 1.567.757a2.75 2.75 0 011.433 2.54V11.5a2.75 2.75 0 01-2.75 2.75h-.443a4.008 4.008 0 00-1.32.339 3.994 3.994 0 00-1.246 1.09.75.75 0 01-1.214 0 3.994 3.994 0 00-1.246-1.09 4.008 4.008 0 00-1.32-.339H5A2.75 2.75 0 012.25 11.5v-4a2.75 2.75 0 011.433-2.54c.47-.324.997-.583 1.567-.757V3.75z" clipRule="evenodd" />
          </svg>
        </button>
        {user && !user.isAnonymous ? (
          <div className="flex items-center gap-4 bg-transparent border border-gray-700 rounded-lg p-2 w-56 md:w-72">
             <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-green-400 truncate">{getGreeting()}</span>
                    <span className="font-mono text-xs text-cyan-300">LVL {level}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5" title={`${xp.current} / ${xp.nextLevel} XP`}>
                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                </div>
            </div>
             <div className="text-right border-l border-gray-700 pl-3">
                <p className="font-mono text-lg font-bold text-green-300">{bioTokens.toLocaleString()}</p>
                <p className="text-xs text-gray-500">$BIO</p>
             </div>
            <button onClick={userSignOut} title="Sign Out" className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" /><path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-1.047a.75.75 0 111.06-1.06l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 11-1.06-1.06L16.296 10.75H6.75A.75.75 0 016 10z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;