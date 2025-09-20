import { create } from 'zustand';
import { Protocol, ChatMessage, PublicUserProfile, View, KaiSubView, ExploreSubView, UserStack, SearchResponse, MyStackLabSubView, ResearchBounty, CoachingMode, Product, SettingsTab, DigitalTwinForecast, DuelState, ChallengeCard, AdminTab, ArenaSubView, GrowthEngineSubTab, MyStackLabView, UIState } from '../types';
import { log } from './logStore';
import { useDataStore } from './dataStore';
import toast from 'react-hot-toast';
import { useUserStore } from './userStore';
import { tips } from '../data/tips';

const getInitialView = (): View => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const validViews: View[] = ['kai', 'explore', 'my-stack-lab', 'admin', 'settings', 'coaching', 'store', 'arena'];
    return validViews.includes(hash as View) ? (hash as View) : 'explore';
};

export const useUIStore = create<UIState>((set, get) => ({
  isInitializing: true,
  view: getInitialView(),
  kaiSubView: 'today',
  exploreSubView: 'protocols',
  myStackLabSubView: 'stack-x',
  myStackLabView: 'grid',
  settingsTab: 'account',
  adminTab: 'analytics',
  arenaSubView: 'bio-duels',
  growthEngineSubTab: 'dashboard',
  detailedProtocol: null,
  isDetailsFullScreen: false,
  activeCoachingProtocol: null,
  activeCohortId: null,
  activeGuidedProtocol: null,
  activeArGuideProtocol: null,
  coachingMessages: [],
  showOnboarding: false,
  isPublishModalOpen: false,
  forkingStack: null,
  stackCreationContext: null,
  isSubmitModalOpen: false,
  isUpgradeModalOpen: false,
  isAuthModalOpen: false,
  isJournalModalOpen: false,
  isFeedbackModalOpen: false,
  isProductModalOpen: false,
  isArGuideModalOpen: false,
  viewingProduct: null,
  coachingMode: 'text',
  kaiVoiceURI: null,
  isProfileModalOpen: false,
  viewingProfileId: null,
  isWimHofModalOpen: false,
  isMobileMenuOpen: false,
  isBountyModalOpen: false,
  bountyModalMode: 'create',
  activeBounty: null,
  isResolveBountyModalOpen: false,
  resolvingBounty: null,
  activeDuel: null,
  isStakeModalOpen: false,
  stakingOnUser: null,
  // New Search State
  searchQuery: '',
  searchResults: null,
  isSearching: false,
  searchError: null,
  // New Forecast State
  isForecastLoading: false,
  forecastData: null,
  // Walkthrough State
  isWalkthroughActive: false,
  walkthroughStep: 0,
  walkthroughContext: undefined,
  isSandboxMode: false,
  // Tip HUD State
  tipIndex: 0,
  isTipDismissed: false,

  initializeUI: () => {
    const handleHashChange = () => {
        set(state => {
            // Only update hash if not in a coaching session
            if (state.view !== 'coaching') {
                return { view: getInitialView() };
            }
            return {};
        });
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Onboarding logic is now handled in userStore after user is authenticated
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  },
  
  setInitializing: (isInitializing) => set({ isInitializing }),

  setView: (view) => {
    const currentHash = window.location.hash.replace(/^#\/?/, '');
    if (view !== currentHash) {
        window.location.hash = view;
    }
    set({ view, isTipDismissed: false }); // Reset tip dismissal on view change
  },
  
  setKaiSubView: (subView) => set({ kaiSubView: subView }),
  setExploreSubView: (subView) => {
    get().clearSearch();
    set({ exploreSubView: subView });
  },
  setMyStackLabSubView: (subView) => set({ myStackLabSubView: subView }),
  setMyStackLabView: (view) => set({ myStackLabView: view }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setArenaSubView: (subView) => set({ arenaSubView: subView }),
  setGrowthEngineSubTab: (subTab) => set({ growthEngineSubTab: subTab }),

  showDetails: (protocol, isFullScreen = false) => set({ detailedProtocol: protocol, isDetailsFullScreen: isFullScreen }),
  closeDetails: () => set({ detailedProtocol: null }),
  
  startCoachingSession: (protocol) => {
    set({
        activeCoachingProtocol: protocol,
        coachingMessages: [],
        view: 'coaching'
    });
  },
  viewCohortChannel: (cohortId) => {
      set({ activeCohortId: cohortId, view: 'coaching' });
  },
  endCoachingSession: () => {
    const { logCompletedProtocol } = useUserStore.getState();
    const { activeCoachingProtocol } = get();
    if(activeCoachingProtocol) {
        logCompletedProtocol(activeCoachingProtocol.id);
    }
    set({ activeCoachingProtocol: null, activeCohortId: null, view: 'kai' });
  },
  
  startGuidedSession: (protocol) => set({ activeGuidedProtocol: protocol }),
  endGuidedSession: (completed) => {
    const { logCompletedProtocol } = useUserStore.getState();
    const { activeGuidedProtocol } = get();
    if(activeGuidedProtocol && completed) {
        logCompletedProtocol(activeGuidedProtocol.id);
    }
    set({ activeGuidedProtocol: null });
  },

  openArGuideModal: (protocol) => set({ isArGuideModalOpen: true, activeArGuideProtocol: protocol }),
  closeArGuideModal: () => set({ isArGuideModalOpen: false, activeArGuideProtocol: null }),

  addCoachingMessage: (message) => set(state => ({
    coachingMessages: [...state.coachingMessages, { ...message, id: crypto.randomUUID() }]
  })),

  onboardUser: () => {
    set((state): Partial<UIState> => ({ showOnboarding: true, onboardingStep: 0 }));
  },

  nextOnboardingStep: () => {
    set((state) => {
      const current = (state as UIState).onboardingStep ?? 0;
      if (current < 2) {
        return { onboardingStep: current + 1 } as Partial<UIState>;
      }
      return { showOnboarding: false } as Partial<UIState>;
    });
  },

  closeOnboarding: () => set({ showOnboarding: false }),
  openPublishModal: (forkSource, context) => set({ isPublishModalOpen: true, forkingStack: forkSource || null, stackCreationContext: context || null }),
  closePublishModal: () => set({ isPublishModalOpen: false, forkingStack: null, stackCreationContext: null }),
  openSubmitModal: () => set({ isSubmitModalOpen: true }),
  closeSubmitModal: () => set({ isSubmitModalOpen: false }),
  openUpgradeModal: () => set({ isUpgradeModalOpen: true }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openJournalModal: () => set({ isJournalModalOpen: true }),
  closeJournalModal: () => set({ isJournalModalOpen: false }),
  openFeedbackModal: () => set({ isFeedbackModalOpen: true }),
  closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),
  openProductModal: (product) => set({ isProductModalOpen: true, viewingProduct: product }),
  closeProductModal: () => set({ isProductModalOpen: false, viewingProduct: null }),
  setCoachingMode: (mode) => set({ coachingMode: mode }),
  setKaiVoiceURI: (uri) => set({ kaiVoiceURI: uri }),
  openProfileModal: (userId: string) => {
    set({ isProfileModalOpen: true, viewingProfileId: userId });
  },
  closeProfileModal: () => set({ isProfileModalOpen: false, viewingProfileId: null }),
  openWimHofModal: () => set({ isWimHofModalOpen: true }),
  closeWimHofModal: () => set({ isWimHofModalOpen: false }),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openBountyModal: (mode, bounty) => set({ isBountyModalOpen: true, bountyModalMode: mode, activeBounty: bounty || null }),
  closeBountyModal: () => set({ isBountyModalOpen: false }),
  openResolveBountyModal: (bounty) => set({ isResolveBountyModalOpen: true, resolvingBounty: bounty }),
  closeResolveBountyModal: () => set({ isResolveBountyModalOpen: false }),
  
  startDuel: (opponent, hand, stake) => {
    set({ activeDuel: { opponent, hand, stake } });
  },
  
  endDuel: () => {
    const { updatePvpRating } = useUserStore.getState();
    const { activeDuel } = get();
    if (activeDuel?.opponent && 'pvpRating' in activeDuel.opponent) {
      // The logic for determining win/loss is now inside the reducer,
      // so this call needs to happen there. For simplicity, we assume
      // endDuel is called with the outcome.
      // updatePvpRating(victory);
    }
    setTimeout(() => {
        set({ activeDuel: null });
    }, 3000); // Wait 3 seconds to show victory/defeat screen
  },

  openStakeModal: (user) => set({ isStakeModalOpen: true, stakingOnUser: user }),
  closeStakeModal: () => set({ isStakeModalOpen: false, stakingOnUser: null }),
  
  setSearchState: (state) => set(state),
  clearSearch: () => set({ searchQuery: '', searchResults: null, isSearching: false, searchError: null }),

  setForecastState: (state) => set(state),
  clearForecast: () => set({ forecastData: null, isForecastLoading: false }),

  // Walkthrough Actions
  startWalkthrough: (context) => {
    log('INFO', 'Walkthrough started.', { context });
    // Show a lightweight client toast so we can see the walkthrough start in-browser
    try {
      // toast is imported in many stores; import dynamically to avoid SSR issues
      // @ts-ignore
      const rt = require('react-hot-toast');
      if (rt && rt.toast) rt.toast.success('Guided walkthrough starting...');
    } catch (e) {
      // ignore
    }
    // Do NOT force the view here; GuidedWalkthrough will change view per-step.
    set({
        isWalkthroughActive: true,
        walkthroughStep: 0,
        walkthroughContext: context
    });
  },
  nextWalkthroughStep: () => set(state => ({ walkthroughStep: state.walkthroughStep + 1 })),
  endWalkthrough: () => {
      log('INFO', 'Walkthrough ended.');
      set({ isWalkthroughActive: false, walkthroughContext: undefined });
      useUserStore.getState().markWalkthroughAsCompleted();
  },
  enterSandboxMode: () => set({ isSandboxMode: true }),
  exitSandboxMode: () => set({ isSandboxMode: false }),
  
  // Tip HUD Actions
  cycleTip: () => set(state => ({ tipIndex: (state.tipIndex + 1) % tips.length })),
  dismissTip: () => set({ isTipDismissed: true }),
}));