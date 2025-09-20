import { create } from 'zustand';
import { Protocol, CommunityStack, Difficulty, PromoCode, PublicUserProfile, KairosDataPoint, PlatformAnnouncement, Journey, Achievement, Mission, Badge, PlatformConfig, WeeklyMission, FeaturedContent, ResearchBounty, Product, UserFunnelSegment, Gift, Feedback, Order, Coupon, UserSegment, Campaign, ABTest, SocialIntegration, MailingListStats, MailingListEntry, Category, ChallengeCard, Tournament, Quest, DiagnosticService, BlogPost } from '../types';
import { db, isFirebaseEnabled } from '../services/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { protocols as mockProtocols } from '../data/protocols';
import { communityStacks as mockCommunityStacks } from '../data/community';
import { kairosCollectiveData as mockKairosData } from '../data/kairosCollective';
import { journeys as mockJourneys } from '../data/journeys';
import { achievements as mockAchievements } from '../data/achievements';
import { missions as mockMissions, badges as mockBadges } from '../data/missions';
import { mockResearchBounties } from '../data/bounties';
import { mockProducts } from '../data/products';
import { mockOrders } from '../data/orders';
import { mockABTests } from '../data/abtests';
import { useUserStore } from './userStore';
import { log } from './logStore';
import { getLevelFromXp } from '../constants';
import toast from 'react-hot-toast';
import { challengeCards as mockChallengeCards } from '../data/challenges';
import { mockCampaigns } from '../data/campaigns';
import { mockTournaments } from '../data/tournaments';
import { mockQuests } from '../data/quests';
import { diagnosticServices as mockDiagnosticServices } from '../data/diagnosticServices';
// Blog utilities for markdown seed ingestion
import { parseFrontMatter } from '../utils/blog';


interface DataState {
  protocols: Protocol[];
  communityStacks: CommunityStack[];
  promoCodes: PromoCode[];
  allUsers: PublicUserProfile[];
  kairosCollectiveData: KairosDataPoint[];
  researchBounties: ResearchBounty[];
  platformAnnouncement: PlatformAnnouncement | null;
  journeys: Journey[];
  achievements: Achievement[];
  missions: Mission[];
  badges: Badge[];
  platformConfig: PlatformConfig | null;
  weeklyMission: WeeklyMission | null;
  featuredContent: FeaturedContent | null;
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  userSegments: UserSegment[];
  campaigns: Campaign[];
  abTests: ABTest[];
  feedback: Feedback[];
  socialIntegrations: SocialIntegration[];
  mailingListStats: MailingListStats;
  mailingList: MailingListEntry[];
  challengeCards: ChallengeCard[];
  tournaments: Tournament[];
  quests: Quest[];
  diagnosticServices: DiagnosticService[];
    blogPosts?: BlogPost[]; // optional to avoid breaking existing references until used
  fetchData: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  updateStackVote: (id: string, direction: 'up' | 'down') => Promise<void>;
  submitProtocol: (protocolData: Omit<Protocol, 'id' | 'bioScore' | 'isCommunity' | 'submittedBy' | 'user_id'>) => Promise<void>;
  updateProtocol: (protocolData: Partial<Protocol> & { id: string }) => Promise<void>;
  deleteProtocol: (protocolId: string) => Promise<void>;
  publishStack: (name: string, description: string, protocolIds: string[], forkedFromId?: string, forkedFromName?: string, productIds?: string[]) => Promise<void>;
  generatePromoCode: (protocolId: string, maxUses: number) => Promise<void>;
  deletePromoCode: (codeId: string) => Promise<void>;
  deleteCommunityStack: (stackId: string) => Promise<void>;
  createPersonalizedProtocol: (protocolData: Protocol) => Promise<void>;
  shareProtocolToCommunity: (protocol: Protocol) => Promise<void>;
  fetchPublicProfile: (userId: string) => Promise<PublicUserProfile | null>;
  setPlatformAnnouncement: (message: string, isActive: boolean) => Promise<void>;
  toggleUserAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  processReferral: (referrerId: string) => Promise<void>;
  updatePlatformConfig: (config: Partial<PlatformConfig>) => Promise<void>;
  setWeeklyMission: (mission: Partial<WeeklyMission>) => Promise<void>;
  updateFeaturedContent: (content: FeaturedContent) => Promise<void>;
  toggleStackVerification: (stackId: string, currentStatus: boolean) => Promise<void>;
  createResearchBounty: (bountyData: Omit<ResearchBounty, 'id' | 'user_id' | 'author' | 'stakers' | 'createdAt' | 'status' | 'results' | 'totalStake'>, initialStake: number, productId?: string) => Promise<void>;
  stakeOnBounty: (bountyId: string, amount: number) => Promise<void>;
  resolveBounty: (bountyId: string, results: { summary: string; protocolId: string; }) => Promise<void>;
  getPlatformAnalytics: () => Promise<{ dau: number; mau: number; newUsers: number; churnRate: number; protocolsLogged: number; topContributor: string; mostPopularStack: string; userFunnel: UserFunnelSegment[]; }>;
  submitFeedback: (feedbackData: Omit<Feedback, 'id' | 'user_id' | 'userDisplayName' | 'timestamp'>) => Promise<void>;
  // Product Management
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productData: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  decrementProductInventory: (productId: string, amount: number) => void;
  giftProductToUser: (userId: string, productId: string) => Promise<void>;
  // E-commerce Command Center
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => void;
  createCoupon: (couponData: Omit<Coupon, 'id' | 'uses' | 'isActive'>) => void;
  // Content & Acquisition
  updateContentSeo: (type: 'protocol' | 'stack', id: string, seoData: { metaTitle: string; metaDescription: string; slug: string }) => void;
  // Operations & Intelligence
  createUserSegment: (segmentData: Omit<UserSegment, 'id' | 'userCount'>) => void;
  createABTest: (testData: Omit<ABTest, 'id' | 'status' | 'winner'>) => Promise<void>;
  // Growth Engine Integrations
  connectSocialMedia: (platform: 'twitter' | 'discord') => Promise<void>;
  postToSocialMedia: (message: string) => Promise<void>;
  sendEmailBlast: (subject: string, body: string) => Promise<void>;
  addToMailingList: (email: string) => Promise<void>;
  addForgedProtocol: (newNftProtocol: Protocol, baseProtocol: Protocol) => Promise<void>;
    // Blog CRUD (optional presence)
    createBlogPost?: (data: Omit<BlogPost, 'id' | 'slug' | 'publishedAt' | 'updatedAt'> & { slug?: string }) => void;
    updateBlogPost?: (id: string, data: Partial<Omit<BlogPost, 'id'>>) => void;
    deleteBlogPost?: (id: string) => void;
    publishBlogPost?: (id: string) => void;
  // New Gamification 2.0
  registerForTournament: (tournamentId: string) => Promise<void>;
    // Blog realtime subscription mgmt
    initBlogRealtime?: () => void;
        destroyBlogRealtime?: () => void;
}

const generateBioScore = (p: Partial<Protocol>): number => {
    if (!p.benefits || !p.categories || !p.difficulty || !p.id) return 50;
    return Math.round(
      (p.benefits.length * 15) +
      (p.categories.length * 10) +
      (p.difficulty === Difficulty.Beginner ? 10 : p.difficulty === Difficulty.Intermediate ? 25 : 50) +
      (parseInt(p.id, 36) % 20) // Use string ID for pseudo-randomness
    );
}

import { loadMarkdownBlogSeeds } from '../utils/blogSeeds';
let blogUnsubscribe: (() => void) | null = null;

const generateGameStats = (p: Protocol): { attack: number; defense: number } => {
    const bioScore = p.bioScore || 50;
    const baseAttack = Math.round(bioScore * 0.4);
    const baseDefense = Math.round(bioScore * 0.6);
    
    const attackBonusCats = [Category.Energy, Category.Cognitive, Category.Movement];
    const defenseBonusCats = [Category.StressManagement, Category.Longevity, Category.Sleep, Category.Mindfulness, Category.ColdExposure, Category.Fasting];
    
    const attackBonus = p.categories.filter(c => attackBonusCats.includes(c)).length * 10;
    const defenseBonus = p.categories.filter(c => defenseBonusCats.includes(c)).length * 10;

    return {
        attack: baseAttack + attackBonus,
        defense: baseDefense + defenseBonus,
    };
};

export const useDataStore = create<DataState>((set, get) => ({
  protocols: [],
  communityStacks: [],
  promoCodes: [],
  allUsers: [],
  kairosCollectiveData: [],
  researchBounties: [],
  platformAnnouncement: null,
  journeys: [],
  achievements: [],
  missions: [],
  badges: [],
  platformConfig: null,
  weeklyMission: null,
  featuredContent: null,
  products: [],
  orders: [],
  coupons: [],
  userSegments: [],
  campaigns: [],
  abTests: [],
  feedback: [],
  socialIntegrations: [
    { platform: 'twitter', handle: '@BiohackStack', isConnected: false },
    { platform: 'discord', handle: 'discord.gg/biohackers', isConnected: false },
  ],
  mailingListStats: {
    subscriberCount: 12458,
    lastBlastDate: null,
    lastExportDate: null,
  },
  mailingList: [
    { email: 'testuser1@example.com', subscribedAt: new Date(Date.now() - 86400000 * 2) },
    { email: 'earlyadopter@example.com', subscribedAt: new Date(Date.now() - 86400000) },
  ],
  challengeCards: [],
  tournaments: [],
  quests: [],
  diagnosticServices: [],
    // blog state moved to stores/blogStore.ts to reduce HMR surface

  fetchData: async () => {
    log('INFO', 'fetchData: Starting data fetch.');
    const userId = useUserStore.getState().user?.uid;
    if (!isFirebaseEnabled) {
        log('WARN', 'fetchData: Firebase not configured. Loading mock data.');
        console.warn("Firebase not configured. Loading mock data.");
        const protocolsWithScore = mockProtocols.map(p => {
            const protocolWithScore = { ...p, bioScore: generateBioScore(p) };
            return { ...protocolWithScore, gameStats: generateGameStats(protocolWithScore as Protocol) };
        });
        // Markdown seed blog posts
    const seedPosts = loadMarkdownBlogSeeds();
        set({ 
            protocols: protocolsWithScore, 
            communityStacks: mockCommunityStacks, 
            promoCodes: [], 
            kairosCollectiveData: mockKairosData,
            researchBounties: mockResearchBounties,
            journeys: mockJourneys,
            achievements: mockAchievements,
            missions: mockMissions,
            badges: mockBadges,
            platformConfig: { referralXpReward: 50, isStoreEnabled: false, isAiEnabled: true, isGuidedWalkthroughEnabled: true, weeklyMission: null },
            weeklyMission: null,
            featuredContent: { protocolIds: [], stackIds: [], journeyIds: [] },
            products: mockProducts,
            orders: mockOrders,
            abTests: mockABTests,
            feedback: [],
            challengeCards: mockChallengeCards,
            campaigns: mockCampaigns,
            tournaments: mockTournaments,
            quests: mockQuests,
            diagnosticServices: mockDiagnosticServices,
            blogPosts: seedPosts,
        });
        get().fetchAllUsers();
        return;
    }
    try {
        const officialProtocolsQuery = db.collection('protocols').where('isCommunity', '!=', true);
        const communityProtocolsQuery = db.collection('protocols').where('isCommunity', '==', true);
        const communityStacksQuery = db.collection('community_stacks').orderBy('upvotes', 'desc');
        const promoCodesQuery = db.collection('promo_codes');
        const announcementQuery = db.collection('platform').doc('announcement');
        const platformConfigQuery = db.collection('platform').doc('config');
        const featuredContentQuery = db.collection('platform').doc('featured_content');
        const journeysQuery = db.collection('journeys');
        const achievementsQuery = db.collection('achievements');
        const missionsQuery = db.collection('missions');
        const badgesQuery = db.collection('badges');
        const kairosQuery = db.collection('kairos_collective_data');
        const bountiesQuery = db.collection('research_bounties').orderBy('totalStake', 'desc');
        const feedbackQuery = db.collection('feedback').orderBy('timestamp', 'desc');
        const campaignsQuery = db.collection('campaigns').where('isActive', '==', true);
        const diagnosticServicesQuery = db.collection('diagnostic_services');

        const queries: any[] = [
            officialProtocolsQuery.get(),
            communityProtocolsQuery.get(),
            communityStacksQuery.get(),
            promoCodesQuery.get(),
            announcementQuery.get(),
            platformConfigQuery.get(),
            featuredContentQuery.get(),
            journeysQuery.get(),
            achievementsQuery.get(),
            missionsQuery.get(),
            badgesQuery.get(),
            kairosQuery.get(),
            bountiesQuery.get(),
            feedbackQuery.get(),
            campaignsQuery.get(),
            diagnosticServicesQuery.get(),
            db.collection('blog_posts').get().catch(err => { log('WARN', 'fetchData: blog_posts fetch failed.', { err }); return null; })
        ];
        
        if(userId) {
            const personalizedProtocolsQuery = db.collection(`profiles/${userId}/personalized_protocols`);
            queries.push(personalizedProtocolsQuery.get());
        } else {
            queries.push(Promise.resolve(null));
        }

        const [
            officialProtocolsSnap, 
            communityProtocolsSnap, 
            communityStacksSnapshot, 
            promoCodesSnapshot, 
            announcementSnap,
            platformConfigSnap,
            featuredContentSnap,
            journeysSnap,
            achievementsSnap,
            missionsSnap,
            badgesSnap,
            kairosSnap,
            bountiesSnap,
            feedbackSnap,
            campaignsSnap,
            diagnosticServicesSnap,
            blogPostsSnap,
            personalizedProtocolsSnap,
        ] = await Promise.all(queries);

        const platformConfigData = platformConfigSnap.exists 
            ? platformConfigSnap.data() as PlatformConfig
            : { referralXpReward: 50, isStoreEnabled: false, isAiEnabled: true, isGuidedWalkthroughEnabled: false, weeklyMission: null };
        
        const officialProtocolsData = officialProtocolsSnap.docs.map(doc => ({ ...doc.data() } as Protocol));
        const communityProtocolsData = communityProtocolsSnap.docs.map(doc => ({ ...doc.data() } as Protocol));
        const personalizedProtocolsData = personalizedProtocolsSnap ? personalizedProtocolsSnap.docs.map(doc => ({ ...doc.data() } as Protocol)) : [];

        const communityStacksData = communityStacksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityStack));
        const promoCodesData = promoCodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
        const announcementData = announcementSnap.exists ? { id: announcementSnap.id, ...announcementSnap.data() } as PlatformAnnouncement : null;
        const featuredContentData = featuredContentSnap.exists ? featuredContentSnap.data() as FeaturedContent : { protocolIds: [], stackIds: [], journeyIds: [] };
        
        const journeysData = journeysSnap.docs.map((doc: any) => doc.data() as Journey);
        const achievementsData = achievementsSnap.docs.map((doc: any) => doc.data() as Achievement);
        const missionsData = missionsSnap.docs.map((doc: any) => doc.data() as Mission);
        const badgesData = badgesSnap.docs.map((doc: any) => doc.data() as Badge);
        const kairosData = kairosSnap.docs.map((doc: any) => doc.data() as KairosDataPoint);
        const bountiesData = bountiesSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as ResearchBounty);
        const feedbackData = feedbackSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Feedback);
        const campaignsData = campaignsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Campaign);
        const diagnosticServicesData = diagnosticServicesSnap.docs.map((doc: any) => doc.data() as DiagnosticService);

        // BLOG MERGE: Firestore + markdown seeds (Firestore overrides slug collisions)
        let mergedBlogPosts: BlogPost[] = [];
        try {
            const seedPosts = loadMarkdownBlogSeeds();
            const firestorePosts: BlogPost[] = blogPostsSnap ? blogPostsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) : [];
            const bySlug = new Map<string, BlogPost>();
            seedPosts.forEach(p => { if (p.slug) bySlug.set(p.slug, p as BlogPost); });
            firestorePosts.forEach(p => { if ((p as any).slug) bySlug.set((p as any).slug, { ...p, source: 'firestore' } as any); });
            mergedBlogPosts = Array.from(bySlug.values()).sort((a, b) => {
                const aPub = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const bPub = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return bPub - aPub;
            });
        } catch (blogErr) {
            log('ERROR', 'fetchData: blog merge failed.', { blogErr });
        }

        const allProtocols = [...officialProtocolsData, ...communityProtocolsData, ...personalizedProtocolsData];

        const protocolsWithStats = allProtocols.map(p => {
            const protocolWithScore = { ...p, bioScore: generateBioScore(p) };
            return { ...protocolWithScore, gameStats: generateGameStats(protocolWithScore as Protocol) };
        });
        
        set({ 
            protocols: protocolsWithStats, 
            communityStacks: communityStacksData, 
            promoCodes: promoCodesData, 
            kairosCollectiveData: kairosData.length > 0 ? kairosData : mockKairosData, // Fallback for safety
            researchBounties: bountiesData.length > 0 ? bountiesData : mockResearchBounties,
            journeys: journeysData.length > 0 ? journeysData : mockJourneys,
            achievements: achievementsData.length > 0 ? achievementsData : mockAchievements,
            missions: missionsData.length > 0 ? missionsData : mockMissions,
            badges: badgesData.length > 0 ? badgesData : mockBadges,
            platformConfig: platformConfigData,
            weeklyMission: platformConfigData.weeklyMission || null,
            platformAnnouncement: announcementData,
            featuredContent: featuredContentData,
            products: mockProducts, // For now, products are mock only
            orders: mockOrders, // For now, orders are mock only
            abTests: mockABTests, // For now, A/B tests are mock only
            feedback: feedbackData,
            challengeCards: mockChallengeCards, // For now, challenges are mock only
            campaigns: campaignsData.length > 0 ? campaignsData : mockCampaigns, // Fallback to mock if empty
            tournaments: mockTournaments, // Mock only for now
            quests: mockQuests, // Mock only for now
            diagnosticServices: diagnosticServicesData.length > 0 ? diagnosticServicesData : mockDiagnosticServices,
            blogPosts: mergedBlogPosts,
        });
        
        get().fetchAllUsers();

    log('SUCCESS', 'fetchData: Data fetched successfully from Firestore.', {
            protocols: allProtocols.length,
            stacks: communityStacksData.length,
            promoCodes: promoCodesData.length
        });
    // Start realtime blog updates (idempotent)
    get().initBlogRealtime?.();
    } catch (error) {
        log('ERROR', 'fetchData: Error fetching data from Firestore.', { error });
        console.error("Error fetching data:", error);
    }
  },
  
  fetchAllUsers: async () => {
    if (!isFirebaseEnabled) {
        log('WARN', 'fetchAllUsers: Firebase not enabled. Loading mock users.');
        const mockUsers: PublicUserProfile[] = [
            { id: 'user-anya-sharma', displayName: 'Dr. Anya Sharma', email: 'anya.sharma@example.com', level: 22, totalXp: 12500, isAdmin: false, isBanned: false, referralCount: 12, badges: [], publishedStacks: [], sharedProtocols: [], created_at: new Date(), pvpRank: 'Diamond I', pvpRating: 1850, pvpWins: 88, pvpLosses: 30 },
            { id: 'user-ben-g', displayName: 'Ben G.', email: 'ben.g@example.com', level: 20, totalXp: 10850, isAdmin: false, isBanned: false, referralCount: 8, badges: [], publishedStacks: [], sharedProtocols: [], created_at: new Date(), pvpRank: 'Gold III', pvpRating: 1550, pvpWins: 15, pvpLosses: 7 },
            { id: 'user-sleephacker-99', displayName: 'SleepHacker_99', email: 'sh99@example.com', level: 18, totalXp: 9200, isAdmin: false, isBanned: false, referralCount: 5, badges: [], publishedStacks: [], sharedProtocols: [], created_at: new Date(), pvpRank: 'Silver II', pvpRating: 1300, pvpWins: 25, pvpLosses: 18 },
            { id: 'dev-super-user', displayName: 'Super User (Admin)', email: 'superuser@example.com', level: 12, totalXp: 4000, isAdmin: true, isBanned: false, referralCount: 25, badges: [], publishedStacks: [], sharedProtocols: [], created_at: new Date(), pvpRank: 'Bronze I', pvpRating: 1150, pvpWins: 10, pvpLosses: 5 },
            { id: 'user_4', displayName: 'QuantumLeaper', email: 'ql@example.com', level: 17, totalXp: 8550, isAdmin: false, isBanned: true, referralCount: 2, badges: [], publishedStacks: [], sharedProtocols: [], created_at: new Date(), pvpRank: 'Silver III', pvpRating: 1220, pvpWins: 20, pvpLosses: 15 },
        ];
        set({ allUsers: mockUsers });
        return;
    }
    log('INFO', 'fetchAllUsers: Fetching all user profiles for admin.');
    try {
        const profilesCollection = db.collection('profiles');
        const profilesSnap = await profilesCollection.get();
        const users = profilesSnap.docs.map(doc => {
            const data = doc.data();
            const totalXp = data.total_xp || 0;
            const level = getLevelFromXp(totalXp);
            return {
                id: doc.id,
                displayName: data.displayName || 'Anonymous',
                email: data.email || 'N/A',
                level: level,
                totalXp: totalXp,
                created_at: data.created_at,
                isAdmin: data.is_admin || false,
                isBanned: data.is_banned || false,
                referralCount: data.referralCount || 0,
                pvpRank: data.pvp_rank || 'Unranked',
                pvpRating: data.pvp_rating || 1000,
                pvpWins: data.pvp_wins || 0,
                pvpLosses: data.pvp_losses || 0,
                badges: [], 
                publishedStacks: [],
                sharedProtocols: [],
            } as PublicUserProfile;
        });
        set({ allUsers: users });
        log('SUCCESS', 'fetchAllUsers: Successfully fetched all users.', { count: users.length });
    } catch (error) {
        log('ERROR', 'fetchAllUsers: Failed to fetch users.', { error });
        console.error("Error fetching all users:", error);
    }
  },

  updateStackVote: async (id: string, direction: 'up' | 'down') => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'updateStackVote: Attempting to vote.', { stackId: id, direction });
    const increment = direction === 'up' ? 1 : -1;
    set(state => ({
        communityStacks: state.communityStacks.map(s => s.id === id ? {...s, upvotes: s.upvotes + increment} : s)
    }));
    try {
        const stackRef = db.collection('community_stacks').doc(id);
        await stackRef.update({
            upvotes: firebase.firestore.FieldValue.increment(increment)
        });
        log('SUCCESS', 'updateStackVote: Vote successful.', { stackId: id });
    } catch (error) {
        log('ERROR', 'updateStackVote: Vote failed, reverting.', { stackId: id, error });
        set(state => ({
            communityStacks: state.communityStacks.map(s => s.id === id ? {...s, upvotes: s.upvotes - increment} : s)
        }));
        console.error("Error updating stack vote:", error);
    }
  },

  submitProtocol: async (protocolData) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    if (!isFirebaseEnabled) {
        toast.success("Submit Protocol (Simulated)");
        return;
    }
    
    log('INFO', 'submitProtocol: Attempting to submit new protocol.', { name: protocolData.name });
    try {
        const newDocRef = db.collection("protocols").doc();
        const newId = newDocRef.id;

        const newProtocol: Protocol = {
            ...protocolData,
            id: newId,
            isCommunity: true,
            submittedBy: useUserStore.getState().displayName || 'Anonymous',
            user_id: user.uid,
        }
        
        await newDocRef.set(newProtocol);

        const protocolWithScore = { ...newProtocol, bioScore: generateBioScore(newProtocol) };
        const newProtocolWithStats = { ...protocolWithScore, gameStats: generateGameStats(protocolWithScore as Protocol) };
        set(state => ({ protocols: [...state.protocols, newProtocolWithStats].sort((a,b) => Number(a.id) - Number(b.id)) }));
        log('SUCCESS', 'submitProtocol: Submission successful.', { protocolId: newId });
    } catch (error) {
        log('ERROR', 'submitProtocol: Submission failed.', { error });
        console.error("Error submitting protocol:", error);
    }
  },

  updateProtocol: async (protocolData) => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'updateProtocol: Attempting to update protocol.', { protocolId: protocolData.id });
    try {
      const docRef = db.collection("protocols").doc(String(protocolData.id));
      await docRef.update(protocolData);

      set(state => ({
        protocols: state.protocols.map(p => {
          if (p.id === protocolData.id) {
            const updatedP = { ...p, ...protocolData };
            const withScore = { ...updatedP, bioScore: generateBioScore(updatedP) };
            return { ...withScore, gameStats: generateGameStats(withScore as Protocol) };
          }
          return p;
        })
      }));
      log('SUCCESS', 'updateProtocol: Update successful.', { protocolId: protocolData.id });
    } catch (error) {
      log('ERROR', 'updateProtocol: Update failed.', { protocolId: protocolData.id, error });
      console.error("Error updating protocol:", error);
    }
  },

  deleteProtocol: async (protocolId: string) => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'deleteProtocol: Deleting protocol.', { protocolId });
    try {
        await db.collection('protocols').doc(protocolId).delete();
        set(state => ({
            protocols: state.protocols.filter(p => p.id !== protocolId)
        }));
        log('SUCCESS', 'deleteProtocol: Deletion successful.');
        toast.success('Protocol deleted.');
    } catch (error) {
        log('ERROR', 'deleteProtocol: Deletion failed.', { error });
        console.error("Error deleting protocol:", error);
        toast.error('Failed to delete protocol.');
    }
  },
  
  createPersonalizedProtocol: async (protocolData: Protocol) => {
    const user = useUserStore.getState().user;
    if (!user) {
      log('WARN', 'createPersonalizedProtocol: User not logged in.');
      console.error("User must be logged in to create a personalized protocol.");
      return;
    }
    
    if (!isFirebaseEnabled) {
        const newProtocolData: Protocol = { ...protocolData, id: `pers-${crypto.randomUUID()}`, isPersonalized: true, user_id: user.uid };
        const protocolWithScore = { ...newProtocolData, bioScore: generateBioScore(newProtocolData) };
        const newProtocolWithStats = { ...protocolWithScore, gameStats: generateGameStats(protocolWithScore as Protocol) };
        set(state => ({ protocols: [...state.protocols, newProtocolWithStats] }));
        toast.success("Personalized protocol created (Simulated)");
        return;
    }

    log('INFO', 'createPersonalizedProtocol: Creating new personalized protocol.', { name: protocolData.name });
    try {
      const newDocRef = db.collection(`profiles/${user.uid}/personalized_protocols`).doc();
      const newProtocolData: Protocol = {
          ...protocolData,
          id: newDocRef.id, // Use the new document's ID
          isPersonalized: true,
          user_id: user.uid,
      };

      await newDocRef.set(newProtocolData);

      const protocolWithScore = { ...newProtocolData, bioScore: generateBioScore(newProtocolData) };
      const newProtocolWithStats = { ...protocolWithScore, gameStats: generateGameStats(protocolWithScore as Protocol) };

      set(state => ({
          protocols: [...state.protocols, newProtocolWithStats]
      }));
      log('SUCCESS', 'createPersonalizedProtocol: Creation successful.', { protocolId: newProtocolData.id });
    } catch (error) {
      log('ERROR', 'createPersonalizedProtocol: Creation failed.', { error });
      console.error("Error creating personalized protocol:", error);
    }
  },

  shareProtocolToCommunity: async (protocol: Protocol) => {
    const user = useUserStore.getState().user;
    if (!isFirebaseEnabled || !user) return;
    log('INFO', 'shareProtocolToCommunity: Sharing protocol.', { protocolId: protocol.id });
    try {
        const batch = db.batch();

        const newPublicProtocolRef = db.collection('protocols').doc();
        const publicProtocolData: Protocol = {
            ...protocol,
            id: newPublicProtocolRef.id,
            isCommunity: true,
            isPersonalized: false,
            isShared: false, 
            submittedBy: useUserStore.getState().displayName || 'Anonymous',
            user_id: user.uid,
        };
        batch.set(newPublicProtocolRef, publicProtocolData);

        const personalizedProtocolRef = db.collection(`profiles/${user.uid}/personalized_protocols`).doc(protocol.id);
        batch.update(personalizedProtocolRef, { isShared: true });
        
        const userProfileRef = db.collection('profiles').doc(user.uid);
        batch.update(userProfileRef, { shared_protocol_count: firebase.firestore.FieldValue.increment(1) });
        
        await batch.commit();

        const protocolWithScore = { ...publicProtocolData, bioScore: generateBioScore(publicProtocolData) };
        const newProtocolWithStats = { ...protocolWithScore, gameStats: generateGameStats(protocolWithScore as Protocol) };
        set(state => ({
            protocols: [
                ...state.protocols.map(p => p.id === protocol.id ? { ...p, isShared: true } : p),
                newProtocolWithStats
            ]
        }));
        useUserStore.setState(state => ({ sharedProtocolCount: state.sharedProtocolCount + 1 }));
        log('SUCCESS', 'shareProtocolToCommunity: Share successful.', { newProtocolId: newPublicProtocolRef.id });
    } catch (error) {
        log('ERROR', 'shareProtocolToCommunity: Share failed.', { error });
        console.error("Error sharing protocol to community:", error);
    }
  },

  publishStack: async (name, description, protocol_ids, forked_from_id, forked_from_name, productIds) => {
    if (!isFirebaseEnabled) {
        toast.success("Stack published (Simulated)");
        const newStack: CommunityStack = {
            id: `cs-${crypto.randomUUID()}`,
            name,
            description,
            protocol_ids,
            productIds,
            forked_from_id,
            forked_from_name,
            author: useUserStore.getState().displayName || 'Anonymous',
            upvotes: 0,
            created_at: new Date(),
            user_id: useUserStore.getState().user?.uid,
        };
        set(state => ({
            communityStacks: [newStack, ...state.communityStacks]
        }));
        return;
    }
    log('INFO', 'publishStack: Publishing new stack.', { name });
    try {
        const newStack = {
            name,
            description,
            protocol_ids,
            productIds,
            forked_from_id,
            forked_from_name,
            author: useUserStore.getState().displayName || 'Anonymous',
            upvotes: 0,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            user_id: useUserStore.getState().user?.uid,
        };
        const docRef = await db.collection('community_stacks').add(newStack);
        
        set(state => ({ communityStacks: [{ ...newStack, id: docRef.id, upvotes: 0 }, ...state.communityStacks] }));
        log('SUCCESS', 'publishStack: Publish successful.', { stackId: docRef.id });
    } catch(error) {
        log('ERROR', 'publishStack: Publish failed.', { error });
        console.error("Error publishing stack:", error);
    }
  },

  generatePromoCode: async (protocolId: string, maxUses: number) => {
    const { user, displayName } = useUserStore.getState();
    if (!isFirebaseEnabled || !user) return;
    
    const code = 'SPECIAL-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    log('INFO', 'generatePromoCode: Generating new promo code.', { protocolId, code });
    
    const newCode: Omit<PromoCode, 'id'> = {
        code,
        protocolId,
        usesLeft: maxUses,
        maxUses,
        adminId: user.uid,
        adminDisplayName: displayName || 'Admin',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const docRef = await db.collection('promo_codes').add(newCode);
        set(state => ({ promoCodes: [...state.promoCodes, { ...newCode, id: docRef.id, createdAt: new Date() }] }));
        log('SUCCESS', 'generatePromoCode: Generation successful.');
    } catch (error) {
        log('ERROR', 'generatePromoCode: Generation failed.', { error });
        console.error("Error generating promo code:", error);
    }
  },

  deletePromoCode: async (codeId: string) => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'deletePromoCode: Deleting promo code.', { codeId });
    try {
        await db.collection('promo_codes').doc(codeId).delete();
        set(state => ({
            promoCodes: state.promoCodes.filter(c => c.id !== codeId)
        }));
        log('SUCCESS', 'deletePromoCode: Deletion successful.');
    } catch (error) {
        log('ERROR', 'deletePromoCode: Deletion failed.', { error });
        console.error("Error deleting promo code:", error);
    }
  },

  deleteCommunityStack: async (stackId: string) => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'deleteCommunityStack: Deleting stack.', { stackId });
    try {
        await db.collection('community_stacks').doc(stackId).delete();
        set(state => ({
            communityStacks: state.communityStacks.filter(s => s.id !== stackId)
        }));
        log('SUCCESS', 'deleteCommunityStack: Deletion successful.');
    } catch (error) {
        log('ERROR', 'deleteCommunityStack: Deletion failed.', { error });
        console.error("Error deleting stack:", error);
    }
  },

  fetchPublicProfile: async (userId: string) => {
    if (!isFirebaseEnabled) {
        log('WARN', 'fetchPublicProfile: Firebase is not enabled. Cannot fetch profile.');
        return null;
    }
    log('INFO', 'fetchPublicProfile: Fetching profile for user', { userId });
    try {
        const profileRef = db.collection('profiles').doc(userId);
        const stacksQuery = db.collection('community_stacks').where('user_id', '==', userId);
        const protocolsQuery = db.collection('protocols').where('user_id', '==', userId).where('isCommunity', '==', true);

        const [profileSnap, stacksSnap, protocolsSnap] = await Promise.all([
            profileRef.get(),
            stacksQuery.get(),
            protocolsQuery.get(),
        ]);

        if (!profileSnap.exists) {
            log('WARN', 'fetchPublicProfile: Profile not found in Firestore.', { userId });
            return null;
        }

        const profileData = profileSnap.data();
        if (!profileData) {
            log('WARN', 'fetchPublicProfile: Profile data is empty.', { userId });
            return null;
        }
        
        const allBadges = get().badges;
        const level = getLevelFromXp(profileData.total_xp || 0);

        const publicProfile: PublicUserProfile = {
            id: userId,
            displayName: profileData.displayName || 'Anonymous Biohacker',
            level: level,
            totalXp: profileData.total_xp || 0,
            badges: allBadges.filter(b => b.level <= level),
            publishedStacks: stacksSnap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityStack)),
            sharedProtocols: protocolsSnap.docs.map(d => d.data() as Protocol),
            email: profileData.email,
            created_at: profileData.created_at,
        };

        return publicProfile;
    } catch (error) {
        log('ERROR', 'fetchPublicProfile: Error fetching from Firestore.', { userId, error });
        console.error("Error fetching public profile:", error);
        return null;
    }
  },
  
  setPlatformAnnouncement: async (message: string, isActive: boolean) => {
      if (!isFirebaseEnabled) {
          const newAnnouncement: PlatformAnnouncement = {
              id: 'announcement',
              message,
              isActive,
              updatedAt: new Date(),
          };
          set({ platformAnnouncement: newAnnouncement });
          toast.success("Platform announcement updated (Simulated).");
          log('INFO', 'setPlatformAnnouncement: Setting announcement (simulated).', { isActive });
          return;
      }
      log('INFO', 'setPlatformAnnouncement: Setting announcement.', { isActive });
      try {
          const announcementRef = db.collection('platform').doc('announcement');
          const newAnnouncement: Omit<PlatformAnnouncement, 'id'> = {
              message,
              isActive,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          };
          await announcementRef.set(newAnnouncement);
          set({ platformAnnouncement: { ...newAnnouncement, id: 'announcement', updatedAt: new Date() } });
          log('SUCCESS', 'setPlatformAnnouncement: Announcement updated.');
      } catch (error) {
          log('ERROR', 'setPlatformAnnouncement: Failed to update.', { error });
          console.error("Error setting announcement:", error);
          toast.error("Failed to set announcement.");
      }
  },

  toggleUserAdminStatus: async (userId: string, currentStatus: boolean) => {
      if (!isFirebaseEnabled) return;
      log('INFO', 'toggleUserAdminStatus: Updating admin status.', { userId, newStatus: !currentStatus });
      try {
          const userRef = db.collection('profiles').doc(userId);
          await userRef.update({ is_admin: !currentStatus });
          set(state => ({ allUsers: state.allUsers.map(u => u.id === userId ? { ...u, isAdmin: !currentStatus } : u) }));
      } catch (error) {
          log('ERROR', 'toggleUserAdminStatus: Update failed.', { error });
          toast.error("Failed to update user status.");
      }
  },
  
  banUser: async (userId: string) => {
      if (!isFirebaseEnabled) return;
      log('INFO', 'banUser: Banning user.', { userId });
      try {
          const userRef = db.collection('profiles').doc(userId);
          await userRef.update({ is_banned: true });
          set(state => ({ allUsers: state.allUsers.map(u => u.id === userId ? { ...u, isBanned: true } : u) }));
      } catch (error) {
          log('ERROR', 'banUser: Ban failed.', { error });
          toast.error("Failed to ban user.");
      }
  },

  processReferral: async (referrerId: string) => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'processReferral: Processing referral.', { referrerId });
    const rewardAmount = get().platformConfig?.referralXpReward || 50; // Default to 50 XP
    
    try {
        const referrerRef = db.collection('profiles').doc(referrerId);
        
        await db.runTransaction(async (transaction) => {
            const referrerDoc = await transaction.get(referrerRef);
            if (!referrerDoc.exists) {
                throw new Error("Referrer not found");
            }
            
            const currentXp = referrerDoc.data()?.total_xp || 0;
            const newTotalXp = currentXp + rewardAmount;
            
            transaction.update(referrerRef, {
                referralCount: firebase.firestore.FieldValue.increment(1),
                total_xp: newTotalXp,
            });
        });

        toast.success(`Your referrer was awarded ${rewardAmount} XP!`, { icon: '🎁' });
        log('SUCCESS', 'processReferral: Referrer awarded XP.', { referrerId, rewardAmount });
    } catch (error) {
        log('ERROR', 'processReferral: Failed.', { referrerId, error });
    }
  },

  updatePlatformConfig: async (config: Partial<PlatformConfig>) => {
    if (!isFirebaseEnabled) {
        log('INFO', 'updatePlatformConfig: Updating platform config (simulated).', { config });
        set(state => ({
          platformConfig: {
            ...(state.platformConfig || { referralXpReward: 50, isStoreEnabled: false, isAiEnabled: true, weeklyMission: null }),
            ...config
          }
        }));
        toast.success("Platform settings updated (Simulated).");
        return;
    }
    log('INFO', 'updatePlatformConfig: Updating platform config.', { config });
    try {
        const configRef = db.collection('platform').doc('config');
        await configRef.set(config, { merge: true });
        
        const currentConfig = get().platformConfig || { isStoreEnabled: false, referralXpReward: 50, isAiEnabled: true, weeklyMission: null };
        const newConfigData = { ...currentConfig, ...config };
        set({ platformConfig: newConfigData });
        
        log('SUCCESS', 'updatePlatformConfig: Success.');
    } catch(error) {
        log('ERROR', 'updatePlatformConfig: Failed.', { error });
        toast.error('Failed to update config.');
        throw error;
    }
  },

  setWeeklyMission: async (mission) => {
     if (!isFirebaseEnabled) {
        const newMission = { ...get().weeklyMission, ...mission } as WeeklyMission;
        set({ weeklyMission: newMission });
        const currentConfig = get().platformConfig || { referralXpReward: 50, isStoreEnabled: false, isAiEnabled: true, weeklyMission: null };
        set({ platformConfig: { ...currentConfig, weeklyMission: newMission } });
        toast.success("Weekly mission set (Simulated).");
        log('INFO', 'setWeeklyMission: Setting weekly mission (simulated).');
        return;
     }
    log('INFO', 'setWeeklyMission: Setting weekly mission.');
    try {
        const configRef = db.collection('platform').doc('config');
        await configRef.set({ weeklyMission: mission }, { merge: true });
        set({ weeklyMission: { ...get().weeklyMission, ...mission } as WeeklyMission });
        log('SUCCESS', 'setWeeklyMission: Success.');
        toast.success('Weekly mission has been set!');
    } catch(error) {
        log('ERROR', 'setWeeklyMission: Failed.', { error });
        toast.error('Failed to set mission.');
    }
  },

  updateFeaturedContent: async (content) => {
    if (!isFirebaseEnabled) return;
    log('INFO', 'updateFeaturedContent: Updating featured content.');
    try {
        const featuredRef = db.collection('platform').doc('featured_content');
        await featuredRef.set(content);
        set({ featuredContent: content });
        toast.success('Featured content updated successfully!');
        log('SUCCESS', 'updateFeaturedContent: Success.');
    } catch(error) {
        log('ERROR', 'updateFeaturedContent: Failed.', { error });
        toast.error('Failed to update featured content.');
    }
  },
  
  toggleStackVerification: async (stackId: string, currentStatus: boolean) => {
    if (!isFirebaseEnabled) {
        const newStatus = !currentStatus;
        set(state => ({
            communityStacks: state.communityStacks.map(s => s.id === stackId ? { ...s, isVerified: newStatus } : s)
        }));
        toast.success("Stack verification updated (Simulated).");
        return;
    }
    const newStatus = !currentStatus;
    log('INFO', 'toggleStackVerification', { stackId, newStatus });
    set(state => ({
        communityStacks: state.communityStacks.map(s => s.id === stackId ? { ...s, isVerified: newStatus } : s)
    }));
    try {
        const stackRef = db.collection('community_stacks').doc(stackId);
        await stackRef.update({ isVerified: newStatus });
        toast.success(`Stack verification status updated!`);
    } catch (error) {
        log('ERROR', 'toggleStackVerification failed, reverting.', { error });
        set(state => ({
            communityStacks: state.communityStacks.map(s => s.id === stackId ? { ...s, isVerified: currentStatus } : s)
        }));
        toast.error('Failed to update verification status.');
    }
  },

  createResearchBounty: async (bountyData, initialStake, productId) => {
    const { user, displayName, spendBioTokens } = useUserStore.getState();
    if (!user || user.isAnonymous) {
      toast.error("You must be signed in to create a bounty.");
      return;
    }

    try {
        await spendBioTokens(initialStake, `Created bounty: "${bountyData.question}"`);

        if (!isFirebaseEnabled) {
            const newBounty: ResearchBounty = {
                ...bountyData,
                id: `bounty-${crypto.randomUUID()}`,
                user_id: user.uid,
                author: displayName || 'Anonymous',
                totalStake: initialStake,
                stakers: { [user.uid]: initialStake },
                createdAt: new Date(),
                status: 'active',
                results: null,
                productId,
            };
            set(state => ({ researchBounties: [newBounty, ...state.researchBounties] }));
            return;
        }

        const newBounty: Omit<ResearchBounty, 'id'> = {
            ...bountyData,
            user_id: user.uid,
            author: displayName || 'Anonymous',
            totalStake: initialStake,
            stakers: { [user.uid]: initialStake },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            results: null,
            productId,
        };
        const docRef = await db.collection('research_bounties').add(newBounty);
        set(state => ({ researchBounties: [{ ...newBounty, id: docRef.id, createdAt: new Date() }, ...state.researchBounties].sort((a, b) => b.totalStake - a.totalStake) }));
        
    } catch (error) {
        log('ERROR', 'createResearchBounty failed.', { error });
        toast.error(error instanceof Error ? error.message : "Failed to create bounty.");
        // Note: In a real app, you'd need logic to refund tokens if the DB write fails after the token spend.
    }
  },

  stakeOnBounty: async (bountyId, amount) => {
    const { user, spendBioTokens } = useUserStore.getState();
    if (!user || user.isAnonymous) {
      toast.error("You must be signed in to stake on a bounty.");
      return;
    }
    const bounty = get().researchBounties.find(b => b.id === bountyId);
    if (!bounty) {
      toast.error("Bounty not found.");
      return;
    }

    try {
        await spendBioTokens(amount, `Staked on bounty: "${bounty.question}"`);

        if (!isFirebaseEnabled) {
            set(state => ({
                researchBounties: state.researchBounties.map(b => {
                    if (b.id === bountyId) {
                        return {
                            ...b,
                            totalStake: b.totalStake + amount,
                            stakers: { ...b.stakers, [user.uid]: (b.stakers[user.uid] || 0) + amount },
                        };
                    }
                    return b;
                }).sort((a, b) => b.totalStake - a.totalStake)
            }));
            return;
        }

        const bountyRef = db.collection('research_bounties').doc(bountyId);
        await bountyRef.update({
            totalStake: firebase.firestore.FieldValue.increment(amount),
            [`stakers.${user.uid}`]: firebase.firestore.FieldValue.increment(amount),
        });

        // Re-fetch or update local state for real-time feel
        set(state => ({
            researchBounties: state.researchBounties.map(b => 
                b.id === bountyId ? { ...b, totalStake: b.totalStake + amount, stakers: {...b.stakers, [user.uid]: (b.stakers[user.uid] || 0) + amount} } : b
            ).sort((a, b) => b.totalStake - a.totalStake)
        }));

    } catch (error) {
        log('ERROR', 'stakeOnBounty failed.', { error });
        toast.error(error instanceof Error ? error.message : "Failed to stake on bounty.");
    }
  },
  
  resolveBounty: async (bountyId, results) => {
    toast.success("Bounty resolved (Simulated).");
    set(state => ({
        researchBounties: state.researchBounties.map(b => 
            b.id === bountyId ? { ...b, status: 'completed', results } : b
        )
    }));

    if (!isFirebaseEnabled) return;
    try {
        const bountyRef = db.collection('research_bounties').doc(bountyId);
        await bountyRef.update({ status: 'completed', results });
    } catch (error) {
        log('ERROR', 'resolveBounty failed.', { error });
        toast.error("Failed to resolve bounty on backend.");
    }
  },

  getPlatformAnalytics: async () => {
    // This is a simulation. In a real app, this would query a dedicated analytics backend.
    log('INFO', 'getPlatformAnalytics: Fetching simulated platform analytics.');
    const { allUsers, communityStacks } = get();

    const dau = Math.floor(allUsers.length * 0.4) + 50;
    const mau = Math.floor(allUsers.length * 0.8) + 200;
    const newUsers = Math.floor(allUsers.length * 0.1) + 10;
    const churnRate = 5.2;
    const protocolsLogged = dau * 2 + Math.floor(Math.random() * 100);
    const topContributor = allUsers.sort((a,b) => (b.referralCount || 0) - (a.referralCount || 0))[0]?.displayName || 'N/A';
    const mostPopularStack = communityStacks.sort((a,b) => b.upvotes - a.upvotes)[0]?.name || 'N/A';
    
    // Simulate a funnel
    const totalUsers = allUsers.length > 0 ? allUsers.length : 250; // Ensure not zero
    const newCount = Math.floor(totalUsers * 0.2);
    const activatedCount = Math.floor(totalUsers * 0.5);
    const engagedCount = Math.floor(totalUsers * 0.25);
    const advocateCount = Math.floor(totalUsers * 0.05);

    const userFunnel: UserFunnelSegment[] = [
      { stage: 'New', count: newCount, percentage: (newCount/totalUsers) * 100 },
      { stage: 'Activated', count: activatedCount, percentage: (activatedCount/totalUsers) * 100 },
      { stage: 'Engaged', count: engagedCount, percentage: (engagedCount/totalUsers) * 100 },
      { stage: 'Advocate', count: advocateCount, percentage: (advocateCount/totalUsers) * 100 },
    ];

    return {
      dau,
      mau,
      newUsers,
      churnRate,
      protocolsLogged,
      topContributor,
      mostPopularStack,
      userFunnel,
    };
  },

  submitFeedback: async (feedbackData) => {
    const { user, displayName } = useUserStore.getState();
    if (!user || user.isAnonymous) {
        toast.error("You must be signed in to submit feedback.");
        return;
    }
    const newFeedback: Omit<Feedback, 'id'> = {
        ...feedbackData,
        user_id: user.uid,
        userDisplayName: displayName || 'Anonymous',
        timestamp: new Date(),
    };
    if (!isFirebaseEnabled) {
        const fullFeedback = { ...newFeedback, id: `fb-${crypto.randomUUID()}` } as Feedback;
        set(state => ({ feedback: [fullFeedback, ...state.feedback] }));
        toast.success("Feedback submitted (Simulated).");
        return;
    }
    
    try {
        const docRef = await db.collection('feedback').add({
            ...newFeedback,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        const fullFeedback = { ...newFeedback, id: docRef.id, timestamp: new Date() } as Feedback;
        set(state => ({ feedback: [fullFeedback, ...state.feedback] }));
        toast.success("Thank you for your feedback!");
    } catch (error) {
        log('ERROR', 'submitFeedback failed', { error });
        toast.error("Failed to submit feedback.");
    }
  },
  // Product Management
  addProduct: async (productData) => {
    toast.success("Product added (Simulated).");
    const newProduct: Product = { ...productData, id: `prod_${crypto.randomUUID()}` };
    set(state => ({ products: [newProduct, ...state.products] }));
  },
  updateProduct: async (productData) => {
    toast.success("Product updated (Simulated).");
    set(state => ({
        products: state.products.map(p => p.id === productData.id ? productData : p)
    }));
  },
  deleteProduct: async (productId) => {
    toast.success("Product deleted (Simulated).");
    set(state => ({ products: state.products.filter(p => p.id !== productId) }));
  },
  decrementProductInventory: (productId, amount) => {
    set(state => ({
        products: state.products.map(p => 
            p.id === productId ? { ...p, inventory: Math.max(0, p.inventory - amount) } : p
        )
    }));
  },
  giftProductToUser: async (userId, productId) => {
      const { products, decrementProductInventory } = get();
      const product = products.find(p => p.id === productId);
      if (!product) {
          toast.error("Product not found.");
          return;
      }
      if (product.inventory <= 0) {
          toast.error("This product is out of stock.");
          return;
      }
      
      decrementProductInventory(productId, 1);
      
      log('SUCCESS', 'giftProductToUser (Simulated)', { userId, productId, productName: product.name });
      toast.success(`Gifted ${product.name} successfully!`);
  },
  // E-commerce Command Center
  updateOrderStatus: (orderId, status, trackingNumber) => {
    set(state => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status, trackingNumber: trackingNumber || o.trackingNumber } : o)
    }));
    toast.success(`Order ${orderId} status updated to ${status}.`);
  },
  createCoupon: (couponData) => {
    const newCoupon: Coupon = {
        ...couponData,
        id: `coupon_${crypto.randomUUID()}`,
        uses: 0,
        isActive: true,
    };
    set(state => ({ coupons: [newCoupon, ...state.coupons] }));
    toast.success(`Coupon "${newCoupon.code}" created.`);
  },
  // Content & Acquisition
  updateContentSeo: (type, id, seoData) => {
    if (type === 'protocol') {
      set(state => ({
        protocols: state.protocols.map(p => p.id === id ? { ...p, ...seoData } : p)
      }));
    } else {
      set(state => ({
        communityStacks: state.communityStacks.map(s => s.id === id ? { ...s, ...seoData } : s)
      }));
    }
    toast.success(`SEO data for ${type} ${id} updated.`);
  },
  // Operations & Intelligence
  createUserSegment: (segmentData) => {
    const newUserSegment: UserSegment = {
        ...segmentData,
        id: `seg_${crypto.randomUUID()}`,
        userCount: Math.floor(Math.random() * get().allUsers.length), // Simulate user count
    };
    set(state => ({ userSegments: [newUserSegment, ...state.userSegments] }));
    toast.success(`User segment "${newUserSegment.name}" created.`);
  },
  createABTest: async (testData) => {
    const newTest: ABTest = {
        ...testData,
        id: `ab_${crypto.randomUUID()}`,
        status: 'active',
        winner: null,
    };
    set(state => ({ abTests: [newTest, ...state.abTests] }));
    toast.success(`A/B Test "${newTest.name}" created and is now active.`);
  },
  // Growth Engine Integrations
  connectSocialMedia: async (platform) => {
    set(state => ({
      socialIntegrations: state.socialIntegrations.map(si => 
        si.platform === platform ? { ...si, isConnected: !si.isConnected } : si
      )
    }));
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection toggled (Simulated).`);
  },
  postToSocialMedia: async (message) => {
    toast.success("Posted to connected social channels (Simulated).");
  },
  sendEmailBlast: async (subject, body) => {
    set(state => ({
      mailingListStats: {
        ...state.mailingListStats,
        lastBlastDate: new Date().toISOString(),
      }
    }));
    toast.success("Email blast sent to subscribers (Simulated).");
  },
  addToMailingList: async (email) => {
      // Normalize and validate email
      if (!email || typeof email !== 'string') {
          toast.error("Please enter a valid email address.");
          return;
      }
      const normalized = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalized)) {
          toast.error("Please enter a valid email address.");
          return;
      }

      // If Firebase is enabled, persist to Firestore and guard against duplicates there
      if (isFirebaseEnabled) {
          try {
              const mailingRef = db.collection('mailing_list');

              // Create a privacy-preserving hashed doc id from the normalized email.
              const sha256Hex = async (str: string) => {
                  // Use SubtleCrypto if available (browser / modern Node), otherwise fallback to a simple JS impl.
                  const toHex = (buffer: ArrayBuffer) => Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
                  if (typeof (globalThis as any).crypto !== 'undefined' && (globalThis as any).crypto.subtle) {
                      const enc = new TextEncoder();
                      const digest = await (globalThis as any).crypto.subtle.digest('SHA-256', enc.encode(str));
                      return toHex(digest);
                  }
                  // Fallback (pure JS) - minimal SHA-256 implementation using built-in 'crypto' in Node if available
                  try {
                      // @ts-ignore
                      const nodeCrypto = require('crypto');
                      return nodeCrypto.createHash('sha256').update(str).digest('hex');
                  } catch (e) {
                      // Last resort: a very small JS SHA-256 (not expecting to run often)
                      const jsSha256 = (s: string) => {
                          // Very small, non-optimized SHA-256 adapted from public domain snippets. For CI/local testing only.
                          const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
                          const rightRotate = (n:number, x:number) => (x >>> n) | (x << (32 - n));
                          let msg = unescape(encodeURIComponent(s));
                          const l = msg.length;
                          const words = [] as number[];
                          for (let i = 0; i < l; i++) words[i >> 2] |= (msg.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
                          words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
                          words[((l + 8) >> 6) * 16 + 15] = l * 8;
                          const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
                          for (let j = 0; j < words.length; j += 16) {
                              const W = new Array(64);
                              for (let i = 0; i < 16; i++) W[i] = words[j + i] | 0;
                              for (let i = 16; i < 64; i++) {
                                  const s0 = rightRotate(7, W[i-15]) ^ rightRotate(18, W[i-15]) ^ (W[i-15] >>> 3);
                                  const s1 = rightRotate(17, W[i-2]) ^ rightRotate(19, W[i-2]) ^ (W[i-2] >>> 10);
                                  W[i] = (W[i-16] + s0 + W[i-7] + s1) | 0;
                              }
                              let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
                              for (let i = 0; i < 64; i++) {
                                  const S1 = rightRotate(6, e) ^ rightRotate(11, e) ^ rightRotate(25, e);
                                  const ch = (e & f) ^ (~e & g);
                                  const temp1 = (h + S1 + ch + K[i] + W[i]) | 0;
                                  const S0 = rightRotate(2, a) ^ rightRotate(13, a) ^ rightRotate(22, a);
                                  const maj = (a & b) ^ (a & c) ^ (b & c);
                                  const temp2 = (S0 + maj) | 0;
                                  h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
                              }
                              H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
                              H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
                          }
                          return H.map(h => ('00000000' + (h >>> 0).toString(16)).slice(-8)).join('');
                      };
                      return jsSha256(str);
                  }
              };

              const docId = await sha256Hex(normalized);
              const docRef = mailingRef.doc(docId);

              // Use a transaction to ensure the write is atomic and we don't overwrite existing entries.
              await db.runTransaction(async (tx: any) => {
                  const snap = await tx.get(docRef);
                  if (snap.exists) {
                      throw new Error('ALREADY_EXISTS');
                  }
                  tx.set(docRef, { email: normalized, subscribedAt: firebase.firestore.FieldValue.serverTimestamp() });
              });

              // Update local state with the new entry (use actual Date object locally)
              set(state => {
                  if (state.mailingList.some(entry => entry.email === normalized)) {
                      return state;
                  }
                  const newEntry: MailingListEntry = { email: normalized, subscribedAt: new Date() };
                  const newList = [newEntry, ...state.mailingList];
                  const newStats = { ...state.mailingListStats, subscriberCount: newList.length };
                  toast.success("You've been added to the waitlist!");
                  return { mailingList: newList, mailingListStats: newStats };
              });

              log('SUCCESS', 'addToMailingList: Added to Firestore mailing_list (transaction)', { docId, email: normalized });
              return;
          } catch (error: any) {
              if (error && error.message === 'ALREADY_EXISTS') {
                  toast.error('This email is already on the waitlist.');
                  return;
              }
              log('ERROR', 'addToMailingList: Firestore transaction failed', { error, email: normalized });
              toast.error('Failed to add to waitlist. Please try again later.');
              return;
          }
      }

      // Fallback: local state only
      set(state => {
          if (state.mailingList.some(entry => entry.email === normalized)) {
              toast.error("This email is already on the waitlist.");
              return state;
          }
          toast.success("You've been added to the waitlist!");
          const newEntry: MailingListEntry = { email: normalized, subscribedAt: new Date() };
          const newList = [newEntry, ...state.mailingList];
          const newStats = { ...state.mailingListStats, subscriberCount: newList.length };
          return { mailingList: newList, mailingListStats: newStats };
      });
  },
  addForgedProtocol: async (newNftProtocol, baseProtocol) => {
    log('INFO', 'addForgedProtocol: Adding new forged protocol to state.', { newNftId: newNftProtocol.id, baseProtocolId: baseProtocol.id });

    set(state => ({
        protocols: state.protocols.map(p => 
            p.id === baseProtocol.id 
            ? { ...p, forgedNftId: newNftProtocol.id } 
            : p
        )
    }));

    set(state => ({
        protocols: [...state.protocols, newNftProtocol]
    }));

    if (isFirebaseEnabled) {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
            const batch = db.batch();

            const newProtocolRef = db.collection('protocols').doc(newNftProtocol.id);
            batch.set(newProtocolRef, newNftProtocol);

            const personalizedProtocolRef = db.collection(`profiles/${user.uid}/personalized_protocols`).doc(baseProtocol.id);
            batch.update(personalizedProtocolRef, { forgedNftId: newNftProtocol.id });

            await batch.commit();
            log('SUCCESS', 'addForgedProtocol: Firestore updated successfully.');
        } catch (error) {
            log('ERROR', 'addForgedProtocol: Firestore update failed.', { error });
        }
    }
  },
    createBlogPost: (data) => {
        const id = `post_${Date.now()}`;
        const slugSource = data.slug || data.title || id;
        const slug = slugSource.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
        const now = new Date();
        const newPost: BlogPost = { id, slug, publishedAt: data.isDraft ? undefined : now, updatedAt: now, ...data } as any;
        set(state => ({ blogPosts: [...(state.blogPosts||[]), newPost] }));
        if (isFirebaseEnabled) {
            db.collection('blog_posts').doc(id).set({ ...newPost, publishedAt: newPost.publishedAt || null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
              .then(()=> toast.success('Blog post created'))
              .catch(err => { toast.error('Create failed'); log('ERROR','createBlogPost: Firestore write failed',{err}); });
        } else {
            toast.success('Blog post created');
        }
    },
    updateBlogPost: (id, data) => {
        set(state => ({ blogPosts: (state.blogPosts||[]).map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p) }));
        if (isFirebaseEnabled) {
            db.collection('blog_posts').doc(id).update({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
              .then(()=> toast.success('Blog post updated'))
              .catch(err => { toast.error('Update failed'); log('ERROR','updateBlogPost: Firestore update failed',{err}); });
        } else {
            toast.success('Blog post updated');
        }
    },
    deleteBlogPost: (id) => {
        // Prevent deletion of markdown seed posts
        const post = get().blogPosts?.find(p => p.id === id);
        if ((post as any)?.source === 'markdown') { toast.error('Markdown seed posts are read-only'); return; }
        set(state => ({ blogPosts: (state.blogPosts||[]).filter(p => p.id !== id) }));
        if (isFirebaseEnabled) {
            db.collection('blog_posts').doc(id).delete()
              .then(()=> toast.success('Blog post deleted'))
              .catch(err => { toast.error('Delete failed'); log('ERROR','deleteBlogPost: Firestore delete failed',{err}); });
        } else {
            toast.success('Blog post deleted');
        }
    },
    publishBlogPost: (id) => {
        const now = new Date();
        set(state => ({ blogPosts: (state.blogPosts||[]).map(p => p.id === id ? { ...p, isDraft: false, publishedAt: p.publishedAt || now, updatedAt: now } : p) }));
        if (isFirebaseEnabled) {
            db.collection('blog_posts').doc(id).update({ isDraft: false, publishedAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
              .then(()=> toast.success('Blog post published'))
              .catch(err => { toast.error('Publish failed'); log('ERROR','publishBlogPost: Firestore publish failed',{err}); });
        } else {
            toast.success('Blog post published');
        }
    },
  // New Gamification 2.0
  registerForTournament: async (tournamentId) => {
    useUserStore.getState().enrollInTournament(tournamentId);
  },
}));