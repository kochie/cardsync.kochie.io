import { Tables } from "../types/database.types.ts";
import { Element, LinkedInProfile, LinkedInProfileContactInfo, LinkedInPhoneNumber, LinkedInWebsite, LinkedInTwitterHandle } from "../types/linkedin.types.ts";

export enum ConnectionStatus {
    Connected = "connected",
    Disconnected = "disconnected",
    Syncing = "syncing",
    Error = "error",
}

export interface LinkedinContactModel {
  connectionId: string; // Optional, used for tracking connections
  entityUrn: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Derived from firstName and lastName
  publicIdentifier: string;
  headline?: string;
  profilePicture?: string;
  birthDate?: string; // Format: YYYY-MM-DD or MM-DD
  phoneNumbers?: {
    type: string; // e.g., "MOBILE", "HOME", "WORK"
    number: string;
  }[];
  emailAddresses?: {
    emailAddress: string;
    type?: string; // e.g., "PERSONAL", "WORK"
  }[];
  addresses?: string[];
  websites?: {
    url: string;
    type?: string; // e.g., "PERSONAL", "WORK"
  }[];
  internalId?: string;
}

export interface LinkedinConnectionModel {
  id: string;
  cookies: string;
  name: string;
  sessionId: string;
  numberContacts: number;
  lastSynced?: Date;
  status: ConnectionStatus; // e.g., "connected", "disconnected", "error"
  syncFrequency: string; // e.g., "manual", "hourly", "daily", "weekly"
}

export class LinkedinConnection {
  readonly id: string;
  cookies: string;
  name: string;
  sessionId: string;
  numberContacts: number;
  lastSynced?: Date;
  status: ConnectionStatus; // e.g., "connected", "disconnected", "error"
  syncFrequency: string; // e.g., "manual", "hourly", "daily", "weekly"

  constructor(model: LinkedinConnectionModel) {
    this.id = model.id;
    this.cookies = model.cookies;
    this.name = model.name;
    this.sessionId = model.sessionId;
    this.numberContacts = model.numberContacts;
    this.lastSynced = model.lastSynced;
    this.status = model.status;
    this.syncFrequency = model.syncFrequency;
  }

  static fromDatabaseObject(
    data: Tables<"linkedin_connections">
  ): LinkedinConnection {
    return new LinkedinConnection({
      id: data.id,
      cookies: data.cookies,
      name: data.name,
      sessionId: data.session_id,
      numberContacts: data.number_contacts || 0,
      lastSynced: data.last_synced ? new Date(data.last_synced) : undefined,
      status: data.status as ConnectionStatus,
      syncFrequency: data.sync_frequency || "manual",
    });
  }

  toDatabaseObject(): Omit<
    Tables<"linkedin_connections">,
    "user_id" | "created_at"
  > {
    return {
      id: this.id,
      cookies: this.cookies,
      name: this.name,
      session_id: this.sessionId,
      number_contacts: this.numberContacts,
      last_synced: this.lastSynced ? this.lastSynced.toISOString() : null,
      status: this.status,
      sync_frequency: this.syncFrequency,
    };
  }
}

export class LinkedinContact {
  #connectionId: string; // Optional, used for tracking connections
  #entityUrn: string;
  #firstName?: string;
  #lastName?: string;
  #fullName: string; // Derived from firstName and lastName
  #publicIdentifier: string;
  #headline?: string;
  #profilePicture?: string;
  #birthDateOn?: { month: number; day: number };
  #birthdayVisibilitySetting?: string;
  #phoneNumbers: LinkedInPhoneNumber[];
  #emailAddress?: string;
  #twitterHandles?: LinkedInTwitterHandle[];
  #primaryTwitterHandle?: LinkedInTwitterHandle;
  #addresses: string[];
  #websites: { url: string; type?: string }[];
  #internalId?: string;

  constructor(model: LinkedinContactModel & Partial<LinkedInProfileContactInfo>) {
    this.#connectionId = model.connectionId;
    this.#entityUrn = model.entityUrn;
    this.#firstName = model.firstName;
    this.#lastName = model.lastName;
    this.#fullName = model.fullName || `${model.firstName} ${model.lastName}`;
    this.#publicIdentifier = model.publicIdentifier;
    this.#headline = model.headline;
    this.#profilePicture = model.profilePicture;
    this.#birthDateOn = model.birthDateOn;
    this.#birthdayVisibilitySetting = model.birthdayVisibilitySetting;
    this.#phoneNumbers = model.phoneNumbers || [];
    this.#emailAddress = model.emailAddress;
    this.#twitterHandles = model.twitterHandles;
    this.#primaryTwitterHandle = model.primaryTwitterHandle;
    this.#addresses = model.addresses || [];
    this.#websites = (model.websites || []).map((w: any) => ({
      url: w.url,
      type: typeof w.type === "string"
        ? w.type
        : w.type?.["com.linkedin.voyager.identity.profile.StandardWebsite"]?.category || undefined
    }));
    this.#internalId = (model as any).internalId || (model as any).internal_id;
  }

  get id(): string {
    return this.#connectionId;
  }
  get entityUrn(): string {
    return this.#entityUrn;
  }
  get firstName(): string | undefined {
    return this.#firstName;
  }
  get lastName(): string | undefined {
    return this.#lastName;
  }
  get publicIdentifier(): string {
    return this.#publicIdentifier;
  }
  get headline(): string | undefined {
    return this.#headline;
  }
  get profilePicture(): string | undefined {
    return this.#profilePicture;
  }
  get birthDate(): string | undefined {
    return this.#birthDateOn ? `${this.#birthDateOn.month}-${this.#birthDateOn.day}` : undefined;
  }
  get phoneNumbers(): LinkedInPhoneNumber[] {
    return this.#phoneNumbers;
  }
  get emailAddress(): string | undefined {
    return this.#emailAddress;
  }
  get twitterHandles(): LinkedInTwitterHandle[] | undefined {
    return this.#twitterHandles;
  }
  get primaryTwitterHandle(): LinkedInTwitterHandle | undefined {
    return this.#primaryTwitterHandle;
  }
  get addresses(): string[] {
    return this.#addresses; 
  }
  get websites(): { url: string; type?: string }[] {
    return this.#websites;
  }

  get internal_id(): string | undefined {
    return this.#internalId;
  }
  get internalId(): string | undefined {
    return this.#internalId;
  }

  static fromDatabaseObject(data: Tables<"linkedin_contacts">): LinkedinContact {
    // Helper: safely parse Json[] to expected types
    function parseJsonArray<T>(arr: unknown): T[] {
      if (!arr) return [];
      if (Array.isArray(arr)) return arr as T[];
      return [];
    }
    function parseJson<T>(val: unknown): T | undefined {
      if (!val) return undefined;
      return val as T;
    }
    return new LinkedinContact({
      connectionId: data.connection_id,
      publicIdentifier: data.public_identifier ?? "",
      entityUrn: data.entity_urn,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      headline: data.headline ?? undefined,
      fullName: data.full_name ?? undefined,
      profilePicture: data.profile_picture ?? undefined,
      birthDateOn: data.birth_date ? (data.birth_date as { month: number; day: number }) : undefined,
      phoneNumbers: parseJsonArray<LinkedInPhoneNumber>(data.phone_numbers),
      emailAddresses: (data.email_address ?? []).map(e => ({ emailAddress: e })),
      twitterHandles: parseJsonArray<LinkedInTwitterHandle>(data.twitter_handles),
      websites: parseJsonArray<any>(data.websites).map((w: any) => ({
        url: w.url,
        type: w.type || (w.type && w.type["com.linkedin.voyager.identity.profile.StandardWebsite"]?.category) || undefined
      })),
      internalId: typeof (data as any).internal_id === 'string' ? (data as any).internal_id : undefined,
    });
  }

  static fromLinkedinData(
    element: Element,
    profile: LinkedInProfileContactInfo,
    connectionId: string
  ): LinkedinContact {
    let pictureUrl;
    const artifacts =
      element.connectedMemberResolutionResult?.profilePicture?.displayImageReference?.vectorImage?.artifacts?.sort(
        (a, b) => a.width - b.width
      );
    const rootUrl =
      element.connectedMemberResolutionResult?.profilePicture?.displayImageReference?.vectorImage?.rootUrl;
    if (artifacts && artifacts.length > 0 && rootUrl) {
      const largestArtifact = artifacts[artifacts.length - 1];
      pictureUrl = rootUrl + largestArtifact?.fileIdentifyingUrlPathSegment;
    }

    return new LinkedinContact({
      connectionId: connectionId,
      publicIdentifier: element.connectedMemberResolutionResult?.publicIdentifier || "",
      entityUrn: element.entityUrn,
      firstName: element.connectedMemberResolutionResult?.firstName || "",
      lastName: element.connectedMemberResolutionResult?.lastName || "",
      headline: element.connectedMemberResolutionResult?.headline || "",
      fullName: `${element.connectedMemberResolutionResult?.firstName} ${element.connectedMemberResolutionResult?.lastName}`.toLowerCase(),
      profilePicture: pictureUrl,
      birthDateOn: profile.birthDateOn,
      birthdayVisibilitySetting: profile.birthdayVisibilitySetting,
      phoneNumbers: profile.phoneNumbers ?? [],
      emailAddress: profile.emailAddress ?? undefined,
      twitterHandles: profile.twitterHandles ?? undefined,
      primaryTwitterHandle: profile.primaryTwitterHandle ?? undefined,
      addresses: [], // LinkedIn API does not provide addresses in new endpoints
      websites: (profile.websites ?? []).map((w: any) => ({
        url: w.url,
        type: typeof w.type === "string"
          ? w.type
          : w.type?.["com.linkedin.voyager.identity.profile.StandardWebsite"]?.category || undefined
      })),
    });
  }

  toDatabaseObject(): Omit<Tables<"linkedin_contacts">, "user_id" | "created_at" | "internal_id"> {
    function toJsonArray(val: any) {
      if (!val) return null;
      if (Array.isArray(val)) return val;
      return [val];
    }
    return {
      headline: this.#headline ?? null,
      entity_urn: this.#entityUrn,
      first_name: this.#firstName ?? null,
      last_name: this.#lastName ?? null,
      full_name: this.#fullName ?? null,
      profile_picture: this.#profilePicture ?? null,
      public_identifier: this.#publicIdentifier,
      connection_id: this.#connectionId.replace("linkedin:", ""),
      last_synced: new Date().toISOString(),
      birth_date: this.#birthDateOn ?? null,
      phone_numbers: toJsonArray(this.#phoneNumbers),
      email_address: this.#emailAddress ? [this.#emailAddress] : null,
      twitter_handles: toJsonArray(this.#twitterHandles),
      addresses: toJsonArray(this.#addresses),
      websites: toJsonArray(this.#websites),
    };
  }
}
