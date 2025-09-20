import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks must be declared before importing the store so imports see the mocked module
vi.mock('../stores/logStore', () => ({ log: () => {} }));
vi.mock('../services/ceramicService', () => ({ ceramicService: { readStream: async () => ({ myStackContent: [], journalEntries: [], userGoals: [], verifiableCredentials: [], savedReports: [] }), createStream: async () => ({ id: 'stream-1' }) } }));

// Provide a mock for uiStore used by userStore.
// The real `useUIStore` is a Zustand hook object with a `getState()` method
// so tests must mock the same shape: an object that has getState().
vi.mock('../stores/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      closeAuthModal: () => {},
      setView: () => {},
    }),
    // keep convenience methods in case code calls them directly
    closeAuthModal: () => {},
    setView: () => {},
  },
}));

// We'll mock services/firebase to control auth behavior
const mockAuth: any = {
  currentUser: null,
  signInWithPopup: async (provider: any) => {
    mockAuth.currentUser = { uid: 'u1', displayName: 'Test User', isAnonymous: false };
    return { user: mockAuth.currentUser };
  },
  signInAnonymously: async () => {
    mockAuth.currentUser = { uid: 'anon-1', displayName: null, isAnonymous: true };
    return { user: mockAuth.currentUser };
  },
  signOut: async () => { mockAuth.currentUser = null; },
};

vi.mock('../services/firebase', () => ({
  auth: mockAuth,
  db: { collection: () => ({ doc: () => ({ get: async () => ({ exists: false }), set: async () => {}, update: async () => {} }) }) },
  isFirebaseEnabled: true,
}));

// mock react-hot-toast to avoid DOM issues
vi.mock('react-hot-toast', () => ({
  default: { success: () => {}, error: () => {} },
}));

beforeEach(() => {
  // Provide a window.localStorage shim for Node environment
  const store: Record<string, string> = {};
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
  };
});

it('signInWithGithub persists session and signOut clears it', async () => {
  // Import the store after mocks
  const { useUserStore } = await import('../stores/userStore');
  const actions = useUserStore.getState();

  // Call signInWithGithub
  await actions.signInWithGithub();

  const raw = (globalThis as any).localStorage.getItem('biostack_session_v1');
  expect(raw).not.toBeNull();
  const parsed = JSON.parse(raw as string);
  expect(parsed.uid).toBe('u1');
  expect(parsed.displayName).toBe('Test User');

  // Now sign out and ensure storage cleared
  await actions.signOut();
  const after = (globalThis as any).localStorage.getItem('biostack_session_v1');
  expect(after).toBeNull();
});
