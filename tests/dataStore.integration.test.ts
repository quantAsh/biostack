import { describe, it, expect } from 'vitest';
import { useDataStore } from '../stores/dataStore';
import * as firebaseService from '../services/firebase';

describe('addToMailingList (integration with emulator)', () => {
  it('runs against emulator when configured', async () => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      console.warn('Skipping Firestore emulator integration test; set FIRESTORE_EMULATOR_HOST to run.');
      return;
    }

    // If emulator present, ensure db points to emulator (services/firebase should honor env vars)
    if (!firebaseService.db) {
      throw new Error('Firestore db is not initialized. Ensure services/firebase exports db when emulator is configured.');
    }

    const email = `emulator-test-${Date.now()}@example.com`;
    const { addToMailingList } = useDataStore.getState();

    // Allow more time for emulator operations in CI/local
    await addToMailingList(email);

    const state = useDataStore.getState();
    expect(state.mailingList.some(m => m.email === email)).toBe(true);
  }, 20000);
});
