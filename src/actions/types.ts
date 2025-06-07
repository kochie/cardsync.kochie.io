export interface Connection {
  id: string;
  provider: string;
  name: string;
  status: string;
  lastSynced: Date | null;
  authMethod: string;
  contacts: number | null;
  syncFrequency?: string; // Added syncFrequency
}

export interface ConnectionSession extends Connection {
  sessionId: string;
  cookies: string;
}

