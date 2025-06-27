import { Tables } from "../types/database.types.ts";
import { Element, LinkedInProfile } from "../types/linkedin.types.ts";

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
