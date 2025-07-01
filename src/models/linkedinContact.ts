import { Tables } from "../types/database.types.ts";
import { Element, LinkedInProfile } from "../types/linkedin.types.ts";

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
  #birthDate?: string; // Format: YYYY-MM-DD or MM-DD
  #phoneNumbers: {
    type: string; // e.g., "MOBILE", "HOME", "WORK"
    number: string;
  }[];
  #emailAddresses: {
    emailAddress: string;
    type?: string; // e.g., "PERSONAL", "WORK"
  }[];
  #addresses: string[];
  #websites: {
    url: string;
    type?: string; // e.g., "PERSONAL", "WORK"
  }[];

  constructor(model: LinkedinContactModel) {
    this.#connectionId = model.connectionId;
    this.#entityUrn = model.entityUrn;
    this.#firstName = model.firstName;
    this.#lastName = model.lastName;
    this.#fullName = model.fullName || `${model.firstName} ${model.lastName}`;
    this.#publicIdentifier = model.publicIdentifier;
    this.#headline = model.headline;
    this.#profilePicture = model.profilePicture;
    this.#birthDate = model.birthDate;
    this.#phoneNumbers = model.phoneNumbers || [];
    this.#emailAddresses = model.emailAddresses || [];
    this.#addresses = model.addresses || [];
    this.#websites = model.websites || [];
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
    return this.#birthDate;
  }
  get phoneNumbers(): { type: string; number: string }[] {
    return this.#phoneNumbers;
  }
  get emailAddresses(): { emailAddress: string; type?: string }[] {
    return this.#emailAddresses;
  }
  get addresses(): string[] {
    return this.#addresses; 
  }
  get websites(): { url: string; type?: string }[] {
    return this.#websites;
  }

  static fromDatabaseObject(
    data: Tables<"linkedin_contacts">
  ): LinkedinContact {
    const contact: LinkedinContactModel = {
      connectionId: data.connection_id,
      publicIdentifier: data.public_identifier ?? "",
      entityUrn: data.entity_urn,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      headline: data.headline ?? undefined,
      fullName: data.full_name ?? undefined,
      birthDate: data.birth_date
        ? data.birth_date.split("-").slice(1).join("-") // Convert YYYY-MM
        : undefined,
      phoneNumbers: data.phone_numbers?.map((phone) => {
        const [type, number] = phone.split(":", 2);
        return { type: type || "UNKNOWN", number: number || "" };
      }) ?? [],
      emailAddresses: data.emails?.map((email) => {
        const [type, emailAddress] = email.split(":", 2);
        return {
          emailAddress: emailAddress || "",
          type: type || "UNKNOWN",
        };
      }) ?? [],
      addresses: data.addresses?.[0]?.split(";") || [],
      websites: data.websites?.map((website) => {
        const [type, url] = website.split(":", 2);
        return {
          url: url || "",
          type: type || "UNKNOWN",
        };
      }) ?? [],
      profilePicture: data.profile_picture ?? undefined,
    };
    return new LinkedinContact(contact);
  }

  static fromLinkedinData(
    element: Element,
    profile: LinkedInProfile,
    connectionId: string
  ): LinkedinContact {
    let pictureUrl;

    const artifacts =
      element.connectedMemberResolutionResult?.profilePicture?.displayImageReference?.vectorImage?.artifacts?.sort(
        (a, b) => a.width - b.width
      );
    const rootUrl =
      element.connectedMemberResolutionResult?.profilePicture
        ?.displayImageReference?.vectorImage?.rootUrl;
    if (artifacts && artifacts.length > 0 && rootUrl) {
      const largestArtifact = artifacts[artifacts.length - 1];
      pictureUrl = rootUrl + largestArtifact?.fileIdentifyingUrlPathSegment;
    }

    const contact: LinkedinContactModel = {
      connectionId: connectionId,
      publicIdentifier:
        element.connectedMemberResolutionResult?.publicIdentifier || "",
      entityUrn: element.entityUrn,
      firstName: element.connectedMemberResolutionResult?.firstName || "",
      lastName: element.connectedMemberResolutionResult?.lastName || "",
      headline: element.connectedMemberResolutionResult?.headline || "",
      fullName:
        `${element.connectedMemberResolutionResult?.firstName} ${element.connectedMemberResolutionResult?.lastName}`.toLowerCase(),
      birthDate: profile.birthDateOn
        ? `${profile.birthDateOn.month}-${profile.birthDateOn.day}`
        : undefined,
      phoneNumbers:
        profile.phoneNumbers?.map((phone) => ({
          type: phone.type || "UNKNOWN",
          number: phone.phoneNumber.number,
        })) ?? [],
      emailAddresses: profile.emailAddress
        ? [
            {
              emailAddress: profile.emailAddress.emailAddress,
              type: profile.emailAddress.type || "UNKNOWN",
            },
          ]
        : [],
      addresses: profile.address ? [profile.address] : [],
      websites:
        profile.websites?.map((website) => ({
          url: website.url,
          type: website.category || "UNKNOWN",
        })) || [],
      profilePicture: pictureUrl,
    };

    return new LinkedinContact(contact);
  }

  toDatabaseObject(): Omit<
    Tables<"linkedin_contacts">,
    "user_id" | "created_at"
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
      birth_date: this.#birthDate
        ? new Date(`1900-${this.#birthDate}`).toISOString()
        : null,
      phone_numbers:
        this.#phoneNumbers?.map((phone) => `${phone.type}:${phone.number}`) ??
        [],
      emails:
        this.#emailAddresses?.map(
          (email) => `${email.type}:${email.emailAddress}`
        ) ?? [],
      addresses: [this.#addresses?.join(";") ?? ""],
      websites:
        this.#websites?.map((website) => `${website.type}:${website.url}`) ??
        [],
    };
  }
}
