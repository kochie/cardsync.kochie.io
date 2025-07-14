import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json, Tables } from "../types/database.types.ts";
import {
  Element,
  LinkedInProfileContactInfo,
  LinkedInPhoneNumber,
  LinkedInTwitterHandle,
  LinkedinEmail,
  LinkedInWebsite,
} from "../types/linkedin.types.ts";

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
    type?: string; // e.g., "MOBILE", "HOME", "WORK"
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

interface ExtendedData {
  birthDate?: string 
  phoneNumbers?: LinkedInPhoneNumber[];
  emailAddresses?: LinkedinEmail[]
  addresses?: string[]
  websites?: LinkedInWebsite[]; 
}

function parseExtendedData(extendedData: Json): ExtendedData {
  const data: ExtendedData = {};

  if (typeof extendedData === 'object' && extendedData !== null) {
    if ('birthDate' in extendedData) {
      const birthDate = extendedData.birthDate as { month: number; day: number };
      if (birthDate && typeof birthDate.month === 'number' && typeof birthDate.day === 'number') {
        data.birthDate = `${birthDate.day}-${birthDate.month}`;
      }
    }
    if ('phoneNumbers' in extendedData) {
      const phoneNumbers = extendedData.phoneNumbers as {type?: string, number: string}[]
      if (Array.isArray(phoneNumbers)) {
        data.phoneNumbers = phoneNumbers.map(p => ({
          type: p.type || "",
          number: p.number,
        }));
      }
    }
    if ('emailAddresses' in extendedData) {
      const emailAddresses = extendedData.emailAddresses as {emailAddress: string, type?: string}[];
      if (Array.isArray(emailAddresses)) {
        data.emailAddresses = emailAddresses.map(e => ({
          emailAddress: e.emailAddress,
          type: e.type || "",
        }));
      }
    }
    if ('addresses' in extendedData) {
      const addresses = extendedData.addresses as string[];
      if (Array.isArray(addresses)) {
        data.addresses = addresses;
      }
    }
    if ('websites' in extendedData) {
      const websites = extendedData.websites as {url: string, type?: string}[];
      if (Array.isArray(websites)) {
        data.websites = websites.map(w => ({
          url: w.url,
          type: w.type || "",
        }));
      }
    }
  }

  return data
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
    data: Tables<"linkedin_connections">,
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
  #internalId?: string;

  #birthDate?: { month: number; day: number };
  #phoneNumbers: LinkedInPhoneNumber[];
  #emailAddresses?: LinkedinEmail[];
  #twitterHandles?: LinkedInTwitterHandle[];
  #addresses: string[];
  #websites: { url: string; type?: string }[];
  

  constructor(
    model: LinkedinContactModel,
  ) {
    this.#connectionId = model.connectionId;
    this.#entityUrn = model.entityUrn;
    this.#firstName = model.firstName;
    this.#lastName = model.lastName;
    this.#fullName = model.fullName || `${model.firstName} ${model.lastName}`;
    this.#publicIdentifier = model.publicIdentifier;
    this.#headline = model.headline;
    this.#profilePicture = model.profilePicture;
    this.#birthDate = model.birthDate ? {
      month: parseInt(model.birthDate.split("-")[0], 10),
      day: parseInt(model.birthDate.split("-")[1], 10),
    } : undefined;
    this.#phoneNumbers = model.phoneNumbers || [];
    this.#emailAddresses = model.emailAddresses;
    this.#addresses = model.addresses || [];
    this.#websites = (model.websites || []).map((w) => ({
      url: w.url,
      type: w.type,
    }));
    this.#internalId = model.internalId;
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
    return this.#birthDate ? `${this.#birthDate.day}-${this.#birthDate.month}` : undefined;
  }
  get phoneNumbers(): LinkedInPhoneNumber[] {
    return this.#phoneNumbers;
  }
  get emailAddresses(): {emailAddress: string, type?:string}[] | undefined {
    return this.#emailAddresses;
  }
  get twitterHandles(): LinkedInTwitterHandle[] | undefined {
    return this.#twitterHandles;
  }
  get addresses(): string[] {
    return this.#addresses;
  }
  get websites(): { url: string; type?: string }[] {
    return this.#websites;
  }
  get internalId(): string | undefined {
    return this.#internalId;
  }

  static async getByIdentifier(
    identifier: string,
    supabase: SupabaseClient<Database>,
    connectionIds: string[],
  ): Promise<LinkedinContact | undefined> {
    const { data, error } = await supabase
      .from("linkedin_contacts")
      .select()
      .eq("public_identifier", identifier)
      .in("connection_id", connectionIds)
      .single();
    if (error || !data) {
      console.error("Error fetching LinkedIn contact by identifier:", error);
      return undefined;
    }

    return LinkedinContact.fromDatabaseObject(data);
  }



  static fromDatabaseObject(
    data: Omit<Tables<"linkedin_contacts">, "created_at" | "user_id">,
  ): LinkedinContact {

    const {
      addresses,
      birthDate,
      emailAddresses,
      phoneNumbers,
      websites,
    } = parseExtendedData(data.extended_data);

    return new LinkedinContact({
      connectionId: data.connection_id,
      publicIdentifier: data.public_identifier ?? "",
      entityUrn: data.entity_urn,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      headline: data.headline ?? undefined,
      fullName: data.full_name ?? undefined,
      profilePicture: data.profile_picture ?? undefined,
      internalId: data.internal_id,

      birthDate,
      phoneNumbers,
      addresses,
      emailAddresses,
      websites
    });
  }

  static fromLinkedinData(
    element: Element,
    profile: LinkedInProfileContactInfo,
    connectionId: string,
  ): LinkedinContact {
    let pictureUrl;
    const artifacts =
      element.connectedMemberResolutionResult?.profilePicture?.displayImageReference?.vectorImage?.artifacts?.sort(
        (a, b) => a.width - b.width,
      );
    const rootUrl =
      element.connectedMemberResolutionResult?.profilePicture
        ?.displayImageReference?.vectorImage?.rootUrl;
    if (artifacts && artifacts.length > 0 && rootUrl) {
      const largestArtifact = artifacts[artifacts.length - 1];
      pictureUrl = rootUrl + largestArtifact?.fileIdentifyingUrlPathSegment;
    }

    return new LinkedinContact({
      connectionId: connectionId,
      publicIdentifier:
        element.connectedMemberResolutionResult?.publicIdentifier || "",
      entityUrn: element.entityUrn,
      firstName: element.connectedMemberResolutionResult?.firstName || "",
      lastName: element.connectedMemberResolutionResult?.lastName || "",
      headline: element.connectedMemberResolutionResult?.headline || "",
      fullName:
        `${element.connectedMemberResolutionResult?.firstName} ${element.connectedMemberResolutionResult?.lastName}`.toLowerCase(),
      profilePicture: pictureUrl,

      birthDate: profile.birthDateOn ? `${profile.birthDateOn.day}-${profile.birthDateOn.month}` : undefined,
      phoneNumbers: profile.phoneNumbers?.map((p) => ({
        type: p.type || "",
        number: p.number,
      })) || [],
      emailAddresses: [{emailAddress: profile.emailAddress ?? "", type: ""}],
      addresses: [], // LinkedIn API does not provide addresses in new endpoints
      websites: (profile.websites ?? []).map((w) => ({
        url: w.url,
        type: w.type,
      })),
    });
  }

  toDatabaseObject(): Omit<
    Tables<"linkedin_contacts">,
    "user_id" | "created_at" | "internal_id"
  > {
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

      extended_data: JSON.stringify({
        birthDate: this.#birthDate,
        phoneNumbers: this.#phoneNumbers,
        emailAddresses: this.#emailAddresses,
        addresses: this.#addresses,
        websites: this.#websites,
      })
    };
  }

  toModel(): LinkedinContactModel {
    return {
      connectionId: this.#connectionId,
      entityUrn: this.#entityUrn,
      firstName: this.#firstName,
      lastName: this.#lastName,
      fullName: this.#fullName,
      publicIdentifier: this.#publicIdentifier,
      headline: this.#headline,
      profilePicture: this.#profilePicture,
      birthDate: this.#birthDate ? `${this.#birthDate.day}-${this.#birthDate.month}` : undefined,
      phoneNumbers: this.#phoneNumbers,
      emailAddresses: this.#emailAddresses ? this.#emailAddresses : [],
      addresses: this.#addresses,
      websites: this.#websites,
      internalId: this.#internalId,
    };
  }
}
