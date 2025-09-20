import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDataStore } from '../stores/dataStore';
import * as firebaseService from '../services/firebase';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

describe('addToMailingList (unit)', () => {
  let originalIsFirebase: any;
  beforeEach(() => {
    // Reset store before each test
    useDataStore.setState({ mailingList: [], mailingListStats: { subscriberCount: 0, lastBlastDate: null, lastExportDate: null } } as any);
    originalIsFirebase = (firebaseService as any).isFirebaseEnabled;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore via setter if available
    if (typeof (firebaseService as any).setFirebaseEnabled === 'function') {
      (firebaseService as any).setFirebaseEnabled(originalIsFirebase);
    } else {
      (firebaseService as any).isFirebaseEnabled = originalIsFirebase;
    }
  });

  it('should add a valid email locally when Firebase disabled', async () => {
  (firebaseService as any).setFirebaseEnabled(false);
    const { addToMailingList } = useDataStore.getState();
    await addToMailingList('Test@Example.com');
    const state = useDataStore.getState();
    expect(state.mailingList[0].email).toBe('test@example.com');
    expect(state.mailingListStats.subscriberCount).toBe(1);
    expect(toast.success).toHaveBeenCalled();
  });

  it('should show error for invalid email', async () => {
  (firebaseService as any).setFirebaseEnabled(false);
    const { addToMailingList } = useDataStore.getState();
    await addToMailingList('invalid-email');
    const state = useDataStore.getState();
    expect(state.mailingList.length).toBe(0);
    expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address.');
  });

  it('should use Firestore transaction when enabled and prevent duplicates', async () => {
  (firebaseService as any).setFirebaseEnabled(true);
    const fakeDocRef = { set: vi.fn() };
    const fakeMailingRef = { doc: vi.fn(() => fakeDocRef) };
    const fakeDb: any = {
      collection: vi.fn(() => fakeMailingRef),
    };
    if (typeof (firebaseService as any).setDb === 'function') {
      (firebaseService as any).setDb(fakeDb);
    } else {
      (firebaseService as any).db = fakeDb;
    }

    const { addToMailingList } = useDataStore.getState();

    // 1) Success path: runTransaction calls provided callback and writes when doc does not exist
    fakeDb.runTransaction = vi.fn(async (fn: any) => {
      await fn({ get: async () => ({ exists: false }), set: async () => {} });
    });
    await addToMailingList('txsuccess@example.com');
    expect(toast.success).toHaveBeenCalled();

    // 2) ALREADY_EXISTS path: simulate transaction callback sees doc exists and we throw ALREADY_EXISTS
    fakeDb.runTransaction = vi.fn(async (fn: any) => {
      await fn({ get: async () => ({ exists: true }) });
    });
    await addToMailingList('txexists@example.com');
    expect(toast.error).toHaveBeenCalledWith('This email is already on the waitlist.');

    // 3) Transaction error path: simulate transaction throwing some other error
    fakeDb.runTransaction = vi.fn(async () => { throw new Error('TRANSACTION_FAILED'); });
    await addToMailingList('txfail@example.com');
    expect(toast.error).toHaveBeenCalledWith('Failed to add to waitlist. Please try again later.');
  });
});
