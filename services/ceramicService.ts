import { JournalEntry, VerifiableCredential, MyStackContent, SavedReport } from '../types';
import { log } from '../stores/logStore';

// This is a mock/simulation of the Ceramic Network SDK.
// In a real application, this would be replaced with actual calls to the Ceramic JS client.

interface CeramicStreamData {
  myStackContent: MyStackContent;
  journalEntries: JournalEntry[];
  userGoals: string[];
  verifiableCredentials: VerifiableCredential[];
  savedReports: SavedReport[];
}

interface CeramicStream {
  id: string;
  data: CeramicStreamData;
}

class CeramicService {
  private streams: Map<string, CeramicStream> = new Map();

  constructor() {
    log('DEBUG', 'CeramicService (simulated) initialized.');
  }

  // Simulates creating a new, empty stream for a user.
  async createStream(initialData: CeramicStreamData): Promise<CeramicStream> {
    const streamId = `ceramic://${crypto.randomUUID()}`;
    const newStream: CeramicStream = {
      id: streamId,
      data: initialData,
    };
    this.streams.set(streamId, newStream);
    log('DEBUG', '[Ceramic SIM] Created new stream', { streamId });
    return newStream;
  }

  // Simulates reading the latest data from a user's stream.
  async readStream(streamId: string, fallbackData?: Partial<CeramicStreamData>): Promise<CeramicStreamData> {
    if (!this.streams.has(streamId)) {
      log('WARN', '[Ceramic SIM] Rehydrating non-existent stream (simulating first load)', { streamId });
      // Simulate finding the stream for the first time and pre-populating with fallback data if needed.
      const rehydratedStream: CeramicStream = {
        id: streamId,
        data: {
          myStackContent: fallbackData?.myStackContent || [],
          journalEntries: fallbackData?.journalEntries || [],
          userGoals: fallbackData?.userGoals || [],
          verifiableCredentials: fallbackData?.verifiableCredentials || [],
          savedReports: fallbackData?.savedReports || [],
        },
      };
      this.streams.set(streamId, rehydratedStream);
    }
    log('DEBUG', '[Ceramic SIM] Read from stream', { streamId });
    return this.streams.get(streamId)!.data;
  }

  // Simulates updating data in a user's stream.
  async updateStream(streamId: string, updates: Partial<CeramicStreamData>): Promise<void> {
    if (!this.streams.has(streamId)) {
      log('ERROR', '[Ceramic SIM] Cannot update non-existent stream', { streamId });
      throw new Error(`[Ceramic SIM] Stream with ID ${streamId} does not exist.`);
    }
    const currentStream = this.streams.get(streamId)!;
    const newData = { ...currentStream.data, ...updates };
    this.streams.set(streamId, { ...currentStream, data: newData });
    log('DEBUG', '[Ceramic SIM] Updated stream', { streamId, updatedFields: Object.keys(updates) });
  }
}

export const ceramicService = new CeramicService();