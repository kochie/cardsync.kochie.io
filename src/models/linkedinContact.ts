export interface LinkedinContact {
  connectionId: string; // Optional, used for tracking connections
  entityUrn: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Derived from firstName and lastName
  publicIdentifier: string;
  headline?: string;
  profilePicture?: string;
  birthDate?: string; // Format: YYYY-MM-DD or MM-DD
  phoneNumbers? : {
    type: string; // e.g., "MOBILE", "HOME", "WORK"
    number: string;
  }[]
  emailAddresses?: {
    emailAddress: string;
    type?: string; // e.g., "PERSONAL", "WORK"
  }[];
  addresses?: string[]
  websites?: {
    url: string;
    type?: string; // e.g., "PERSONAL", "WORK"
  }[];
}

export interface LinkedinConnection {
  id: string;
  cookies: string;
  name: string;
  sessionId: string;
  numberContacts: number;
  lastSynced?: Date;
  status: string; // e.g., "connected", "disconnected", "error"
  syncFrequency: string; // e.g., "manual", "hourly", "daily", "weekly"
}
