import React, { useState, useEffect } from 'react';
import { View } from './types';
import Header from './components/Header';
import ProtocolDetails from './components/ProtocolDetails';
import OnboardingModal from './components/OnboardingModal';
import CoachingView from './components/CoachingView';
import GuidedSession from './components/GuidedSession';
import PublishStackModal from './components/PublishStackModal';
import SubmitProtocolModal from './components/SubmitProtocolModal';
import UpgradeModal from './components/UpgradeModal';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import UserProfileModal from './components/UserProfileModal';
import KaiPanel from './components/KaiPanel';
import ExplorePanel from './components/ExplorePanel';
import MyStackLabPanel from './components/MyStackLabPanel';
import SettingsPanel from './components/SettingsPanel';
import StorePanel from './components/StorePanel';
import ArenaPanel from './components/ArenaPanel';
import { Toaster } from 'react-hot-toast';
import { useDataStore } from './stores/dataStore';
import { useUserStore } from './stores/userStore';
import { useUIStore } from './stores/uiStore';
import WimHofSessionModal from './components/WimHofSessionModal';
import CohortChannel from './components/CohortChannel';
import useIsMobile from './hooks/useIsMobile';
import MobileNavBar from './components/MobileNavBar';
import MobileExploreView from './components/MobileExploreView';
import MobileMenu from './components/MobileMenu';
import BountyModal from './components/BountyModal';
import ResolveBountyModal from './components/ResolveBountyModal';
import FeedbackModal from './components/FeedbackModal';
import PublicWaitlistPage from './components/public/PublicWaitlistPage';
import ProductDetailsModal from './components/ProductDetailsModal';
import DuelView from './components/DuelView';
import CampaignLandingPage from './components/public/CampaignLandingPage';
import { useQuery } from '@tanstack/react-query';
import GuidedWalkthrough from './components/GuidedWalkthrough';
import ArGuideModal from './components/ArGuideModal';
import StakeOnUserModal from './components/StakeOnUserModal';


const App: React.FC = () => {
  const { user } = useUserStore();
  const { platformAnnouncement } = useDataStore();
  const { 
    view, 
    detailedProtocol,
    showOnboarding, isPublishModalOpen, isSubmitModalOpen,
    activeCoachingProtocol, activeCohortId, activeGuidedProtocol, isUpgradeModalOpen, isAuthModalOpen,
    isInitializing, setInitializing, isWimHofModalOpen, isBountyModalOpen, isFeedbackModalOpen,
    isProductModalOpen, isResolveBountyModalOpen, activeDuel, isWalkthroughActive, isArGuideModalOpen,
    isStakeModalOpen,
  } = useUIStore();
  const { walkthroughStep, walkthroughContext } = useUIStore();
  
  const initializeUserSession = useUserStore(state => state.initializeUserSession);
  const { fetchData, campaigns } = useDataStore();
  const initializeUI = useUIStore(state => state.initializeUI);

  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(false);
  const isMobile = useIsMobile();
  
  const { data: campaign } = useQuery({
    queryKey: ['campaigns', window.location.pathname],
    queryFn: () => {
        const path = window.location.pathname;
        if (path.startsWith('/c/')) {
            const slug = path.substring(3);
            return campaigns.find(c => c.slug === slug);
        }
        return null;
    },
    enabled: (!user || user.isAnonymous) && campaigns.length > 0,
  });

  useEffect(() => {
    if (platformAnnouncement?.isActive) {
        setIsAnnouncementVisible(true);
    }
  }, [platformAnnouncement]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
        sessionStorage.setItem('referralCode', refCode);
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
        let isMounted = true;
        setInitializing(true);
        await fetchData();
        const unsubscribe = await initializeUserSession();
        if (isMounted) {
            initializeUI();
            setInitializing(false);
        }
        return () => {
            isMounted = false;
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    };
    initApp();
  }, [fetchData, initializeUserSession, initializeUI, setInitializing]);

  // Dev helper: allow forcing the walkthrough via URL param ?walkthrough=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('walkthrough') === '1') {
        // Delay slightly to let app finish initial route/setup
        setTimeout(() => {
          useUIStore.getState().startWalkthrough({ primaryGoal: 'Improve Focus' });
        }, 600);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  
  const renderContent = () => {
    if (isMobile) {
        switch (view) {
            case 'explore': return <MobileExploreView />;
            case 'kai': return <KaiPanel />;
            case 'my-stack-lab': return <MyStackLabPanel />;
            case 'store': return <StorePanel />;
            case 'arena': return <ArenaPanel />;
            case 'settings': return <SettingsPanel />;
            case 'admin': return <AdminPanel />;
            default: return <MobileExploreView />; // Default to explore on mobile
        }
    }
    
    switch(view) {
        case 'kai':
            return <KaiPanel />;
        case 'explore':
            return <ExplorePanel />;
        case 'my-stack-lab':
            return <MyStackLabPanel />;
        case 'store':
            return <StorePanel />;
        case 'arena':
            return <ArenaPanel />;
        case 'settings':
            return <SettingsPanel />;
        case 'admin':
            return <AdminPanel />;
        default:
            return null;
    }
  }
  
  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <>
        {campaign ? <CampaignLandingPage campaign={campaign} /> : <PublicWaitlistPage />}
        {isAuthModalOpen && <AuthModal />}
        <Toaster />
      </>
    );
  }

  if (view === 'coaching') {
    if (activeCohortId) return <CohortChannel />;
    if (activeCoachingProtocol) return <CoachingView />;
  }

  return (
    <div className="min-h-screen text-gray-200 bg-[#0A0A0A]">
      <div className="starfield-bg"></div>
      <Toaster 
         toastOptions={{
            style: {
                background: '#333',
                color: '#fff',
            },
         }}
      />
      {isWalkthroughActive && (
        <div style={{position: 'fixed', top: 12, right: 12, zIndex: 40000, background: 'rgba(16,20,26,0.9)', color: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', fontSize: 12}}>
          Walkthrough active — step: {walkthroughStep + 1}{' '}
          <div style={{opacity: 0.85, fontSize: 11}}>ctx: {walkthroughContext ? JSON.stringify(walkthroughContext) : 'none'}</div>
        </div>
      )}
      {isWalkthroughActive && <GuidedWalkthrough />}
      {isMobile && <MobileMenu />}

      {/* --- DESKTOP VIEW --- */}
      <div className="desktop-view-container">
        <Header />
         {platformAnnouncement?.isActive && isAnnouncementVisible && (
          <div className="container mx-auto px-4 py-2">
              <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg relative text-sm" role="alert">
                  <strong className="font-bold">Announcement: </strong>
                  <span className="block sm:inline">{platformAnnouncement.message}</span>
                  <button onClick={() => setIsAnnouncementVisible(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                      <svg className="fill-current h-6 w-6 text-yellow-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </button>
              </div>
          </div>
        )}
        <main className="desktop-main container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-8">
          {renderContent()}
        </main>
      </div>
      
      {/* --- MOBILE VIEW --- */}
      <div className="mobile-view-container">
        <main className="mobile-main">
            {renderContent()}
        </main>
        <MobileNavBar />
      </div>

      {/* Global Modals & Components */}
      {detailedProtocol && <ProtocolDetails />}
      {showOnboarding && <OnboardingModal />}
      {isPublishModalOpen && <PublishStackModal />}
      {isSubmitModalOpen && <SubmitProtocolModal />}
      {activeGuidedProtocol && <GuidedSession />}
      {isUpgradeModalOpen && <UpgradeModal />}
      {isAuthModalOpen && <AuthModal />}
      {isWimHofModalOpen && <WimHofSessionModal />}
      {isBountyModalOpen && <BountyModal />}
      {isResolveBountyModalOpen && <ResolveBountyModal />}
      {isFeedbackModalOpen && <FeedbackModal />}
      {isProductModalOpen && <ProductDetailsModal />}
      {activeDuel && <DuelView />}
      {isArGuideModalOpen && <ArGuideModal />}
      {isStakeModalOpen && <StakeOnUserModal />}
      <UserProfileModal />
    </div>
  );
};

export default App;