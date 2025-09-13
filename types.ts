import React from 'react';

export type View = 
  | 'kai' 
  | 'explore' 
  | 'my-stack-lab'
  | 'settings' 
  | 'admin' 
  | 'coaching' 
  | 'store'
  | 'arena';

export type MyStackLabSubView = 'stack-x' | 'lab';
export type MyStackLabView = 'grid' | 'sequence';
export type KaiSubView = 'today' | 'progress' | 'avatar';
export type ExploreSubView = 'all' | 'protocols' | 'stacks' | 'journeys' | 'kairos';
export type CoachingMode = 'text' | 'pushToTalk' | 'handsFree';
export type ConsoleMode = 'text' | 'pushToTalk' | 'handsFree';
export type AdminTab = 'analytics' | 'users' | 'content' | 'growth-engine' | 'platform' | 'system-health' | 'store-management' | 'feedback' | 'launch-plan';
export type SettingsTab = 'account' | 'sovereignty' | 'integrations' | 'preferences' | 'diagnostics';
export type ArenaSubView = 'bio-duels' | 'synapse-arena' | 'genesis-forge' | 'tournaments' | 'marketplace';
export type GrowthEngineSubTab = 'dashboard' | 'ab-testing' | 'integrations';


export enum Category {
  Fasting = 'Fasting',
  ColdExposure = 'Cold Exposure',
  Breathwork = 'Breathwork',
  Movement = 'Movement',
  Sleep = 'Sleep',
  Mindfulness = 'Mindfulness',
  Nutrition = 'Nutrition',
  StressManagement = 'Stress Management',
  Light = 'Light',
  Sound = 'Sound',
  Longevity = 'Longevity',
  Cognitive = 'Cognitive',
  Energy = 'Energy',
}

export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum Wearable {
  Oura = 'Oura Ring',
  Whoop = 'WHOOP',
  AppleWatch = 'Apple Watch',
  Garmin = 'Garmin',
  Fitbit = 'Fitbit',
}

export type Theme = 'classic' | 'aura' | 'digital-human';

export type ProtocolMasteryLevel = 'Novice' | 'Adept' | 'Expert' | 'Master' | 'Grandmaster';

export interface ProtocolMastery {
  protocolId: string;
  streak: number;
  level: ProtocolMasteryLevel;
  xp: number;
  masteryPoints: number;
  forgedNftId?: string;
}

export type MasteryAbility = {
    name: string;
    description: string;
    effect: (duelState: any) => any; // Simplified for now
};

export type MasteryUnlock = 
  | { level: 'Adept' | 'Expert'; type: 'pacer_config'; config: { inhale: number; hold: number; exhale: number; holdAfter: number; } }
  | { level: 'Master'; type: 'kai_insight'; content: string; };

export interface Protocol {
  id: string;
  name: string;
  categories: Category[];
  difficulty: Difficulty;
  duration: string;
  description: string;
  creator: string;
  benefits: string[];
  instructions: string[];
  originStory: string;
  hasGuidedSession?: boolean;
  hasArGuide?: boolean;
  communityTip?: string;
  bioScore?: number;
  imageUrl?: string;
  isCommunity?: boolean;
  submittedBy?: string;
  user_id?: string; // For community submissions
  isSpecialEdition?: boolean;
  influencerImage?: string;
  influencerSignature?: string;
  theme?: Theme;
  isPersonalized?: boolean; // For user-customized protocols
  forked_from_id?: string; // For user-customized protocols
  forgedNftId?: string; // If personalized, this links to the created NFT ID
  isShared?: boolean; // For personalized protocols that have been shared
  milestones?: Array<{ name: string; hours: number; description: string; }>;
  interactiveElement?: 'pacer' | 'player' | 'wim-hof-guided';
  audioOptions?: Array<{ name: string; frequency: number; }>;
  isNft?: boolean;
  cohortId?: string;
  artist?: string;
  nftReward?: {
    protocolId: string;
    artist: string;
  };
  masteryUnlocks?: MasteryUnlock[];
  gameStats?: { attack: number; defense: number; };
  expertAbility?: MasteryAbility;
  masterAbility?: MasteryAbility;
  // New Game Mechanics
  staminaCost?: number;
  bioRhythmImpact?: number; // Positive for Sympathetic, Negative for Parasympathetic
  appliesStatusEffect?: { type: StatusEffectType; duration: number; value?: number; target: 'self' | 'opponent'; };
  primesCategory?: Category;
  powerUpWithBioRhythm?: { 
    zone: 'sympathetic' | 'parasympathetic'; 
    threshold: number; 
    effect: 'damage_boost' | 'heal'; 
    value: number 
  };
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  forgeTier?: 'Polished' | 'Artisan' | 'Genesis';
}

export interface JournalEntry {
  id?: string; // Changed to string for Firestore
  user_id?: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  energy: number; // 1-5
  focus: number; // 1-5
  notes?: string;
  completedProtocols: string[]; // Array of protocol IDs
}

export interface Goal {
  id: string;
  title: string;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isUnlocked: (stack: Protocol[], journal: JournalEntry[], streaks: Record<string, number>) => boolean;
  color?: string;
}

export interface Journey {
  id:string;
  name: string;
  description: string;
  duration: string;
  protocolIds: string[];
  isSpecialEdition?: boolean;
  enrollmentFee?: number; // In $BIO tokens
  influencer?: {
    name: string;
    image: string;
  };
  nftReward?: {
    protocolId: string;
    artist: string;
  };
}

export interface CommunityStack {
  id: string; // Changed to string for Firestore
  user_id?: string;
  author: string;
  name: string;
  description: string;
  protocol_ids: string[];
  productIds?: string[];
  upvotes: number;
  forked_from_id?: string; // Changed to string for Firestore
  forked_from_name?: string;
  created_at?: any; // To accommodate serverTimestamp
  isVerified?: boolean;
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

export interface UserStack {
  instanceId: string; // A unique ID for this instance in the user's stack
  type: 'stack';
  name: string;
  description: string;
  protocol_ids: string[];
  author: string; // The original author of the community stack
  forked_from_id: string; // The ID of the community stack it was forked from
  forked_from_name?: string;
}

export type PersistedUserStack = Omit<UserStack, 'type'>;
export type MyStackContent = (string | PersistedUserStack)[];


export interface CalendarEvent {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    time: string;
    title: string;
    type?: 'high-stakes' | 'deadline' | 'personal';
}

export interface ChatMessage {
  role: 'user' | 'kai';
  content: string;
  id?: string;
}

export type MintStatus = {
  status: 'pending_confirmation' | 'minting' | 'minted';
  txHash?: string;
  openSeaUrl?: string;
};

export type ZKProof = {
  id: string;
  type: 'Wellness Verification' | 'Research Contribution' | 'Community Access' | 'Research Eligibility';
  statement: string;
  proofData: string;
  verificationLink: string;
  timestamp: string;
};

export interface AuditEvent {
  id: string;
  agent: 'Kai-Analyst' | 'Kai-Planner' | 'Kai-Triage' | 'KAIROS-Engine';
  summary: string;
  dataSnapshotHash: string;
  txHash: string;
  timestamp: any; // Firestore timestamp
  user_id: string;
}

export interface PromoCode {
  id: string;
  code: string;
  protocolId: string;
  usesLeft: number;
  maxUses: number;
  adminId: string;
  adminDisplayName?: string;
  createdAt?: any;
}

// Digital Twin & Diagnostics Types
export type DiagnosticStatus = 'optimal' | 'borderline' | 'high' | 'low';

export interface DiagnosticMetric {
  name: string;
  unit: string;
  domain: 'Metabolic' | 'Inflammatory' | 'Physical';
  optimalRange: [number, number];
  borderlineHighRange?: [number, number];
  borderlineLowRange?: [number, number];
}

export interface DiagnosticModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  metrics: DiagnosticMetric[];
}

export interface DiagnosticDataPoint {
  metricName: string;
  value: number;
  unit: string;
  status: DiagnosticStatus;
  timestamp: string;
  domain: DiagnosticMetric['domain'];
}

// Structured AI Response Types
export interface TriageReportData {
  priorityMetric: string;
  value: string;
  status: DiagnosticStatus;
  insight: string;
  impact: string;
  recommendation: {
    protocolId: string;
    protocolName: string;
    rationale: string;
  } | null;
}

export interface BriefingData {
  analysis: string;
  predictiveInsight?: string;
  recommendations: {
    protocolId: string;
    protocolName: string;
    justification: string;
  }[];
  integration: string;
}

export interface CorrelationData {
  metric: string;
  change: 'increase' | 'decrease' | 'improvement' | 'decline';
  correlatedProtocol: string;
  insight: string;
  dataPoints: number;
}


// Gamification Types
export interface UserXP {
  current: number;
  nextLevel: number;
  synergyScore?: 'S' | 'A' | 'B' | 'C';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
}

export interface Mission {
  id: string;
  title: string;
  xp: number;
  isCompleted: (state: { myStack: (Protocol | UserStack)[], journalEntries: JournalEntry[], sharedProtocolCount: number }) => boolean;
}

export interface MysteryCache {
  id: string;
  awardedFor: string; // e.g., '7-Day Streak'
  opened: boolean;
  rewardXp?: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  level: number;
  xp: number;
  isKeyContributor?: boolean;
}

export interface CryptoTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: any;
}

export interface ProactiveKaiSuggestion {
  id: string;
  title: string;
  reason: string;
  protocolId: string;
  timestamp: string;
}

export interface JourneyProgress {
  journeyId: string;
  startDate: string; // ISO String
  currentDay: number;
  completed: boolean;
}

export interface ChallengeCard {
    id: string;
    name: string;
    description: string;
    hp: number;
    attack: number;
    imageUrl: string;
}

export type StatusEffectType = 'Focused' | 'Calm' | 'Energized' | 'Inflamed' | 'Fatigued';
export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number; // in turns
  value?: number;
}

export interface Combo {
  name: string;
  primeCategory: Category;
  triggerCategory: Category;
  effect: 'double_damage' | 'heal' | 'stun' | 'immune';
  effectValue?: number; // e.g., amount to heal
  effectDescription: string;
}

export interface DuelState {
    challenge?: ChallengeCard;
    opponent?: PublicUserProfile; // For PvP
    stake?: number; // For PvP (total pot)
    playerHp: number;
    opponentHp: number;
    maxPlayerHp: number;
    maxOpponentHp: number;
    turn: 'player' | 'opponent';
    hand: Protocol[];
    opponentHand: Protocol[];
    message: string | null;
    status: 'pending' | 'ongoing' | 'victory' | 'defeat';
    activeCombo?: Combo | null;
    // New Advanced Mechanics
    playerStamina: number;
    opponentStamina: number;
    bioRhythm: number; // -100 (Parasympathetic) to 100 (Sympathetic)
    playerStatusEffects: StatusEffect[];
    opponentStatusEffects: StatusEffect[];
    primedCategory: Category | null;
    // UI state
    ui: {
        attackingCardId: string | null;
        playerDamage: number | null;
        opponentDamage: number | null;
        screenEffect: 'shake' | null;
        playerVfx: { type: string, color?: string } | null;
        opponentVfx: { type: string, color?: string } | null;
    }
}

export type PlayCardPayload = {
    card: Protocol;
    isPlayer: boolean;
};

export type EndTurnPayload = {
    isPlayer: boolean;
};

export type InitializeDuelPayload = Partial<DuelState> & {
    protocolMastery: Record<string, ProtocolMastery>;
};

export type GameAction =
    | { type: 'INITIALIZE_DUEL'; payload: InitializeDuelPayload }
    | { type: 'PLAY_CARD'; payload: PlayCardPayload }
    | { type: 'PROCESS_START_OF_TURN'; payload: { isPlayer: boolean } }
    | { type: 'OPPONENT_TURN' }
    | { type: 'END_DUEL'; payload: { victory: boolean } }
    | { type: 'ATTACK_ANIMATION_COMPLETE'; payload: { wasPlayerAttack: boolean } };


// Logging Types
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';

export interface LogEntry {
  timestamp: string;
  message: string;
  level: LogLevel;
  context?: Record<string, any>;
}

// Profile Types
export interface PublicUserProfile {
  id: string;
  displayName: string;
  email?: string;
  level: number;
  totalXp: number;
  badges: Badge[];
  publishedStacks: CommunityStack[];
  sharedProtocols: Protocol[];
  created_at?: any;
  isAdmin?: boolean;
  isBanned?: boolean;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  streakCatalyst?: number | null;
  // PvP Stats
  pvpRank?: string;
  pvpRating?: number;
  pvpWins?: number;
  pvpLosses?: number;
  hasCompletedWalkthrough?: boolean;
  isAgentModeEnabled?: boolean;
  isLivingStackEnabled?: boolean;
  isAmbientJournalingEnabled?: boolean;
  groupIds?: string[];
}

// KAIROS Engine Types
export type KairosUserTrait = 'high_inflammation' | 'poor_sleep_score' | 'high_stress' | 'metabolic_dysfunction' | 'low_hrv' | 'cognitive_decline' | 'general_optimization';

export interface KairosDataPoint {
  userTraits: KairosUserTrait[];
  protocolIds: string[];
  outcomeMetric: string; // e.g., hs-CRP, Sleep Score, HRV
  outcomeChange: number; // e.g., -0.8 for hs-CRP decrease
  efficacy: number; // 0-1 confidence score
  dataPoints: number; // Number of anonymized users this is based on
}

export interface ResearchBounty {
  id: string;
  user_id: string;
  author: string;
  question: string;
  description: string;
  productId?: string;
  totalStake: number;
  stakers: Record<string, number>; // user_id -> amount
  createdAt: any; // Firestore timestamp
  status: 'active' | 'completed' | 'cancelled';
  results: {
    summary: string;
    protocolId: string;
  } | null;
}

// Data Vault Types
export interface SealedDataVault {
  id: string;
  user_id: string;
  year: number;
  month: number;
  ipfsCid: string;
  txHash: string;
  timestamp: any; // Firestore timestamp
  entryCount: number;
}

// Phase 2: Decentralized Identity & Data
export type DecentralizedIdentifier = `did:polygonid:2:${string}`;

export interface VerifiableCredential {
  id: string; // e.g., 'kai-plus-membership'
  issuer: 'did:web:biohackstack.io';
  type: 'KaiPlusMembership';
  issuanceDate: string;
  subject: DecentralizedIdentifier;
}

// Phase 3: Advanced Privacy & New Business Models
export interface ResearchStudy {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  eligibilityCriteria: (userData: { diagnosticData: DiagnosticDataPoint[], journalEntries: JournalEntry[] }) => boolean;
  proofStatement: string;
}

export interface ArchivedSnapshot {
  id: string;
  user_id: string;
  name: string;
  arweaveTxId: string;
  timestamp: any; // Firestore timestamp
  summary: string; // e.g., "3 active diagnostics, 25 journal entries"
}

export interface PlatformAnnouncement {
    id: string;
    message: string;
    isActive: boolean;
    updatedAt?: any;
}

export interface FeaturedContent {
  protocolIds: string[];
  stackIds: string[];
  journeyIds: string[];
}

export interface PlatformConfig {
    referralXpReward: number;
    isStoreEnabled: boolean;
    isAiEnabled: boolean;
    isGuidedWalkthroughEnabled?: boolean;
    weeklyMission?: WeeklyMission | null;
}

export interface WeeklyMission {
    protocolId: string;
    protocolName: string;
    bonusXp: number;
    endsAt?: any; // Firestore timestamp
}

// Admin Growth Engine Types
export interface UserFunnelSegment {
  stage: 'New' | 'Activated' | 'Engaged' | 'Advocate';
  count: number;
  percentage: number;
}

export interface GrowthBriefing {
  summary: string;
  opportunities: string[];
  risks: string[];
  suggestedCampaign: {
    protocolId: string;
    protocolName: string;
    bonusXp: number;
    rationale: string;
  };
}

// AI Search Types
export type SearchResultItem = {
    type: 'protocol' | 'stack' | 'journey';
    id: string;
    justification: string;
};

export interface SearchResponse {
    results: SearchResultItem[];
};

// Digital Twin Forecast Types
export interface ForecastMetric {
  metricName: string;
  currentValue: string;
  projectedValue: string;
  trend: 'improving' | 'declining' | 'stable';
  insight: string;
}

export interface ForecastRisk {
  risk: string;
  probability: number; // e.g., 0.35 for 35%
  rationale: string;
  mitigation?: {
    protocolId: string;
    protocolName: string;
    reason: string;
  };
}

export interface DigitalTwinForecast {
  timeHorizon: string;
  overallSummary: string;
  projectedMetrics: ForecastMetric[];
  identifiedRisks: ForecastRisk[];
}

export interface SavedReport {
  id: string;
  type: 'triage' | 'briefing' | 'correlation' | 'forecast';
  data: any; // TriageReportData | BriefingData | CorrelationData[] | DigitalTwinForecast
  timestamp: any; // Firestore timestamp or Date object
}

// Zero-Input Logging Types
export interface GpsLog {
  location: string;
  activity: string;
  distance: string;
}

export interface DayData {
  photo: {
    description: string;
    base64: string;
  };
  calendarEvents: CalendarEvent[];
  gpsLog: GpsLog[];
}

export interface SleepData {
    score: number;
    readiness: number;
    hrv: number;
    summary: string;
}

// Store Types
export interface Product {
    id: string;
    name: string;
    category: 'Wearable' | 'Diagnostic' | 'Tech' | 'Supplement';
    description: string;
    price: number;
    priceInBioTokens?: number;
    imageUrl: string;
    affiliateLink: string;
    inventory: number;
    specs?: string[];
    stripeProductId?: string;
    stripePriceId?: string;
    isStripeSynced?: boolean;
    supplierName?: string;
    supplierSku?: string;
    shippingWeight?: number; // in kg
    shippingDimensions?: { length: number; width: number; height: number; }; // in cm
    fulfillmentService?: 'self' | '3pl';
}

export interface Gift {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  giftedBy: string; // admin user_id
  giftedAt: any; // Firestore timestamp
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  user_id: string;
  userName: string;
  product_id: string;
  productName: string;
  date: any; // Firestore timestamp
  status: OrderStatus;
  trackingNumber?: string;
  shippingAddress: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: any; // Firestore timestamp
  uses: number;
  maxUses: number | null;
  isActive: boolean;
}


// Feedback System Types
export type FeedbackType = 'ai_response' | 'general' | 'bug' | 'feature_request';
export type FeedbackRating = 'positive' | 'negative';

interface FeedbackBase {
  id: string;
  user_id: string;
  userDisplayName: string;
  timestamp: any; // Firestore timestamp
  type: FeedbackType;
  rating?: FeedbackRating;
  comment?: string;
}

export interface AIResponseFeedback extends FeedbackBase {
  type: 'ai_response';
  rating: FeedbackRating;
  context: {
    prompt?: ChatMessage[];
    response: string | object;
    view: string; // e.g., 'coaching', 'digital-twin-triage'
  };
}

export interface GeneralFeedback extends FeedbackBase {
  type: 'general' | 'bug' | 'feature_request';
  rating?: never; // General feedback might not have a simple up/down rating
  context?: {
    view: string;
    diagnostics?: string; // e.g., browser, OS
  };
}

export type Feedback = AIResponseFeedback | GeneralFeedback;


// New Admin Types
export type UserSegmentCondition = {
  field: 'level' | 'journey_completed' | 'inactive_days';
  operator: 'gt' | 'lt' | 'eq' | 'neq';
  value: string | number;
};

export interface UserSegment {
  id: string;
  name: string;
  rules: UserSegmentCondition[];
  userCount: number; // calculated
}

export type CampaignAction = {
  type: 'send_message' | 'award_xp';
  value: string | number; // message content or XP amount
};

export interface CampaignStep {
  day: number;
  trigger: 'signup' | 'no_journal' | 'added_protocol';
  action: CampaignAction;
}

export interface Campaign {
  id: string;
  name: string;
  slug?: string;
  protocolIds?: string[];
  targetSegmentId: string; // 'new_users', etc.
  steps: CampaignStep[];
  isActive: boolean;
}

// A/B Testing Types
export interface ABTestResult {
  impressions: number;
  conversions: number;
}

export interface ABTestVariant {
  name: 'A' | 'B';
  protocolId: string;
  results: ABTestResult;
}

export interface ABTest {
  id: string;
  name: string;
  targetSegment: 'all_users' | 'inactive_7_days' | 'new_users';
  conversionGoal: string;
  status: 'active' | 'completed';
  variants: [ABTestVariant, ABTestVariant];
  winner?: 'A' | 'B' | null;
}

// Growth Engine Integrations
export interface SocialIntegration {
  platform: 'twitter' | 'discord';
  handle: string;
  isConnected: boolean;
}

export interface MailingListEntry {
  email: string;
  subscribedAt: Date;
}

export interface MailingListStats {
  subscriberCount: number;
  lastBlastDate: string | null;
  lastExportDate?: string | null;
}

// New Gamification 2.0 Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  protocolId?: string;
  location: string; // e.g., "Any Park", "A Quiet Room"
  xpReward: number;
  bioTokenReward: number;
}

export interface TournamentPlayer {
  userId: string;
  displayName: string;
}

export interface TournamentMatch {
  id: string;
  players: [TournamentPlayer | null, TournamentPlayer | null];
  winnerId: string | null;
}

export interface TournamentRound {
  name: string;
  matches: TournamentMatch[];
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  entryFee: number;
  prizePool: number;
  status: 'upcoming' | 'live' | 'completed';
  players: TournamentPlayer[];
  rounds: TournamentRound[];
  startDate: string; // ISO string
  // New fields for live streaming
  streamLink?: string;
  isLive?: boolean;
  casters?: {
    strategist: string;
    analyst: string;
  };
  featuredMatch?: {
    players: [TournamentPlayer, TournamentPlayer];
  };
}

export interface ScheduledTimelineItem {
  id: string;
  time: string;
  protocol: Protocol;
  insight: string;
  isQuest?: boolean;
  isOverridden?: boolean;
}

// New Diagnostics Hub Type
export interface DiagnosticService {
  id: string;
  name: string;
  category: 'Bloodwork' | 'Imaging' | 'Genetics' | 'Microbiome';
  description: string;
  provider: string;
  priceRange: string;
  bookingLink: string;
  providerLogoUrl: string;
}

// Sandbox Mode AI Response
export interface StackComparison {
  analysis: string;
  winner: 'alpha' | 'bravo' | 'tie';
  alphaPros: string[];
  alphaCons: string[];
  bravoPros: string[];
  bravoCons: string[];
}

// NEW V2 Stack Lab Header
export interface StackVitals {
  totalBioScore: number;
  arenaAttack: number;
  arenaDefense: number;
  synergyScore: 'S' | 'A' | 'B' | 'C' | 'N/A';
  dominantCategory: Category | 'Mixed' | 'N/A';
  totalTimeMinutes: number;
  totalStaminaCost: number;
  netBioRhythmImpact: number; // Positive = Sympathetic, Negative = Parasympathetic
  synergyInsight: string;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
}

export interface UserGroup {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
}

export interface UIState {
  isInitializing: boolean;
  view: View;
  kaiSubView: KaiSubView;
  exploreSubView: ExploreSubView;
  myStackLabSubView: MyStackLabSubView;
  myStackLabView: MyStackLabView;
  settingsTab: SettingsTab;
  adminTab: AdminTab;
  arenaSubView: ArenaSubView;
  growthEngineSubTab: GrowthEngineSubTab;
  detailedProtocol: Protocol | null;
  isDetailsFullScreen: boolean;
  activeCoachingProtocol: Protocol | null;
  activeCohortId: string | null;
  activeGuidedProtocol: Protocol | null;
  activeArGuideProtocol: Protocol | null;
  coachingMessages: ChatMessage[];
  showOnboarding: boolean;
  isPublishModalOpen: boolean;
  forkingStack: UserStack | null;
  stackCreationContext: { bountyQuestion: string; protocolId: string; } | null;
  isSubmitModalOpen: boolean;
  isUpgradeModalOpen: boolean;
  isAuthModalOpen: boolean;
  isJournalModalOpen: boolean;
  isFeedbackModalOpen: boolean;
  isProductModalOpen: boolean;
  isArGuideModalOpen: boolean;
  viewingProduct: Product | null;
  coachingMode: CoachingMode;
  kaiVoiceURI: string | null;
  isProfileModalOpen: boolean;
  viewingProfileId: string | null;
  isWimHofModalOpen: boolean;
  isMobileMenuOpen: boolean;
  isBountyModalOpen: boolean;
  bountyModalMode: 'create' | 'stake';
  activeBounty: ResearchBounty | null;
  isResolveBountyModalOpen: boolean;
  resolvingBounty: ResearchBounty | null;
  activeDuel: { opponent: ChallengeCard | PublicUserProfile; hand: Protocol[]; stake?: number } | null;
  isStakeModalOpen: boolean;
  stakingOnUser: PublicUserProfile | null;
  // New Search State
  searchQuery: string;
  searchResults: SearchResponse | null;
  isSearching: boolean;
  searchError: Error | null;
  // New Forecast State
  isForecastLoading: boolean;
  forecastData: DigitalTwinForecast | null;
  // Walkthrough State
  isWalkthroughActive: boolean;
  walkthroughStep: number;
  walkthroughContext?: { primaryGoal: string };
  isSandboxMode: boolean;
  // Tip HUD State
  tipIndex: number;
  isTipDismissed: boolean;
  initializeUI: () => () => void;
  setInitializing: (isInitializing: boolean) => void;
  setView: (view: View) => void;
  setKaiSubView: (subView: KaiSubView) => void;
  setExploreSubView: (subView: ExploreSubView) => void;
  setMyStackLabSubView: (subView: MyStackLabSubView) => void;
  setMyStackLabView: (view: MyStackLabView) => void;
  setSettingsTab: (tab: SettingsTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setArenaSubView: (subView: ArenaSubView) => void;
  setGrowthEngineSubTab: (subTab: GrowthEngineSubTab) => void;
  showDetails: (protocol: Protocol, isFullScreen?: boolean) => void;
  closeDetails: () => void;
  startCoachingSession: (protocol: Protocol) => void;
  viewCohortChannel: (cohortId: string) => void;
  endCoachingSession: () => void;
  startGuidedSession: (protocol: Protocol) => void;
  endGuidedSession: (completed: boolean) => void;
  openArGuideModal: (protocol: Protocol) => void;
  closeArGuideModal: () => void;
  addCoachingMessage: (message: ChatMessage) => void;
  closeOnboarding: () => void;
  openPublishModal: (forkSource?: UserStack, context?: UIState['stackCreationContext']) => void;
  closePublishModal: () => void;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openJournalModal: () => void;
  closeJournalModal: () => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  setCoachingMode: (mode: CoachingMode) => void;
  setKaiVoiceURI: (uri: string | null) => void;
  openProfileModal: (userId: string) => void;
  closeProfileModal: () => void;
  openWimHofModal: () => void;
  closeWimHofModal: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openBountyModal: (mode: 'create' | 'stake', bounty?: ResearchBounty) => void;
  closeBountyModal: () => void;
  openResolveBountyModal: (bounty: ResearchBounty) => void;
  closeResolveBountyModal: () => void;
  startDuel: (opponent: ChallengeCard | PublicUserProfile, hand: Protocol[], stake?: number) => void;
  endDuel: () => void;
  openStakeModal: (user: PublicUserProfile) => void;
  closeStakeModal: () => void;
  setSearchState: (state: Partial<{ searchQuery: string; searchResults: SearchResponse | null; isSearching: boolean; searchError: Error | null; }>) => void;
  clearSearch: () => void;
  setForecastState: (state: Partial<{ isForecastLoading: boolean; forecastData: DigitalTwinForecast | null }>) => void;
  clearForecast: () => void;
  // Walkthrough Actions
  startWalkthrough: (context?: { primaryGoal: string }) => void;
  nextWalkthroughStep: () => void;
  endWalkthrough: () => void;
  enterSandboxMode: () => void;
  exitSandboxMode: () => void;
  // Tip HUD Actions
  cycleTip: () => void;
  dismissTip: () => void;
}