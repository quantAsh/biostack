import { create } from 'zustand';
import { Protocol, Wearable, JournalEntry, CalendarEvent, MintStatus, ZKProof, AuditEvent, DiagnosticDataPoint, DiagnosticMetric, DiagnosticStatus, UserXP, Badge, MysteryCache, SealedDataVault, DecentralizedIdentifier, VerifiableCredential, ArchivedSnapshot, PlatformAnnouncement, MyStackContent, UserStack, CommunityStack, PersistedUserStack, Journey, CryptoTransaction, ProactiveKaiSuggestion, Category, JourneyProgress, GpsLog, Product, SleepData, DayData, ProtocolMastery, SavedReport, Quest } from '../types';
import { useUIStore } from './uiStore';
import { auth, db, isFirebaseEnabled } from '../services/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useDataStore } from './dataStore';
import { diagnosticModules } from '../data/diagnostics';
import { ethers } from "ethers";
import toast from 'react-hot-toast';
import { XP_VALUES, LEVEL_THRESHOLDS, getLevelFromXp } from '../constants';
import { log } from './logStore';
import { ceramicService } from '../services/ceramicService';
import { audioService } from '../services/audioService';
import { getSimulatedPhotoOfTheDay } from '../data/assets';
import { getDraftJournalFromDayData } from '../services/geminiService';

// Session persistence key and helpers — lightweight storage for session metadata
const SESSION_STORAGE_KEY = 'biostack_session_v1';

function saveSessionToStorage(user: { uid: string; displayName?: string | null; isAnonymous?: boolean } | null) {
    try {
        if (typeof window === 'undefined' || !window?.localStorage) return;
        if (!user) {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }
        const payload = { uid: user.uid, displayName: user.displayName || null, isAnonymous: !!user.isAnonymous, ts: Date.now() };
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        // ignore storage errors
    }
}

function loadSessionFromStorage(): { uid: string; displayName?: string | null; isAnonymous?: boolean; isAdmin?: boolean } | null {
    try {
        if (typeof window === 'undefined' || !window?.localStorage) return null;
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function clearSessionFromStorage() {
    try { if (typeof window !== 'undefined' && window?.localStorage) window.localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}
}

interface UserState {
  user: firebase.User | null;
  displayName: string | null;
  isAdmin: boolean;
  totalXp: number;
  myStackContent: MyStackContent;
  myStack: (Protocol | UserStack)[];
  journalEntries: JournalEntry[];
  auditTrail: AuditEvent[];
  sealedDataVaults: SealedDataVault[];
  connectedWearables: Wearable[];
  userGoals: string[];
  isCalendarConnected: boolean;
  calendarEvents: CalendarEvent[]; // Mock data
  gpsLog: GpsLog[]; // Mock data for Zero-Input Logging
  isPremium: boolean;
  walletAddress: string | null;
  mintedProtocols: Record<string, MintStatus>;
  unlockedPromoCards: string[];
  upvotedStackIds: string[];
  zkProofs: ZKProof[];
  isDataProcessingAllowed: boolean;
  activeDiagnosticModules: string[];
  diagnosticData: DiagnosticDataPoint[];
  sharedProtocolCount: number;
  platformAnnouncement: PlatformAnnouncement | null;
  activeFast: { protocolId: string; startTime: number } | null;
  activePacer: { protocol: Protocol } | null;
  activePlayer: { protocol: Protocol; playingFrequency: number | null } | null;
  wimHofSessionState: 'inactive' | 'breathing' | 'cold';
  protocolTimeOverrides: Record<string, string>;
  // Gamification State
  level: number;
  xp: UserXP;
  badges: Badge[];
  dailyStreak: number;
  lastLoginDate: string | null;
  mysteryCaches: MysteryCache[];
  protocolMastery: Record<string, ProtocolMastery>;
  // Phase 2 State
  did: DecentralizedIdentifier | null;
  verifiableCredentials: VerifiableCredential[];
  ceramicStreamId: string | null;
  // Phase 3 State
  archivedSnapshots: ArchivedSnapshot[];
  // Wallet & NFT State
  bioTokens: number;
  cryptoTransactions: CryptoTransaction[];
  ownedNftProtocolIds: string[];
  enrolledJourneyIds: string[];
  journeyProgress: Record<string, JourneyProgress>;
  // Ambient KaiOS
  kaiSuggestions: ProactiveKaiSuggestion[];
  lastNightSleep: SleepData | null;
  draftedJournalEntry: Partial<JournalEntry> | null;
  // Report History
  savedReports: SavedReport[];
  // PvP State
  pvpDeck: string[];
  pvpRank: string;
  pvpRating: number;
  pvpWins: number;
  pvpLosses: number;
  streakCatalyst?: number | null;
  // Gamification 2.0
  activeQuests: Quest[];
  completedQuests: string[];
  enrolledTournamentIds: string[];
  // Walkthrough
  hasCompletedWalkthrough: boolean;
  // Autonomous Features
  isAgentModeEnabled: boolean;
  isLivingStackEnabled: boolean;
  isAmbientJournalingEnabled: boolean;
  // Functions
  initializeUserSession: () => Promise<() => void>;
  signInWithWallet: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
  signInAsSuperUser: () => Promise<void>;
  signInAsNewUser: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleStack: (protocol: Protocol) => Promise<void>;
  addProtocolsToStack: (protocols: Protocol[]) => Promise<void>;
  cloneStack: (stack: CommunityStack) => Promise<void>;
  removeMyStackItem: (itemId: string) => Promise<void>;
  updateClonedStack: (updatedStack: UserStack) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'date' | 'completedProtocols' | 'id' | 'user_id'>) => Promise<void>;
  logCompletedProtocol: (protocolId: string) => Promise<void>;
  addAuditEvent: (event: Omit<AuditEvent, 'id' | 'user_id' | 'timestamp'>) => Promise<void>;
  toggleWearable: (wearable: Wearable) => Promise<void>;
  setUserGoals: (goals: string[]) => Promise<void>;
  toggleCalendar: () => void; // This can remain local
  mintHeroCard: (protocol: Protocol) => Promise<void>;
  setMintStatus: (protocolId: string, status?: MintStatus) => void;
  redeemPromoCode: (code: string) => Promise<void>;
  toggleUpvoteStack: (stackId: string) => Promise<void>;
  toggleDataProcessing: () => Promise<void>;
  generateZKProof: (type: ZKProof['type'], statement: string) => Promise<void>;
  toggleDiagnosticModule: (moduleId: string) => Promise<void>;
  simulateDiagnosticData: () => void;
  addXP: (amount: number, eventName: string) => Promise<void>;
  openMysteryCache: (cacheId: string) => Promise<void>;
  sealDataVault: (params: { year: number, month: number }) => Promise<void>;
  startFast: (protocolId: string) => void;
  endFast: () => void;
  startPacer: (protocol: Protocol) => void;
  stopPacer: () => void;
  startPlayer: (protocol: Protocol) => void;
  setPlayerFrequency: (frequency: number | null) => void;
  stopPlayer: () => void;
  setWimHofSessionState: (state: 'inactive' | 'breathing' | 'cold') => void;
  setProtocolTimeOverride: (protocolId: string, time: string) => Promise<void>;
  // Phase 2 Functions
  createDID: () => Promise<void>;
  claimKaiPlusVC: () => Promise<void>;
  // Phase 3 Functions
  archiveBaselineSnapshot: () => Promise<void>;
  // Wallet Functions
  earnBioTokens: (amount: number, description: string) => Promise<void>;
  spendBioTokens: (amount: number, description: string) => Promise<void>;
  purchaseProductWithBio: (product: Product) => Promise<void>;
  startJourney: (journey: Journey) => Promise<void>;
  enrollInJourney: (journey: Journey) => Promise<void>;
  advanceJourneyDay: (journeyId: string) => Promise<void>;
  // Ambient KaiOS Functions
  generateProactiveSuggestions: () => void;
  dismissSuggestion: (suggestionId: string) => void;
  ingestSimulatedBloodwork: () => void;
  proactivelyDraftJournal: () => void;
  clearDraftedJournal: () => void;
  // Report History Functions
  saveReport: (report: Omit<SavedReport, 'id' | 'timestamp'>) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  // PvP Functions
  setPvpDeck: (deck: string[]) => Promise<void>;
  updatePvpRating: (didWin: boolean) => Promise<void>;
  // NFT Functions
  forgeNftProtocol: (baseProtocol: Protocol, nftData: { name: string; description: string; gameStats: { attack: number; defense: number }; imageUrl: string; }) => Promise<void>;
  // Gamification 2.0
  acceptQuest: (quest: Quest) => void;
  completeQuest: (questId: string) => void;
  enrollInTournament: (tournamentId: string) => void;
  // Walkthrough
  markWalkthroughAsCompleted: () => Promise<void>;
  // Autonomous Features
  toggleAgentMode: () => Promise<void>;
  toggleLivingStack: () => Promise<void>;
  toggleAmbientJournaling: () => Promise<void>;
}

const mockCalendarEvents: CalendarEvent[] = [
    { day: 'Monday', time: '09:00', title: 'Team Sync Meeting' },
    { day: 'Monday', time: '14:00', title: 'Project Brainstorm' },
    { day: 'Wednesday', time: '11:00', title: 'Dentist Appointment' },
    { day: 'Thursday', time: '10:00', title: 'Quarterly Review', type: 'high-stakes' },
    { day: 'Friday', time: '16:00', title: 'Project Deadline', type: 'deadline' },
];

const mockGpsLog: GpsLog[] = [
    { location: 'Park', activity: 'Run', distance: '3.2 miles' }
];

const mockSleepData: SleepData = { 
    score: 68, 
    readiness: 65, 
    hrv: 35, 
    summary: "Poor sleep quality with lower than average HRV." 
};

const generateRandomValue = (metric: DiagnosticMetric): number => {
    const { optimalRange, borderlineHighRange, borderlineLowRange } = metric;
    const rand = Math.random();
    let min, max;
    if (rand < 0.7) { [min, max] = optimalRange; } 
    else if (rand < 0.85) { [min, max] = (borderlineHighRange && Math.random() < 0.5 ? borderlineHighRange : borderlineLowRange) || optimalRange; } 
    else { [min, max] = borderlineHighRange ? [borderlineHighRange[1], borderlineHighRange[1] * 1.2] : borderlineLowRange ? [borderlineLowRange[0] * 0.8, borderlineLowRange[0]] : optimalRange; }
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(metric.unit === '%' ? 1 : 2));
};

const getStatus = (value: number, metric: DiagnosticMetric): DiagnosticStatus => {
    const { optimalRange, borderlineHighRange, borderlineLowRange } = metric;
    if (value >= optimalRange[0] && value <= optimalRange[1]) return 'optimal';
    if (borderlineHighRange && value > borderlineHighRange[0] && value <= borderlineHighRange[1]) return 'borderline';
    if (borderlineLowRange && value < borderlineLowRange[1] && value >= borderlineLowRange[0]) return 'borderline';
    if (borderlineHighRange && value > borderlineHighRange[1]) return 'high';
    if (borderlineLowRange && value < borderlineLowRange[0]) return 'low';
    return 'optimal';
};

const mockSuperUserJournal: JournalEntry[] = [
  { id: 'dev-j1', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], mood: 4, energy: 4, focus: 5, completedProtocols: ['1', '22'], notes: "Felt very sharp today after fasting and sunlight." },
  { id: 'dev-j2', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], mood: 3, energy: 5, focus: 4, completedProtocols: ['23', '14'], notes: "Tough workout but feel great. WHM is intense." },
  { id: 'dev-j3', date: new Date().toISOString().split('T')[0], mood: 5, energy: 4, focus: 4, completedProtocols: ['10', '3'], notes: "Sauna was very relaxing. Ready for the day." }
];

const defaultXPState: UserXP = { current: 0, nextLevel: LEVEL_THRESHOLDS[1] };

const hydrateMyStack = (content: MyStackContent): (Protocol | UserStack)[] => {
    const allProtocols = useDataStore.getState().protocols;
    if (!content) return [];
    return content.map(item => {
        if (typeof item === 'string') {
            return allProtocols.find(p => p.id === item);
        } else {
            return { ...item, type: 'stack' as const };
        }
    }).filter((p): p is Protocol | UserStack => !!p);
};

const generateMockDiagnosticData = (): { activeModules: string[], data: DiagnosticDataPoint[] } => {
    const activeModules = ['blood_panel', 'cgm'];
    const activeMetrics = diagnosticModules
        .filter(m => activeModules.includes(m.id))
        .flatMap(m => m.metrics);

    const data: DiagnosticDataPoint[] = activeMetrics.map(metric => {
        const value = generateRandomValue(metric);
        return {
            metricName: metric.name,
            value,
            unit: metric.unit,
            status: getStatus(value, metric),
            timestamp: new Date().toISOString(),
            domain: metric.domain,
        };
    });
    return { activeModules, data };
};

export const getInitialUserState = () => ({
    user: null,
    displayName: null,
    isAdmin: false,
    totalXp: 0,
    myStackContent: [],
    myStack: [],
    journalEntries: [],
    auditTrail: [],
    sealedDataVaults: [],
    connectedWearables: [],
    userGoals: [],
    isCalendarConnected: false,
    isPremium: false,
    walletAddress: null,
    mintedProtocols: {},
    unlockedPromoCards: [],
    upvotedStackIds: [],
    zkProofs: [],
    isDataProcessingAllowed: true,
    activeDiagnosticModules: [],
    diagnosticData: [],
    sharedProtocolCount: 0,
    platformAnnouncement: null,
    activeFast: null,
    activePacer: null,
    activePlayer: null,
    wimHofSessionState: 'inactive' as const,
    protocolTimeOverrides: {},
    level: 1,
    xp: defaultXPState,
    badges: [],
    dailyStreak: 0,
    lastLoginDate: null,
    mysteryCaches: [],
    protocolMastery: {},
    did: null,
    verifiableCredentials: [],
    ceramicStreamId: null,
    archivedSnapshots: [],
    bioTokens: 0,
    cryptoTransactions: [],
    ownedNftProtocolIds: [],
    enrolledJourneyIds: [],
    journeyProgress: {},
    kaiSuggestions: [],
    lastNightSleep: null,
    draftedJournalEntry: null,
    savedReports: [],
    pvpDeck: [],
    pvpRank: 'Unranked',
    pvpRating: 1000,
    pvpWins: 0,
    pvpLosses: 0,
    streakCatalyst: null,
    activeQuests: [],
    completedQuests: [],
    enrolledTournamentIds: [],
    hasCompletedWalkthrough: false,
    isAgentModeEnabled: false,
    isLivingStackEnabled: false,
    isAmbientJournalingEnabled: false,
});


export const useUserStore = create<UserState>((set, get) => ({
    ...getInitialUserState(),
    calendarEvents: mockCalendarEvents,
    gpsLog: mockGpsLog,

    initializeUserSession: async () => {
        log('INFO', 'initializeUserSession: Starting session initialization.');
        // Try to rehydrate minimal session metadata from localStorage (dev convenience)
            try {
                const stored = loadSessionFromStorage();
                if (stored && !get().user) {
                    // set a lightweight placeholder until Firebase auth state resolves
                    const adminFlag = (stored as any).isAdmin === true;
                    // Create a minimal fake user object for dev/e2e runs so the app behaves as "signed in".
                    const fakeUser = { uid: stored.uid, isAnonymous: !!stored.isAnonymous, displayName: stored.displayName || null } as any as firebase.User;
                    set({ user: fakeUser, displayName: stored.displayName || null, isAdmin: adminFlag });
                    log('DEBUG', 'initializeUserSession: Rehydrated session metadata from storage.', { uid: stored.uid, isAdmin: adminFlag });
                }
            } catch (e) {
                // ignore
            }
        if (!isFirebaseEnabled) {
            const { activeModules, data } = generateMockDiagnosticData();
            set({ activeDiagnosticModules: activeModules, diagnosticData: data });
            useUIStore.getState().setInitializing(false);
            log('WARN', 'initializeUserSession: Firebase not configured. App is in offline mode with mock diagnostics.');
            return () => {};
        }

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                log('INFO', 'Auth state changed: User found.', { uid: user.uid, isAnonymous: user.isAnonymous });
                set({ user, displayName: user.displayName });
                const userRef = db.collection('profiles').doc(user.uid);
                const userSnap = await userRef.get();
                
                if (userSnap.exists) {
                    log('DEBUG', 'User profile found in Firestore.', { uid: user.uid });
                    const data = userSnap.data();
                    if (!data) return;

                    if (data.is_banned) {
                        log('WARN', 'Banned user attempted to sign in.', { uid: user.uid });
                        toast.error("This account has been suspended.");
                        await auth.signOut();
                        return;
                    }
                    
                    let streamId = data.ceramic_stream_id;
                    let myStackContent: MyStackContent = [];
                    if (streamId) {
                        log('DEBUG', 'User has a Ceramic Stream ID. Hydrating from Ceramic.', { streamId });
                        const streamData = await ceramicService.readStream(streamId, {
                            myStackContent: data.my_stack_content || data.stack?.map((id:string) => id) || [], // Backwards compatibility
                            userGoals: data.goals,
                            savedReports: data.saved_reports || [],
                        });

                        myStackContent = streamData.myStackContent;
                        set({
                            myStackContent: streamData.myStackContent,
                            journalEntries: streamData.journalEntries,
                            userGoals: streamData.userGoals,
                            verifiableCredentials: streamData.verifiableCredentials,
                            savedReports: streamData.savedReports || [],
                        });
                        log('SUCCESS', 'User sovereign data hydrated from Ceramic stream.', { streamId, entryCount: streamData.journalEntries.length });
                    } else {
                        myStackContent = data.my_stack_content || data.stack?.map((id:string) => id) || []; // Backwards compatibility for old `stack`
                        const newStream = await ceramicService.createStream({
                            myStackContent: myStackContent,
                            journalEntries: [],
                            userGoals: data.goals || [],
                            verifiableCredentials: [],
                            savedReports: [],
                        });
                        streamId = newStream.id;
                        await userRef.update({ ceramic_stream_id: streamId, my_stack_content: myStackContent });
                        log('INFO', 'Created new Ceramic stream for user.', { streamId });
                        set({ ceramicStreamId: streamId, myStackContent, journalEntries: [], userGoals: data.goals || [], savedReports: [] });
                    }

                    const auditQuery = db.collection('audit_trail').where("user_id", "==", user.uid).orderBy('timestamp', 'desc');
                    const vaultsQuery = db.collection(`profiles/${user.uid}/sealed_vaults`).orderBy('timestamp', 'desc');
                    const archivesQuery = db.collection(`profiles/${user.uid}/archived_snapshots`).orderBy('timestamp', 'desc');

                    const [auditSnap, vaultsSnap, archivesSnap] = await Promise.all([auditQuery.get(), vaultsQuery.get(), archivesQuery.get()]);
                    const auditTrail = auditSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AuditEvent[];
                    const sealedDataVaults = vaultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SealedDataVault[];
                    const archivedSnapshots = archivesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ArchivedSnapshot[];
                    
                    const totalXp = data.total_xp || 0;
                    const level = getLevelFromXp(totalXp);
                    const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
                    const nextLevelXp = LEVEL_THRESHOLDS[level] || currentLevelXp;
                    const xp: UserXP = { current: totalXp - currentLevelXp, nextLevel: nextLevelXp - currentLevelXp };
                    
                    const today = new Date().toISOString().split('T')[0];
                    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                    const lastLogin = data.last_login_date;
                    let dailyStreak = data.daily_streak || 0;
                    if (lastLogin !== today && lastLogin === yesterday) {
                        dailyStreak++;
                    } else if (lastLogin !== today) {
                        dailyStreak = 1;
                    }
                    await userRef.update({ last_login_date: today, daily_streak: dailyStreak });
                    
                    const an = useDataStore.getState().platformAnnouncement;
                    if (an?.isActive) { set({ platformAnnouncement: an }) }

                    set({
                        displayName: data.displayName || user.displayName,
                        isAdmin: !!data.is_admin,
                        totalXp: totalXp,
                        myStackContent,
                        myStack: hydrateMyStack(myStackContent),
                        userGoals: data.goals || [],
                        connectedWearables: data.wearables || [],
                        isPremium: !!data.is_premium,
                        walletAddress: data.walletAddress || null,
                        mintedProtocols: data.minted_protocols || {},
                        unlockedPromoCards: data.unlocked_promo_cards || [],
                        upvotedStackIds: data.upvoted_stack_ids || [],
                        isDataProcessingAllowed: data.is_data_processing_allowed !== false,
                        activeDiagnosticModules: data.active_diagnostic_modules || [],
                        sharedProtocolCount: data.shared_protocol_count || 0,
                        protocolTimeOverrides: data.protocol_time_overrides || {},
                        auditTrail,
                        level,
                        xp,
                        dailyStreak,
                        lastLoginDate: today,
                        protocolMastery: data.protocol_mastery || {},
                        did: data.did || null,
                        verifiableCredentials: data.verifiable_credentials || [],
                        ceramicStreamId: streamId,
                        sealedDataVaults,
                        archivedSnapshots,
                        bioTokens: data.bio_tokens || 0,
                        cryptoTransactions: data.crypto_transactions || [],
                        ownedNftProtocolIds: data.owned_nft_protocol_ids || [],
                        enrolledJourneyIds: data.enrolled_journey_ids || [],
                        journeyProgress: data.journey_progress || {},
                        kaiSuggestions: [],
                        lastNightSleep: mockSleepData, // For demo purposes
                        pvpDeck: data.pvp_deck || [],
                        pvpRank: data.pvp_rank || 'Unranked',
                        pvpRating: data.pvp_rating || 1000,
                        pvpWins: data.pvp_wins || 0,
                        pvpLosses: data.pvp_losses || 0,
                        streakCatalyst: data.streak_catalyst || null,
                        activeQuests: data.active_quests || [],
                        completedQuests: data.completed_quests || [],
                        enrolledTournamentIds: data.enrolled_tournament_ids || [],
                        hasCompletedWalkthrough: !!data.has_completed_walkthrough,
                        isAgentModeEnabled: !!data.is_agent_mode_enabled,
                        isLivingStackEnabled: !!data.is_living_stack_enabled,
                        isAmbientJournalingEnabled: !!data.is_ambient_journaling_enabled,
                    });
                    
                    get().simulateDiagnosticData();
                    get().generateProactiveSuggestions();
                    get().proactivelyDraftJournal();

                    if (data.goals === undefined && !user.isAnonymous) {
                        useUIStore.setState({ showOnboarding: true });
                    }
                    
                    const platformConfig = useDataStore.getState().platformConfig;
                    if (platformConfig?.isGuidedWalkthroughEnabled && !data.has_completed_walkthrough && !user.isAnonymous) {
                        // Use the user's saved primary goal if available to seed the walkthrough
                        const primaryGoal = (data.goals && data.goals.length > 0) ? data.goals[0] : 'Improve Focus';
                        console.info('[userStore] auto-start walkthrough with primaryGoal=', primaryGoal);
                        useUIStore.getState().startWalkthrough({ primaryGoal });
                    }

                } else if (!user.isAnonymous) {
                    log('DEBUG', 'User profile not found. Creating new profile.', { uid: user.uid });
                    const referralCode = sessionStorage.getItem('referralCode');

                    const newProfileData = {
                        displayName: user.displayName,
                        email: user.email,
                        created_at: firebase.firestore.FieldValue.serverTimestamp(),
                        total_xp: 0,
                        referredBy: referralCode || null,
                        referralCount: 0,
                        is_admin: false,
                        is_premium: false,
                        has_completed_walkthrough: false,
                    };
                    await userRef.set(newProfileData);

                    if (referralCode) {
                        useDataStore.getState().processReferral(referralCode);
                        sessionStorage.removeItem('referralCode');
                    }

                    useUIStore.setState({ showOnboarding: true });
                }
            } else {
                log('INFO', 'Auth state changed: No user found. Setting anonymous state.');
                set(getInitialUserState());
                if (sessionStorage.getItem('onboardingComplete') !== 'true') {
                    useUIStore.setState({ showOnboarding: true });
                }
            }
            useUIStore.getState().setInitializing(false);
        });

        return unsubscribe;
    },

    signInWithWallet: async () => {
        if (!isFirebaseEnabled) {
            toast.error("Wallet sign-in is disabled in offline mode.");
            return;
        }
        log('INFO', 'signInWithWallet: Attempting wallet sign-in.');
        try {
            // @ts-ignore
            if (!window.ethereum) {
                toast.error("MetaMask is not installed. Please install it to use this feature.");
                return;
            }
            // @ts-ignore
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            // This is a simplified flow for a demo.
            if (!auth.currentUser || auth.currentUser.isAnonymous) {
                if (!auth.currentUser) await auth.signInAnonymously();
                const user = auth.currentUser;
                if (user) {
                    const userRef = db.collection('profiles').doc(user.uid);
                    await userRef.set({
                        walletAddress: address,
                        displayName: `${address.slice(0, 6)}...${address.slice(-4)}`
                    }, { merge: true });
                }
            } else {
                const user = auth.currentUser;
                const userRef = db.collection('profiles').doc(user.uid);
                await userRef.update({ walletAddress: address });
                set({ walletAddress: address });
            }
            
            useUIStore.getState().closeAuthModal();
            log('SUCCESS', 'signInWithWallet: Wallet sign-in successful.', { address });

        } catch (error) {
            log('ERROR', 'signInWithWallet: Wallet sign-in failed.', { error });
            console.error("Error signing in with wallet:", error);
            toast.error(error instanceof Error ? error.message : "Failed to sign in with wallet.");
        }
    },
    
    signInWithGoogle: async () => {
        if (!isFirebaseEnabled) {
            toast.error("Google sign-in is disabled in offline mode.");
            return;
        }
        log('INFO', 'signInWithGoogle: Attempting Google sign-in.');
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            useUIStore.getState().closeAuthModal();
            // persist minimal session metadata for development and quick rehydration
            const current = auth.currentUser;
            saveSessionToStorage(current ? { uid: current.uid, displayName: current.displayName || null, isAnonymous: current.isAnonymous } : null);
            log('SUCCESS', 'signInWithGoogle: Google sign-in successful.');
        } catch (error) {
            log('ERROR', 'signInWithGoogle: Google sign-in failed.', { error });
            console.error("Error signing in with Google:", error);
            toast.error("Failed to sign in with Google.");
        }
    },

    signInWithGithub: async () => {
        if (!isFirebaseEnabled) {
            toast.error("GitHub sign-in is disabled in offline mode.");
            return;
        }
        log('INFO', 'signInWithGithub: Attempting GitHub sign-in.');
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            await auth.signInWithPopup(provider);
            const current = auth.currentUser;
            saveSessionToStorage(current ? { uid: current.uid, displayName: current.displayName || null, isAnonymous: current.isAnonymous } : null);
            useUIStore.getState().closeAuthModal();
            log('SUCCESS', 'signInWithGithub: GitHub sign-in successful.');
        } catch (error) {
            log('ERROR', 'signInWithGithub: GitHub sign-in failed.', { error });
            console.error("Error signing in with GitHub:", error);
            toast.error("Failed to sign in with GitHub.");
        }
    },

    signInAsSuperUser: async () => {
        if (!isFirebaseEnabled) {
            toast.success("Signed in as Super User (Simulated)");
            const { activeModules, data } = generateMockDiagnosticData();
            const myStackContent: MyStackContent = ['1', '22', '23', '10', '3'];
            const myStack = hydrateMyStack(myStackContent);
            const totalXp = 11000;
            const level = getLevelFromXp(totalXp);
            const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
            const nextLevelXp = LEVEL_THRESHOLDS[level] || currentLevelXp;

            set({
                user: { uid: 'dev-super-user', isAnonymous: false, displayName: "Super User" } as firebase.User,
                displayName: "Super User (Admin)",
                isAdmin: true,
                isPremium: true,
                totalXp: totalXp,
                myStackContent,
                myStack,
                journalEntries: mockSuperUserJournal,
                userGoals: ['Promote Longevity', 'Boost Energy'],
                connectedWearables: [Wearable.Oura, Wearable.Garmin],
                activeDiagnosticModules: activeModules,
                diagnosticData: data,
                walletAddress: '0x1234567890123456789012345678901234567890',
                bioTokens: 10000,
                level: level,
                xp: { current: totalXp - currentLevelXp, nextLevel: nextLevelXp - currentLevelXp },
                // FIX: Added missing masteryPoints property to align with ProtocolMastery type.
                protocolMastery: {
                    '1': { protocolId: '1', level: 'Adept', streak: 12, xp: 250, masteryPoints: 250 },
                    '3': { protocolId: '3', level: 'Expert', streak: 35, xp: 800, masteryPoints: 800 },
                    '10': { protocolId: '10', level: 'Novice', streak: 3, xp: 45, masteryPoints: 45 },
                    '22': { protocolId: '22', level: 'Novice', streak: 2, xp: 30, masteryPoints: 30 },
                    '23': { protocolId: '23', level: 'Novice', streak: 1, xp: 15, masteryPoints: 15 },
                },
                ownedNftProtocolIds: ['nft_wh_01'],
                lastNightSleep: mockSleepData,
                savedReports: [],
                pvpRank: 'Gold III',
                pvpRating: 1550,
                pvpWins: 15,
                pvpLosses: 7,
                streakCatalyst: 2,
            });
            useUIStore.getState().closeAuthModal();
            saveSessionToStorage({ uid: 'dev-super-user', displayName: 'Super User (Admin)', isAnonymous: false });
            get().generateProactiveSuggestions();
            get().proactivelyDraftJournal();
            return;
        }
        log('INFO', 'signInAsSuperUser: Attempting simulated super user sign-in.');
        try {
            await auth.signInAnonymously();
            const user = auth.currentUser;
            if (user) {
                const userRef = db.collection('profiles').doc(user.uid);
                const { activeModules } = generateMockDiagnosticData();
                const myStackContent: MyStackContent = ['1', '22', '23', '10', '3'];
                
                await userRef.set({
                    displayName: "Super User (Dev)",
                    is_admin: true,
                    is_premium: true,
                    my_stack_content: myStackContent,
                    goals: ['Promote Longevity', 'Boost Energy'],
                    wearables: [Wearable.Oura, Wearable.Garmin],
                    active_diagnostic_modules: activeModules,
                    walletAddress: '0x1234567890123456789012345678901234567890',
                    bio_tokens: 10000,
                    total_xp: 11000,
                    owned_nft_protocol_ids: ['nft_wh_01'],
                    // FIX: Added missing masteryPoints property to align with ProtocolMastery type.
                    protocol_mastery: {
                        '1': { protocolId: '1', level: 'Adept', streak: 12, xp: 250, masteryPoints: 250 },
                        '3': { protocolId: '3', level: 'Expert', streak: 35, xp: 800, masteryPoints: 800 },
                        '10': { protocolId: '10', level: 'Novice', streak: 3, xp: 45, masteryPoints: 45 },
                        '22': { protocolId: '22', level: 'Novice', streak: 2, xp: 30, masteryPoints: 30 },
                        '23': { protocolId: '23', level: 'Novice', streak: 1, xp: 15, masteryPoints: 15 },
                    },
                    saved_reports: [],
                    pvp_rank: 'Gold III',
                    pvp_rating: 1550,
                    pvp_wins: 15,
                    pvp_losses: 7,
                    streak_catalyst: 2,
                }, { merge: true });
            }
            useUIStore.getState().closeAuthModal();
            // Persist session metadata for emulator/dev flows
            const cUser = auth.currentUser;
            saveSessionToStorage(cUser ? { uid: cUser.uid, displayName: cUser.displayName || null, isAnonymous: cUser.isAnonymous } : null);
        } catch (error) {
            log('ERROR', 'signInAsSuperUser: Super User sign-in failed.', { error });
            toast.error("Failed to sign in as super user.");
        }
    },
    
    signInAsNewUser: async () => {
        if (!isFirebaseEnabled) {
            toast.success("Signed in as New User (Simulated)");
            const platformConfig = useDataStore.getState().platformConfig;
            
            // Reset to a clean new user state
            set({
                ...getInitialUserState(),
                user: { uid: 'dev-new-user', isAnonymous: false, displayName: "New User" } as firebase.User,
                displayName: "New User",
                lastLoginDate: new Date().toISOString().split('T')[0],
                bioTokens: 100,
            });
    
            useUIStore.getState().closeAuthModal();
            saveSessionToStorage({ uid: 'dev-new-user', displayName: 'New User', isAnonymous: false });
            
            if (platformConfig?.isGuidedWalkthroughEnabled) {
                setTimeout(() => {
                    // If setUserGoals was called earlier, userGoals might be updated; prefer that, else fallback
                    const primaryGoal = useUserStore.getState().userGoals[0] || 'Improve Focus';
                    console.info('[userStore] simulated new-user startWalkthrough primaryGoal=', primaryGoal);
                    useUIStore.getState().startWalkthrough({ primaryGoal });
                }, 100);
            }
            return;
        }
        
        log('INFO', 'signInAsNewUser: Attempting simulated new user sign-in.');
        try {
            if (auth.currentUser) {
                await auth.signOut();
            }
            const { user } = await auth.signInAnonymously();
    
            if (user) {
                const userRef = db.collection('profiles').doc(user.uid);
                // Overwrite existing data to ensure a fresh start
                await userRef.set({
                    displayName: "New User (Dev)",
                    is_admin: false,
                    is_premium: false,
                    my_stack_content: [],
                    goals: [],
                    wearables: [],
                    active_diagnostic_modules: [],
                    bio_tokens: 100,
                    total_xp: 0,
                    has_completed_walkthrough: false,
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    last_login_date: new Date().toISOString().split('T')[0],
                    daily_streak: 1,
                });
                // The onAuthStateChanged listener in initializeUserSession will handle the rest.
                 useUIStore.getState().closeAuthModal();
            }
        } catch (error) {
            log('ERROR', 'signInAsNewUser: New User sign-in failed.', { error });
            toast.error("Failed to sign in as new user.");
        }
    },

    signOut: async () => {
        log('INFO', 'signOut: Signing out user.');
        if (isFirebaseEnabled) {
            await auth.signOut();
        }
    set(getInitialUserState());
    clearSessionFromStorage();
        useUIStore.getState().setView('explore');
    },

    toggleStack: async (protocol: Protocol) => {
        const { myStackContent, user, ceramicStreamId, addXP } = get();
        const isInStack = myStackContent.some(p => (typeof p === 'string' && p === protocol.id));
        const newStackContent = isInStack
            ? myStackContent.filter(id => typeof id === 'string' ? id !== protocol.id : true)
            : [...myStackContent, protocol.id];

        set({
            myStackContent: newStackContent,
            myStack: hydrateMyStack(newStackContent),
        });
        
        if (isInStack) {
            toast.success(`"${protocol.name}" removed from stack.`);
        } else {
            toast.success(`"${protocol.name}" added to stack!`);
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
        }

        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { myStackContent: newStackContent });
        }
        if(!isInStack) {
          addXP(XP_VALUES.ADD_TO_STACK, 'Added to stack');
        }
    },

    addProtocolsToStack: async (protocolsToAdd: Protocol[]) => {
        const { myStackContent, user, ceramicStreamId, addXP } = get();
        const newProtocolIds = protocolsToAdd.map(p => p.id).filter(id => !myStackContent.includes(id));
        if (newProtocolIds.length === 0) return;

        const newStackContent = [...myStackContent, ...newProtocolIds];
        set({
            myStackContent: newStackContent,
            myStack: hydrateMyStack(newStackContent),
        });

        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { myStackContent: newStackContent });
        }
        addXP(XP_VALUES.ADD_TO_STACK * newProtocolIds.length, 'Added protocols to stack');
    },

    cloneStack: async (stack: CommunityStack) => {
        const { myStackContent, user, ceramicStreamId, addXP } = get();
        
        const newClonedStack: UserStack = {
            instanceId: `stack-${crypto.randomUUID()}`,
            type: 'stack',
            name: stack.name,
            description: stack.description,
            protocol_ids: stack.protocol_ids,
            author: stack.author,
            forked_from_id: stack.id,
            forked_from_name: stack.name,
        };
        
        const persistedStack: PersistedUserStack = { ...newClonedStack };
        delete (persistedStack as Partial<UserStack>).type;

        const newStackContent: MyStackContent = [...myStackContent, persistedStack];

        set({
            myStackContent: newStackContent,
            myStack: hydrateMyStack(newStackContent),
        });

        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { myStackContent: newStackContent });
        }
        addXP(XP_VALUES.ADD_TO_STACK * 2, 'Cloned a community stack');
        toast.success(`'${stack.name}' cloned to your stack!`);
    },

    removeMyStackItem: async (itemId: string) => {
        const { myStackContent, user, ceramicStreamId } = get();
        const newStackContent = myStackContent.filter(item => {
            if (typeof item === 'string') return item !== itemId;
            return item.instanceId !== itemId;
        });

        set({
            myStackContent: newStackContent,
            myStack: hydrateMyStack(newStackContent),
        });

        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { myStackContent: newStackContent });
        }
    },

    updateClonedStack: async (updatedStack: UserStack) => {
        const { myStackContent, user, ceramicStreamId } = get();

        const newStackContent = myStackContent.map(item => {
            if (typeof item !== 'string' && item.instanceId === updatedStack.instanceId) {
                const persistedStack: PersistedUserStack = { ...updatedStack };
                delete (persistedStack as Partial<UserStack>).type;
                return persistedStack;
            }
            return item;
        });

        set({
            myStackContent: newStackContent,
            myStack: hydrateMyStack(newStackContent),
        });

        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { myStackContent: newStackContent });
        }
        toast.success(`'${updatedStack.name}' updated.`);
    },

    addJournalEntry: async (entryData: Omit<JournalEntry, 'date' | 'completedProtocols' | 'id' | 'user_id'>) => {
        const { journalEntries, user, ceramicStreamId, addXP } = get();
        const today = new Date().toISOString().split('T')[0];
        const existingEntryIndex = journalEntries.findIndex(e => e.date === today);

        let newEntries;
        if (existingEntryIndex > -1) {
            newEntries = [...journalEntries];
            const existingEntry = newEntries[existingEntryIndex];
            newEntries[existingEntryIndex] = { ...existingEntry, ...entryData };
        } else {
            const newEntry: JournalEntry = {
                id: `journal-${crypto.randomUUID()}`,
                date: today,
                completedProtocols: [],
                ...entryData,
            };
            newEntries = [newEntry, ...journalEntries].sort((a, b) => b.date.localeCompare(a.date));
            addXP(XP_VALUES.JOURNAL_LOG, 'Logged journal');
        }
        
        set({ journalEntries: newEntries });
        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { journalEntries: newEntries });
        }
    },

    logCompletedProtocol: async (protocolId: string) => {
        const { journalEntries, user, ceramicStreamId, addXP, streakCatalyst, activeQuests, completeQuest } = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const existingEntryIndex = journalEntries.findIndex(e => e.date === today);
    
        let newEntries;
        if (existingEntryIndex > -1) {
            newEntries = [...journalEntries];
            const existingEntry = newEntries[existingEntryIndex];
            if (!existingEntry.completedProtocols.includes(protocolId)) {
                existingEntry.completedProtocols.push(protocolId);
                addXP(XP_VALUES.COMPLETE_PROTOCOL, 'Completed protocol');
            }
        } else {
            const newEntry: JournalEntry = {
                id: `journal-${crypto.randomUUID()}`,
                date: today,
                mood: 3, energy: 3, focus: 3,
                completedProtocols: [protocolId],
            };
            newEntries = [newEntry, ...journalEntries].sort((a, b) => b.date.localeCompare(a.date));
            addXP(XP_VALUES.COMPLETE_PROTOCOL + XP_VALUES.JOURNAL_LOG, 'Completed protocol & logged');
        }
    
        if (newEntries) {
            set({ journalEntries: newEntries });
            if (user && ceramicStreamId) {
                await ceramicService.updateStream(ceramicStreamId, { journalEntries: newEntries });
            }
        }
    
        // Check for and complete any active quests related to this protocol
        const questToComplete = activeQuests.find(q => q.protocolId === protocolId);
        if (questToComplete) {
            completeQuest(questToComplete.id);
        } else {
            toast.success('Protocol logged!');
        }
    
        const { protocolMastery } = get();
        const currentMastery = protocolMastery[protocolId] || { protocolId, level: 'Novice', streak: 0, xp: 0, masteryPoints: 0 };
    
        const lastCompletedJournalEntry = get().journalEntries
            .filter(entry => entry.completedProtocols.includes(protocolId))
            .sort((a, b) => b.date.localeCompare(a.date))[0];
    
        let newStreak = currentMastery.streak;
        if (lastCompletedJournalEntry && lastCompletedJournalEntry.date === yesterday) {
            const streakIncrease = streakCatalyst || 1;
            newStreak += streakIncrease;
            if (streakCatalyst) {
                toast.success(`Streak Catalyst Used! +${streakIncrease} streak!`, { icon: '🔥' });
                set({ streakCatalyst: null }); // Consume it
                if (isFirebaseEnabled && get().user) {
                    db.collection('profiles').doc(get().user!.uid).update({ streak_catalyst: null });
                }
            }
        } else if (!lastCompletedJournalEntry || lastCompletedJournalEntry.date !== today) {
            newStreak = 1;
        }
    },    

    addAuditEvent: async (eventData: Omit<AuditEvent, 'id' | 'user_id' | 'timestamp'>) => {
        const { user } = get();
        if (!isFirebaseEnabled || !user) return;

        const newEvent: Omit<AuditEvent, 'id'> = {
            ...eventData,
            user_id: user.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('audit_trail').add(newEvent);
        set(state => ({
            auditTrail: [{ ...newEvent, id: docRef.id, timestamp: new Date() } as AuditEvent, ...state.auditTrail]
        }));
    },

    toggleWearable: async (wearable: Wearable) => {
        const { user, connectedWearables } = get();
        const newWearables = connectedWearables.includes(wearable)
            ? connectedWearables.filter(w => w !== wearable)
            : [...connectedWearables, wearable];
        set({ connectedWearables: newWearables });
        if (user && isFirebaseEnabled) {
            await db.collection('profiles').doc(user.uid).update({ wearables: newWearables });
        }
    },

    setUserGoals: async (goals: string[]) => {
        const { user, ceramicStreamId } = get();
        set({ userGoals: goals });
        sessionStorage.setItem('onboardingComplete', 'true');
        if (user && ceramicStreamId) {
            await ceramicService.updateStream(ceramicStreamId, { userGoals: goals });
        }
    },

    toggleCalendar: () => set(state => ({ isCalendarConnected: !state.isCalendarConnected })),

    mintHeroCard: async (protocol: Protocol) => {
        toast.success(`Minting of ${protocol.name} is simulated.`);
    },
    
    setMintStatus: (protocolId: string, status?: MintStatus) => {
        set(state => ({
            mintedProtocols: status
                ? { ...state.mintedProtocols, [protocolId]: status }
                : (({ [protocolId]: _, ...rest }) => rest)(state.mintedProtocols),
        }));
    },

    redeemPromoCode: async (code: string) => {
        toast.error('Promo code redemption is not yet implemented.');
    },

    toggleUpvoteStack: async (stackId: string) => {
        const { user, upvotedStackIds } = get();
        const isUpvoted = upvotedStackIds.includes(stackId);
        const newUpvoted = isUpvoted
            ? upvotedStackIds.filter(id => id !== stackId)
            : [...upvotedStackIds, stackId];
        
        set({ upvotedStackIds: newUpvoted });
        useDataStore.getState().updateStackVote(stackId, isUpvoted ? 'down' : 'up');

        if (user && isFirebaseEnabled) {
            await db.collection('profiles').doc(user.uid).update({ upvoted_stack_ids: newUpvoted });
        }
    },

    toggleDataProcessing: async () => {
        const { user, isDataProcessingAllowed } = get();
        const newValue = !isDataProcessingAllowed;
        set({ isDataProcessingAllowed: newValue });
        if (user && isFirebaseEnabled) {
            await db.collection('profiles').doc(user.uid).update({ is_data_processing_allowed: newValue });
        }
    },
    
    generateZKProof: async (type: ZKProof['type'], statement: string) => {
        log('INFO', 'generateZKProof: Simulating ZK Proof generation.', { type, statement });
        const newProof: ZKProof = {
            id: `zkp-${crypto.randomUUID()}`,
            type,
            statement,
            proofData: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            verificationLink: '#',
            timestamp: new Date().toISOString(),
        };
        set(state => ({
            zkProofs: [newProof, ...state.zkProofs]
        }));
        toast.success(`Generated proof for "${type}"`);
    },

    toggleDiagnosticModule: async (moduleId: string) => {
        const { user, activeDiagnosticModules } = get();
        const newModules = activeDiagnosticModules.includes(moduleId)
            ? activeDiagnosticModules.filter(id => id !== moduleId)
            : [...activeDiagnosticModules, moduleId];
        set({ activeDiagnosticModules: newModules });
        get().simulateDiagnosticData();
        if (user && isFirebaseEnabled) {
            await db.collection('profiles').doc(user.uid).update({ active_diagnostic_modules: newModules });
        }
    },

    simulateDiagnosticData: () => {
        const { activeDiagnosticModules } = get();
        const activeMetrics = diagnosticModules
            .filter(m => activeDiagnosticModules.includes(m.id))
            .flatMap(m => m.metrics);
        
        const newData = activeMetrics.map(metric => {
            const value = generateRandomValue(metric);
            return {
                metricName: metric.name,
                value,
                unit: metric.unit,
                status: getStatus(value, metric),
                timestamp: new Date().toISOString(),
                domain: metric.domain,
            };
        });
        set({ diagnosticData: newData });
    },

    addXP: async (amount: number, eventName: string) => {
        const { user, totalXp, level } = get();
        const newTotalXp = totalXp + amount;
        const newLevel = getLevelFromXp(newTotalXp);
    
        if (newLevel > level) {
          toast.success(`Level Up! You've reached Level ${newLevel}!`, { icon: '🎉' });
        }
    
        const currentLevelXp = LEVEL_THRESHOLDS[newLevel - 1] || 0;
        const nextLevelXp = LEVEL_THRESHOLDS[newLevel] || currentLevelXp;
        
        const newXpState: UserXP = {
          current: newTotalXp - currentLevelXp,
          nextLevel: nextLevelXp - currentLevelXp,
        };
    
        set({
          totalXp: newTotalXp,
          level: newLevel,
          xp: newXpState,
        });
    
        if (isFirebaseEnabled && user && !user.isAnonymous) {
          await db.collection('profiles').doc(user.uid).update({
            total_xp: firebase.firestore.FieldValue.increment(amount),
          });
        }
        log('SUCCESS', `XP awarded for ${eventName}`, { amount });
      },
    openMysteryCache: async (cacheId: string) => {},
    sealDataVault: async (params: { year: number, month: number }) => {
        toast.success('Data vault sealing is simulated.');
    },
    startFast: (protocolId: string) => set({ activeFast: { protocolId, startTime: Date.now() } }),
    endFast: () => set({ activeFast: null }),
    startPacer: (protocol: Protocol) => set({ activePacer: { protocol } }),
    stopPacer: () => set({ activePacer: null }),
    startPlayer: (protocol: Protocol) => set({ activePlayer: { protocol, playingFrequency: null } }),
    setPlayerFrequency: (frequency: number | null) => set(state => state.activePlayer ? ({ activePlayer: { ...state.activePlayer, playingFrequency: frequency } }) : {}),
    stopPlayer: () => {
        audioService.stop();
        set({ activePlayer: null });
    },
    setWimHofSessionState: (state: 'inactive' | 'breathing' | 'cold') => set({ wimHofSessionState: state }),
    setProtocolTimeOverride: async (protocolId, time) => {
        const { user, protocolTimeOverrides } = get();
        const newOverrides = { ...protocolTimeOverrides, [protocolId]: time };
        set({ protocolTimeOverrides: newOverrides });
    
        if (user && isFirebaseEnabled) {
            await db.collection('profiles').doc(user.uid).update({
                protocol_time_overrides: newOverrides,
            });
        }
        log('INFO', 'User schedule override saved.', { protocolId, time });
    },
    // Phase 2 Functions
    createDID: async () => {
        toast.success('Decentralized ID (DID) creation simulated.');
    },
    claimKaiPlusVC: async () => {
        toast.success('Verifiable Credential (VC) for Kai+ claimed.');
    },
    // Phase 3 Functions
    archiveBaselineSnapshot: async () => {
        toast.success('Baseline snapshot archived to Arweave (simulated).');
    },
    // Wallet Functions
    earnBioTokens: async (amount: number, description: string) => {
        const { user, bioTokens, cryptoTransactions } = get();
        if (!user || user.isAnonymous) {
          log('WARN', 'earnBioTokens: Anonymous user cannot earn tokens.');
          return;
        }
    
        const newBioTokens = bioTokens + amount;
        const newTransaction: CryptoTransaction = {
          id: `tx-${crypto.randomUUID()}`,
          type: 'earn',
          amount,
          description,
          timestamp: new Date(),
        };
        const newTransactions = [newTransaction, ...cryptoTransactions];
    
        set({
          bioTokens: newBioTokens,
          cryptoTransactions: newTransactions,
        });
    
        if (isFirebaseEnabled && user) {
          await db.collection('profiles').doc(user.uid).update({
            bio_tokens: newBioTokens,
            crypto_transactions: newTransactions,
          });
        }
    
        log('SUCCESS', 'earnBioTokens: Tokens earned.', { amount, description });
        toast.success(`Earned ${amount} $BIO!`);
    },
    spendBioTokens: async (amount: number, description: string) => {
        const { user, bioTokens, cryptoTransactions } = get();
        if (!user || user.isAnonymous) {
          throw new Error("User must be signed in to spend tokens.");
        }
        if (bioTokens < amount) {
          throw new Error("Insufficient $BIO balance.");
        }
    
        const newBioTokens = bioTokens - amount;
        const newTransaction: CryptoTransaction = {
          id: `tx-${crypto.randomUUID()}`,
          type: 'spend',
          amount,
          description,
          timestamp: new Date(),
        };
        const newTransactions = [...cryptoTransactions, newTransaction];
    
        set({
          bioTokens: newBioTokens,
          cryptoTransactions: newTransactions,
        });
    
        if (isFirebaseEnabled && user) {
          await db.collection('profiles').doc(user.uid).update({
            bio_tokens: newBioTokens,
            crypto_transactions: newTransactions,
          });
        }
    
        log('SUCCESS', 'spendBioTokens: Tokens spent.', { amount, description });
        toast.success(`Spent ${amount} $BIO.`);
    },
    purchaseProductWithBio: async (product: Product) => {
        const { spendBioTokens } = get();
        const { decrementProductInventory } = useDataStore.getState();
    
        if (!product.priceInBioTokens) {
            toast.error("This product cannot be purchased with $BIO tokens.");
            return;
        }
        if (product.inventory <= 0) {
            toast.error("This product is out of stock.");
            return;
        }
    
        try {
            await spendBioTokens(product.priceInBioTokens, `Purchased ${product.name}`);
            decrementProductInventory(product.id, 1);
            toast.success(`Successfully purchased ${product.name}!`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Purchase failed.");
            }
        }
    },
    startJourney: async (journey: Journey) => {
        const { user, enrolledJourneyIds, addProtocolsToStack } = get();
        if (!user || user.isAnonymous) {
            toast.error("Please sign in to start a journey.");
            useUIStore.getState().openAuthModal();
            return;
        }
        if (enrolledJourneyIds.includes(journey.id)) {
            toast.error("You are already on this journey.");
            return;
        }

        log('INFO', 'startJourney: Starting new journey.', { journeyId: journey.id });

        const allProtocols = useDataStore.getState().protocols;
        const journeyProtocols = journey.protocolIds.map(id => allProtocols.find(p => p.id === id)).filter((p): p is Protocol => !!p);
        await addProtocolsToStack(journeyProtocols);
        
        const newEnrolledIds = [...get().enrolledJourneyIds, journey.id];
        const newProgress: JourneyProgress = {
            journeyId: journey.id,
            startDate: new Date().toISOString(),
            currentDay: 1,
            completed: false,
        };
        const newJourneyProgress = { ...get().journeyProgress, [journey.id]: newProgress };

        set({
            enrolledJourneyIds: newEnrolledIds,
            journeyProgress: newJourneyProgress,
        });

        if (isFirebaseEnabled && user) {
            await db.collection('profiles').doc(user.uid).update({
                enrolled_journey_ids: newEnrolledIds,
                journey_progress: newJourneyProgress,
            });
        }
        
        toast.success(`Started the "${journey.name}" journey!`, { icon: '🚀' });
    },
    enrollInJourney: async (journey: Journey) => {
        const { user, bioTokens, enrolledJourneyIds, addProtocolsToStack, cryptoTransactions } = get();
        const fee = journey.enrollmentFee || 0;

        if (!user || user.isAnonymous) {
            toast.error("Please sign in to enroll in a journey.");
            useUIStore.getState().openAuthModal();
            return;
        }
        if (enrolledJourneyIds.includes(journey.id)) {
            toast.error("You are already enrolled in this journey.");
            return;
        }
        if (bioTokens < fee) {
            toast.error(`Insufficient funds. You need ${fee} $BIO to enroll.`);
            return;
        }

        log('INFO', 'enrollInJourney: Enrolling in special edition journey.', { journeyId: journey.id, fee });

        const allProtocols = useDataStore.getState().protocols;
        const journeyProtocols = journey.protocolIds.map(id => allProtocols.find(p => p.id === id)).filter((p): p is Protocol => !!p);
        await addProtocolsToStack(journeyProtocols);
        
        const newBioTokens = bioTokens - fee;
        const newTransaction: CryptoTransaction = {
            id: `tx-${crypto.randomUUID()}`,
            type: 'spend',
            amount: fee,
            description: `Enrolled in journey: ${journey.name}`,
            timestamp: new Date(),
        };
        const newTransactions = [...cryptoTransactions, newTransaction];

        const newEnrolledIds = [...get().enrolledJourneyIds, journey.id];
        const newProgress: JourneyProgress = {
            journeyId: journey.id,
            startDate: new Date().toISOString(),
            currentDay: 1,
            completed: false,
        };
        const newJourneyProgress = { ...get().journeyProgress, [journey.id]: newProgress };

        set({
            bioTokens: newBioTokens,
            cryptoTransactions: newTransactions,
            enrolledJourneyIds: newEnrolledIds,
            journeyProgress: newJourneyProgress,
        });

        if (isFirebaseEnabled && user) {
            await db.collection('profiles').doc(user.uid).update({
                bio_tokens: newBioTokens,
                crypto_transactions: newTransactions,
                enrolled_journey_ids: newEnrolledIds,
                journey_progress: newJourneyProgress,
            });
        }

        toast.success(`Enrolled in "${journey.name}"!`, { icon: '⭐' });
    },
    advanceJourneyDay: async (journeyId: string) => {},
    generateProactiveSuggestions: () => {
        const { kaiSuggestions, lastNightSleep, calendarEvents } = get();
    
        // Don't generate a new suggestion if one is already showing
        if (kaiSuggestions.length > 0) {
            return;
        }
    
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        
        // Find a high-stakes event for today
        const highStakesEvent = calendarEvents.find(e => e.day === today && e.type === 'high-stakes');
    
        // Check for poor sleep data from wearables
        const isSleepPoor = lastNightSleep && (lastNightSleep.hrv < 40 || lastNightSleep.readiness < 70);
    
        let newSuggestion: ProactiveKaiSuggestion | null = null;
    
        if (isSleepPoor && highStakesEvent) {
            newSuggestion = {
                id: `sugg-${crypto.randomUUID()}`,
                title: `High Stress Detected Ahead of Meeting`,
                reason: `Your sleep data from last night indicates a potential for high stress today. Combined with your upcoming high-stakes meeting at ${highStakesEvent.time}, I recommend a short session to optimize your state.`,
                protocolId: '3', // Box Breathing
                timestamp: new Date().toISOString(),
            };
        }
    
        if (newSuggestion) {
            // Use a timeout to simulate the AI "thinking" for a moment after the UI loads
            setTimeout(() => {
                // Check again in case the user has already dismissed another suggestion
                if (get().kaiSuggestions.length === 0) {
                     set({ kaiSuggestions: [newSuggestion!] });
                }
            }, 1500);
        }
    },
    dismissSuggestion: (suggestionId: string) => {
        set(state => ({ kaiSuggestions: state.kaiSuggestions.filter(s => s.id !== suggestionId) }));
    },
    ingestSimulatedBloodwork: () => {
        const { diagnosticData } = get();
        const altMetric = diagnosticModules
          .find(m => m.id === 'blood_panel')
          ?.metrics.find(m => m.name === 'ALT (Liver Enzyme)');
    
        if (!altMetric) {
          toast.error("ALT metric definition not found.");
          return;
        }
    
        const hasAlt = diagnosticData.some(d => d.metricName === 'ALT (Liver Enzyme)');
        if (hasAlt) {
          toast.success("Bloodwork already includes liver enzyme data.");
          return;
        }
    
        const newDataPoint: DiagnosticDataPoint = {
          metricName: altMetric.name,
          value: 30, // A healthy starting value
          unit: altMetric.unit,
          status: 'optimal',
          timestamp: new Date().toISOString(),
          domain: altMetric.domain,
        };
        
        set(state => ({
          diagnosticData: [...state.diagnosticData, newDataPoint],
        }));
    
        toast.success("Simulated bloodwork uploaded. ALT (Liver Enzyme) data added to Digital Twin.", { icon: '🩸' });
    },
    proactivelyDraftJournal: async () => {
        if (get().draftedJournalEntry) return; // Don't draft if one already exists
        const today = new Date().toISOString().split('T')[0];
        if (get().journalEntries.some(e => e.date === today)) return; // Don't draft if already logged
    
        log('INFO', 'proactivelyDraftJournal: Initiating proactive journal draft.');
        try {
          const { calendarEvents, gpsLog } = get();
          const photoData = await getSimulatedPhotoOfTheDay();
          const dayData: DayData = {
            photo: photoData,
            calendarEvents: calendarEvents,
            gpsLog: gpsLog,
          };
          const draft = await getDraftJournalFromDayData(dayData);
          set({ draftedJournalEntry: draft });
          log('SUCCESS', 'proactivelyDraftJournal: Draft created successfully.');
        } catch (error) {
          const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
          log('ERROR', `proactivelyDraftJournal: Failed to create draft.`, errorDetails);
        }
    },
    clearDraftedJournal: () => {
        set({ draftedJournalEntry: null });
    },
    // Report History Functions
    saveReport: async (report: Omit<SavedReport, 'id' | 'timestamp'>) => {
        const { user, savedReports, ceramicStreamId } = get();
        if (!user) return;
        log('INFO', 'saveReport: Saving new report.', { type: report.type });
    
        const newReport: SavedReport = {
            ...report,
            id: `report-${crypto.randomUUID()}`,
            timestamp: new Date(),
        };
    
        const newReports = [newReport, ...savedReports].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        set({ savedReports: newReports });
    
        if (isFirebaseEnabled && user) {
            await db.collection('profiles').doc(user.uid).update({
                saved_reports: newReports
            });
        }
    
        toast.success('Report saved to history.');
      },
    
      deleteReport: async (reportId: string) => {
        const { user, savedReports, ceramicStreamId } = get();
        if (!user) return;
        log('INFO', 'deleteReport: Deleting report.', { reportId });
    
        const newReports = savedReports.filter(r => r.id !== reportId);
        set({ savedReports: newReports });
    
        if (isFirebaseEnabled && user) {
            await db.collection('profiles').doc(user.uid).update({
                saved_reports: newReports
            });
        }
    
        toast.success('Report deleted.');
      },
      setPvpDeck: async (deck: string[]) => {
        set({ pvpDeck: deck });
        if (isFirebaseEnabled && get().user) {
            await db.collection('profiles').doc(get().user!.uid).update({ pvp_deck: deck });
        }
        toast.success("PvP Deck saved!");
      },
      updatePvpRating: async (didWin: boolean) => {
        const duelState = useUIStore.getState().activeDuel;
        if (!duelState || !('pvpRating' in duelState.opponent)) return;

        const stake = duelState.stake || 0;
        const ratingChange = didWin ? 15 : -10;
        
        const { pvpRating, earnBioTokens, spendBioTokens, pvpWins, pvpLosses } = get();
        
        let newStreakCatalyst: number | null = get().streakCatalyst;

        if (didWin) {
            newStreakCatalyst = 2; // Set catalyst to 2x
            toast.success("Streak Catalyst Acquired! Your next streak will be doubled.", { icon: '🔥' });
        }
        
        const newWins = pvpWins + (didWin ? 1 : 0);
        const newLosses = pvpLosses + (didWin ? 0 : 1);

        set({ 
            pvpRating: pvpRating + ratingChange,
            streakCatalyst: newStreakCatalyst,
            pvpWins: newWins,
            pvpLosses: newLosses,
        });
        
        if (stake > 0) {
            if (didWin) {
                await earnBioTokens(stake, `Won PvP duel vs ${duelState.opponent.displayName}`);
            } else {
                await spendBioTokens(stake, `Lost PvP duel vs ${duelState.opponent.displayName}`);
            }
        }
        
        if (isFirebaseEnabled && get().user) {
            const updates: { [key: string]: any } = {
                pvp_rating: firebase.firestore.FieldValue.increment(ratingChange),
                pvp_wins: newWins,
                pvp_losses: newLosses,
            };
            if (didWin) {
                updates.streak_catalyst = newStreakCatalyst;
            }
            await db.collection('profiles').doc(get().user!.uid).update(updates);
        }

        toast.success(`Duel finished. Rating ${didWin ? '+' : ''}${ratingChange}.`);
      },
      forgeNftProtocol: async (baseProtocol, nftData) => {
        const { user, level, spendBioTokens, ownedNftProtocolIds, protocolMastery, displayName } = get();
        const { addForgedProtocol } = useDataStore.getState();
    
        if (!user || user.isAnonymous) {
            throw new Error("You must be signed in to forge protocols.");
        }
        if (level < 20) {
            throw new Error("You must reach Level 20 (Data Alchemist) to access the Genesis Forge.");
        }
    
        const FORGE_COST = 5000;
        
        await spendBioTokens(FORGE_COST, `Forged NFT: ${nftData.name}`);
    
        const newNftId = `nft-${crypto.randomUUID()}`;
        const newNftProtocol: Protocol = {
            ...baseProtocol,
            id: newNftId,
            name: nftData.name,
            description: nftData.description,
            gameStats: nftData.gameStats,
            imageUrl: nftData.imageUrl,
            isNft: true,
            isPersonalized: false,
            isCommunity: true,
            artist: displayName || 'Anonymous',
            user_id: user.uid,
            forked_from_id: baseProtocol.id,
            forgedNftId: undefined,
            isShared: false,
        };
    
        await addForgedProtocol(newNftProtocol, baseProtocol);
    
        const newOwnedIds = [...ownedNftProtocolIds, newNftId];
        const newMastery = { ...protocolMastery };
        if (newMastery[baseProtocol.id]) {
            newMastery[baseProtocol.id].forgedNftId = newNftProtocol.id;
        }
        
        set({ ownedNftProtocolIds: newOwnedIds, protocolMastery: newMastery });
        
        if (isFirebaseEnabled) {
            const userRef = db.collection('profiles').doc(user.uid);
            await userRef.update({
                owned_nft_protocol_ids: newOwnedIds,
                protocol_mastery: newMastery
            });
        }
    
        log('SUCCESS', 'forgeNftProtocol: NFT forged successfully.', { newNftId });
      },

    acceptQuest: (quest: Quest) => {
        if (quest.protocolId) {
            const { myStack } = get();
            const { protocols } = useDataStore.getState();
    
            const allProtocolIdsInStack = myStack.reduce<string[]>((acc, item) => {
                if ('protocol_ids' in item) { // It's a UserStack
                    return [...acc, ...item.protocol_ids];
                }
                if ('id' in item) { // It's a Protocol
                    acc.push(item.id);
                }
                return acc;
            }, []);
    
            if (!allProtocolIdsInStack.includes(quest.protocolId)) {
                const protocolToAdd = protocols.find(p => p.id === quest.protocolId);
                if (protocolToAdd) {
                    get().addProtocolsToStack([protocolToAdd]);
                }
            }
        }

        set(state => ({
            activeQuests: [...state.activeQuests, quest]
        }));
        toast.success("Quest accepted and added to your agenda!");
        // Firebase logic would go here
    },
    
    completeQuest: (questId: string) => {
        const quest = get().activeQuests.find(q => q.id === questId);
        if (!quest) return;
    
        get().addXP(quest.xpReward, `Completed quest: ${quest.title}`);
        get().earnBioTokens(quest.bioTokenReward, `Quest reward: ${quest.title}`);
    
        set(state => ({
            activeQuests: state.activeQuests.filter(q => q.id !== questId),
            completedQuests: [...state.completedQuests, questId]
        }));
        
        toast.success(`Quest Complete: ${quest.title}`, { icon: '⭐' });

        // Firebase logic would go here
    },
      
    enrollInTournament: (tournamentId: string) => {
        set(state => ({
            enrolledTournamentIds: [...state.enrolledTournamentIds, tournamentId]
        }));
        // Firebase logic would go here
      },

    markWalkthroughAsCompleted: async () => {
        const { user } = get();
        set({ hasCompletedWalkthrough: true });
        if (isFirebaseEnabled && user && !user.isAnonymous) {
            try {
                await db.collection('profiles').doc(user.uid).update({
                    has_completed_walkthrough: true,
                });
                log('SUCCESS', 'User walkthrough completion status saved.');
            } catch (error) {
                log('ERROR', 'Failed to save walkthrough completion status.', { error });
            }
        }
    },
    
    toggleAgentMode: async () => {
        const { user, isAgentModeEnabled } = get();
        const newValue = !isAgentModeEnabled;
        set({ isAgentModeEnabled: newValue });

        // If Agent Mode is turned off, also turn off sub-features
        if (!newValue) {
            set({
                isLivingStackEnabled: false,
                isAmbientJournalingEnabled: false
            });
        }
        
        if (isFirebaseEnabled && user && !user.isAnonymous) {
          const updates: any = { is_agent_mode_enabled: newValue };
          if (!newValue) {
              updates.is_living_stack_enabled = false;
              updates.is_ambient_journaling_enabled = false;
          }
          await db.collection('profiles').doc(user.uid).update(updates);
        }
        toast.success(`Kai Agent Mode has been ${newValue ? 'enabled' : 'disabled'}.`);
    },

    toggleLivingStack: async () => {
        const { user, isLivingStackEnabled } = get();
        const newValue = !isLivingStackEnabled;
        set({ isLivingStackEnabled: newValue });
        if (isFirebaseEnabled && user && !user.isAnonymous) {
          await db.collection('profiles').doc(user.uid).update({ is_living_stack_enabled: newValue });
        }
        toast.success(`Living Stack has been ${newValue ? 'enabled' : 'disabled'}.`);
    },
    
    toggleAmbientJournaling: async () => {
        const { user, isAmbientJournalingEnabled } = get();
        const newValue = !isAmbientJournalingEnabled;
        set({ isAmbientJournalingEnabled: newValue });
        if (isFirebaseEnabled && user && !user.isAnonymous) {
          await db.collection('profiles').doc(user.uid).update({ is_ambient_journaling_enabled: newValue });
        }
        toast.success(`Ambient Journaling has been ${newValue ? 'enabled' : 'disabled'}.`);
    },
}));
