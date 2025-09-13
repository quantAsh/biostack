/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDataStore } from '../stores/dataStore';
import { useUserStore, getInitialUserState } from '../stores/userStore';
import { mockProducts } from '../data/products';
import { ABTest, UserSegment, Product } from '../types';
import toast from 'react-hot-toast';

// Mock toast to prevent errors in test environment
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// We need to manually reset the state of our Zustand stores before each test
// to ensure test isolation.
const resetStores = () => {
    // A simplified initial state for dataStore for testing purposes
    useDataStore.setState({
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
        platformConfig: { referralXpReward: 50, isStoreEnabled: true, isAiEnabled: true, isGuidedWalkthroughEnabled: false },
        weeklyMission: null,
        featuredContent: null,
        products: JSON.parse(JSON.stringify(mockProducts)), // Deep copy to avoid test contamination
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
        mailingListStats: { subscriberCount: 0, lastBlastDate: null },
        mailingList: [],
    });

    // A complete initial state for userStore for test isolation
    useUserStore.setState({
        ...getInitialUserState(),
        // Test-specific overrides
        user: { uid: 'test-user-123' } as any,
        displayName: "Test User",
        isAdmin: true,
        isPremium: true,
        bioTokens: 5000,
    });
};

describe('BiohackStack Application Logic', () => {

    beforeEach(() => {
        resetStores();
        vi.clearAllMocks();
    });

    describe('Pre-Launch & Growth Systems', () => {
        it('should add a valid email to the mailing list', async () => {
            const { addToMailingList } = useDataStore.getState();
            await addToMailingList('test@example.com');
            const { mailingList, mailingListStats } = useDataStore.getState();
            expect(mailingList).toHaveLength(1);
            expect(mailingList[0].email).toBe('test@example.com');
            expect(mailingListStats.subscriberCount).toBe(1);
            expect(toast.success).toHaveBeenCalledWith("You've been added to the waitlist!");
        });

        it('should not add an invalid email to the mailing list', async () => {
            const { addToMailingList } = useDataStore.getState();
            await addToMailingList('invalid-email');
            expect(useDataStore.getState().mailingList).toHaveLength(0);
            expect(toast.error).toHaveBeenCalledWith("Please enter a valid email address.");
        });

        it('should not add a duplicate email to the mailing list', async () => {
            const { addToMailingList } = useDataStore.getState();
            await addToMailingList('test@example.com');
            await addToMailingList('test@example.com');
            expect(useDataStore.getState().mailingList).toHaveLength(1);
            expect(toast.error).toHaveBeenCalledWith("This email is already on the waitlist.");
        });
    });

    describe('Proactive Growth Co-Pilot', () => {
        it('should create a new A/B test', async () => {
            const { createABTest } = useDataStore.getState();
            const newTest: Omit<ABTest, 'id' | 'status' | 'winner'> = {
                name: 'Test Engagement',
                targetSegment: 'new_users',
                conversionGoal: 'Log first journal',
                variants: [
                    { name: 'A', protocolId: '1', results: { impressions: 0, conversions: 0 } },
                    { name: 'B', protocolId: '2', results: { impressions: 0, conversions: 0 } },
                ],
            };
            await createABTest(newTest);
            const { abTests } = useDataStore.getState();
            expect(abTests).toHaveLength(1);
            expect(abTests[0].name).toBe('Test Engagement');
            expect(toast.success).toHaveBeenCalled();
        });

        it('should create a new user segment', () => {
            const { createUserSegment } = useDataStore.getState();
            const newSegment: Omit<UserSegment, 'id' | 'userCount'> = {
                name: 'Power Users',
                rules: [{ field: 'level', operator: 'gt', value: 20 }],
            };
            createUserSegment(newSegment);
            const { userSegments } = useDataStore.getState();
            expect(userSegments).toHaveLength(1);
            expect(userSegments[0].name).toBe('Power Users');
            expect(toast.success).toHaveBeenCalled();
        });

        it('should simulate connecting to a social media platform', async () => {
            const { connectSocialMedia } = useDataStore.getState();
            await connectSocialMedia('twitter');
            const twitterIntegration = useDataStore.getState().socialIntegrations.find(si => si.platform === 'twitter');
            expect(twitterIntegration?.isConnected).toBe(true);
            expect(toast.success).toHaveBeenCalled();
        });

        it('should simulate sending an email blast and update the last blast date', async () => {
            const { sendEmailBlast } = useDataStore.getState();
            const initialDate = useDataStore.getState().mailingListStats.lastBlastDate;
            expect(initialDate).toBeNull();

            await sendEmailBlast('Test Subject', 'Test Body');

            const newDate = useDataStore.getState().mailingListStats.lastBlastDate;
            expect(newDate).not.toBeNull();
            expect(typeof newDate).toBe('string');
            expect(toast.success).toHaveBeenCalledWith("Email blast sent to subscribers (Simulated).");
        });
    });

    describe('E-Commerce & Web3 Backend', () => {
        it('should allow a user to purchase a product with sufficient $BIO tokens', async () => {
            const { purchaseProductWithBio } = useUserStore.getState();
            const productToBuy = useDataStore.getState().products.find(p => p.id === 'prod_levels') as Product;

            const initialTokens = useUserStore.getState().bioTokens;
            await purchaseProductWithBio(productToBuy);
            
            const finalTokens = useUserStore.getState().bioTokens;
            const transactions = useUserStore.getState().cryptoTransactions;

            expect(finalTokens).toBe(initialTokens - productToBuy.priceInBioTokens!);
            expect(transactions).toHaveLength(1);
            expect(transactions[0].type).toBe('spend');
            expect(toast.success).toHaveBeenCalledWith(`Successfully purchased ${productToBuy.name}!`);
        });

        it('should decrement product inventory after a successful purchase', async () => {
            const { purchaseProductWithBio } = useUserStore.getState();
            const productToBuy = useDataStore.getState().products.find(p => p.id === 'prod_levels') as Product;
            const initialInventory = productToBuy.inventory;
            
            await purchaseProductWithBio(productToBuy);
            
            const finalProduct = useDataStore.getState().products.find(p => p.id === 'prod_levels') as Product;
            expect(finalProduct.inventory).toBe(initialInventory - 1);
        });

        it('should prevent a user from purchasing with insufficient funds', async () => {
            const { purchaseProductWithBio } = useUserStore.getState();
            useUserStore.setState({ bioTokens: 100 }); // Set insufficient balance
            const productToBuy = useDataStore.getState().products.find(p => p.id === 'prod_levels') as Product;
            const initialInventory = productToBuy.inventory;

            await purchaseProductWithBio(productToBuy);

            const finalProduct = useDataStore.getState().products.find(p => p.id === 'prod_levels') as Product;
            expect(finalProduct.inventory).toBe(initialInventory); // Inventory should not change
            expect(useUserStore.getState().bioTokens).toBe(100); // Tokens should not change
            expect(toast.error).toHaveBeenCalledWith("Insufficient $BIO balance.");
        });

        it('should prevent a user from purchasing an out-of-stock item', async () => {
            const { purchaseProductWithBio } = useUserStore.getState();
            // Find a product and set its inventory to 0
            const productToBuy = useDataStore.getState().products.find(p => p.id === 'prod_whoop') as Product;
            expect(productToBuy.inventory).toBe(0);

            const initialTokens = useUserStore.getState().bioTokens;
            
            await purchaseProductWithBio(productToBuy);

            expect(useUserStore.getState().bioTokens).toBe(initialTokens); // Tokens should not change
            expect(toast.error).toHaveBeenCalledWith("This product is out of stock.");
        });
    });
});