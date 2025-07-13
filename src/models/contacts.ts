import type { DAVVCard } from "tsdav";
import {
  parseVCardTimestamp,
  toVCardTimestamp,
  VCard,
  VCardProperty,
} from "../utils/vcard/index.ts";
import type { Tables } from "../types/database.types.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AddressBook } from "../models/addressBook.ts";
import { uploadImageToSupabase } from "../utils/storage/index.ts";
import { getImageData, Photo } from "../utils/image/index.ts";
import { LinkedinContact } from "./linkedinContact.ts";

// Check if the photo is a base64 encoded string

async function createDataUrl(blob: Blob): Promise<string> {
  return blob.arrayBuffer().then((buffer) => {
    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  });
}

export interface ContactModel {
  id: string; // UID;REV:12345;67890
  name: string; // FN: Simon Perreault
  addresses: VCardProperty[]; // [ ADR;TYPE=work:;;123 Main St;City;State;12345;Country ]
  emails: VCardProperty[]; // [ EMAIL;TYPE=work:simon.perreault@viagenie.ca ]
  phones: VCardProperty[]; // [ TEL;TYPE=work,voice:1-514-123-4567 ]
  photoUrl?: string; // URL to the contact's photo saved in google cloud storage
  lastUpdated?: Date; // Last updated date in ISO format
  photos?: Photo[]; // Base64 encoded photo data
  company?: string; // Company name
  title?: string; // Job title
  role?: string; // Job title
  linkedinContact?: string; // public_identifier for display
  linkedinContactId?: string; // internal_id for linking
  instagramUsername?: string; // Optional, used for tracking connections
  instagramContactId?: string; // Optional, used for tracking connections
  instagramConnectionId?: string; // Optional, used for tracking connections
  linkedinUrn?: string; // Optional, used for tracking connections
  photoBlurUrl?: string; // Optional, used for tracking connections
  addressBook: AddressBook; // Optional, used for tracking connections
  birthday?: Date;
  notes?: string[]; // Optional notes field, not part of the vCard spec
  others?: VCardProperty[]; // Other properties not part of the vCard spec or not yet implemented
  hidden?: boolean; // Whether the contact is hidden
}
export class Contact {
  readonly id: string; // UID;REV:12345;67890
  #name: string; // FN: Simon Perreault
  #addresses: VCardProperty[]; // [ ADR;TYPE=work:;;123 Main St;City;State;12345;Country ]
  #emails: VCardProperty[]; // [ EMAIL;TYPE=work:
  #phones: VCardProperty[]; // [ TEL;TYPE=work,voice:1-514-123-4567 ]
  #photos?: Photo[]; // Base64 encoded photo data
  #lastUpdated?: Date; // Last updated date in ISO format
  #company?: string; // Company name
  #title?: string; // Job title
  #role?: string; // Job title
  #linkedinContact?: string;
  #linkedinContactId?: string; // internal_id for linking
  #linkedinUrn?: string; // Optional, used for tracking connections

  #instagramUsername?: string; // Optional, used for tracking connections
  #instagramContactId?: string;
  #instagramConnectionId?: string;

  #birthday?: Date;
  #addressBook: AddressBook;
  #photoBlurUrl?: string; // Optional, used for tracking connections
  #notes: string[]; // Optional notes field, not part of the vCard spec
  #others: VCardProperty[]; // Other properties not part of the vCard spec or not yet implemented
  #hidden: boolean; // Whether the contact is hidden

  constructor({
    id,
    name,
    addresses,
    emails,
    phones,
    photos,
    lastUpdated,
    company,
    role,
    title,
    addressBook,
    linkedinContact,
    linkedinContactId,
    linkedinUrn,
    instagramUsername,
    instagramContactId,
    instagramConnectionId,
    birthday,
    photoBlurUrl,
    notes = [],
    others = [],
    hidden = false,
  }: ContactModel) {
    this.id = id;
    this.#name = name;
    this.#addresses = addresses;
    
    // Normalize emails
    this.#emails = emails.map(email => {
      const normalizedValue = normalizeEmail(email.value);
      return new VCardProperty(email.key, email.params, normalizedValue);
    });
    
    // Normalize phone numbers
    this.#phones = phones.map(phone => {
      const normalizedValue = normalizePhoneNumber(phone.value);
      return new VCardProperty(phone.key, phone.params, normalizedValue);
    });
    
    this.#photos = photos;
    this.#lastUpdated = lastUpdated ? new Date(lastUpdated) : undefined;
    this.#company = company;
    this.#title = title;
    this.#role = role;
    this.#linkedinContact = linkedinContact; // Optional, used for tracking connections
    this.#linkedinContactId = linkedinContactId; // internal_id for linking

    this.#instagramUsername = instagramUsername; // Optional, used for tracking connections
    this.#instagramContactId = instagramContactId; // Optional, used for tracking connections
    this.#instagramConnectionId = instagramConnectionId;

    this.#linkedinUrn = linkedinUrn;
    this.#addressBook = addressBook;
    this.#birthday = birthday;
    this.#photoBlurUrl = photoBlurUrl;
    this.#notes = notes;
    this.#others = others;
    this.#hidden = hidden;
  }

  get name(): string {
    return this.#name;
  }

  get linkedinContact(): string | undefined {
    return this.#linkedinContact;
  }

  get linkedinContactId(): string | undefined {
    return this.#linkedinContactId;
  }

  setLinkedinContact(linkedinContact?: LinkedinContact | null): void {
    if (linkedinContact) {
      this.#linkedinContact = linkedinContact.publicIdentifier;
      this.#linkedinContactId = linkedinContact.internal_id; // fix: use internal_id
      this.#linkedinUrn = linkedinContact.entityUrn;
    } else {
      this.#linkedinContact = undefined;
      this.#linkedinContactId = undefined;
      this.#linkedinUrn = undefined;
    }
  }

  get instagramUsername(): string | undefined {
    return this.#instagramUsername;
  }

  get instagramContactId(): string | undefined {
    return this.#instagramContactId;
  }

  get instagramConnectionId(): string | undefined {
    return this.#instagramConnectionId;
  }

  get addressBook(): AddressBook {
    return this.#addressBook;
  }

  get photoBlurUrl(): string | undefined {
    return this.#photoBlurUrl;
  }

  get title(): string | undefined {
    return this.#title;
  }

  get company(): string | undefined {
    return this.#company;
  }

  get role(): string | undefined {
    return this.#role;
  } 

  get birthday(): Date | undefined {
    return this.#birthday;
  } 

  get addresses(): VCardProperty[] {
    return this.#addresses;
  }

  get emails(): VCardProperty[] {
    return this.#emails;
  }

  get phones(): VCardProperty[] {
    return this.#phones;
  }

  get lastUpdated(): Date | undefined {
    return this.#lastUpdated;
  }

  get notes(): string[] {
    return this.#notes;
  }

  get hidden(): boolean {
    return this.#hidden;
  }

  set hidden(hidden: boolean) {
    this.#hidden = hidden;
  }

  toModel(): ContactModel {
    return {
      id: this.id,
      name: this.#name,
      addresses: this.#addresses,
      emails: this.#emails,
      phones: this.#phones,
      photos: this.#photos,
      lastUpdated: this.#lastUpdated,
      company: this.#company,
      title: this.#title,
      role: this.#role,
      addressBook: this.#addressBook,
      linkedinContact: this.#linkedinContact,
      linkedinContactId: this.#linkedinContactId,
      linkedinUrn: this.#linkedinUrn,
      instagramUsername: this.#instagramUsername,
      instagramContactId: this.#instagramContactId,
      instagramConnectionId: this.#instagramConnectionId,
      photoBlurUrl: this.photoBlurUrl,
      birthday: this.#birthday,
      notes: this.#notes,
      others: this.#others,
      hidden: this.#hidden,
    };
  }

  addPhoto(photo: Photo): void {
    if (!this.#photos) {
      this.#photos = [];
    }
    this.#photos.push(photo);
  } 

  async savePhoto(supabase: SupabaseClient): Promise<boolean> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Failed to get user data:", userError);
      throw new Error("Failed to get user data");
    }
    const userId = userData.user.id;

    const imagePath = `users/${userId}/contacts/${this.id}`.toLowerCase();

    if (!this.#photos || this.#photos.length === 0) {
      return false;
    }

    if (!this.#photos[0].data) {
      return false;
    }

    await uploadImageToSupabase(imagePath, this.#photos[0].data, supabase);

    return true;
  }

  getPhotoUrl(supabase: SupabaseClient, userId: string): string {
    const imagePath = `users/${userId}/contacts/${this.id}`.toLowerCase();

    return supabase.storage.from("assets").getPublicUrl(imagePath).data
      .publicUrl;
  }

  async loadPhoto(supabase: SupabaseClient): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Failed to get user data:", userError);
      throw new Error("Failed to get user data");
    }
    const userId = userData.user.id;

    const imagePath = `users/${userId}/contacts/${this.id}`.toLowerCase();

    let photoExists = false;
    try {
      const { data, error } = await supabase.storage
        .from("assets")
        .exists(imagePath);
      if (!error && data) {
        photoExists = data.valueOf();
      }
    } catch {
      photoExists = false;
    }

    if (photoExists) {
      const { data, error } = await supabase.storage
        .from("assets")
        .download(imagePath);
      if (error) {
        console.error(
          `Failed to download photo for contact ${this.id}:`,
          error
        );
        throw new Error("Failed to download photo");
      }

      // const buffer = Buffer.from(await data.arrayBuffer());
      // const { base64 } = await getPlaiceholder(buffer);

      this.#photos = [
        {
          data: await createDataUrl(data),
          type: data.type,
          // blurDataUrl: base64,
        },
      ];
    }
  }

  static async fromDavObjects(
    objects: DAVVCard[],
    addressBook: AddressBook
  ): Promise<Contact[]> {
    const contacts: Contact[] = [];

    console.log("Filtering objects to find contacts... Found:", objects.length);
    objects = objects.filter(Contact.isContact);
    console.log("Filtered objects to find contacts... Found:", objects.length);

    for (const object of objects) {
      const contact = await Contact.fromVcard(object, addressBook);
      contacts.push(contact);
      process.stdout.write(".");
    }
    console.log("\nContacts created:", contacts.length);
    return contacts;
  }

  static isContact(vcard: DAVVCard): boolean {
    const potentialContacts = VCard.parse(vcard.data);

    if (potentialContacts.length === 0) {
      console.warn("No valid vCard data found");
      return false;
    }
    if (potentialContacts.length > 1) {
      console.warn("Multiple vCards found, using the first one");
    }

    if (potentialContacts[0].has("KIND")) {
      const kind = potentialContacts[0].get("KIND").value;
      return kind !== "group";
    }
    if (potentialContacts[0].has("X-ADDRESSBOOKSERVER-KIND")) {
      const kind = potentialContacts[0].get("X-ADDRESSBOOKSERVER-KIND")[0]
        .value;
      return kind !== "group";
    }

    return true;
  }

  async toVCard(): Promise<DAVVCard> {
    const formatName = (name?: string): string => {
      if (!name) return "";
      // Split the name into parts and reverse it for vCard format
      const parts = name.split(" ");
      if (parts.length === 0) return "";
      const last = parts[parts.length - 1];
      const first = parts.slice(0, -1).join(" ");

      return `${last};${first}`;
    };

    const vcard = new VCard();
    vcard.set("uid", this.id);
    vcard.set("fn", this.#name);
    vcard.set("n", formatName(this.#name));
    this.#addresses.forEach((address) => {
      vcard.add(address.key, address.value, address.params);
    });
    this.#emails.forEach((email) => {
      vcard.add("email", email.value, email.params);
    });
    this.#phones.forEach((phone) => {
      vcard.add("tel", phone.value, phone.params);
    });

    this.#photos?.forEach((photo) => {
      const params: Record<string, string[]> = {
        type: [photo.type],
      };

      if (photo.data) params["encoding"] = ["b"];
      vcard.add("photo", photo.data ?? photo.url, params);
    });
    if (this.#lastUpdated)
      vcard.set("rev", toVCardTimestamp(this.#lastUpdated));

    if (this.#company) vcard.set("org", this.#company);
    if (this.#title) vcard.set("title", this.#title);
    if (this.#role) vcard.set("role", this.#role);

    if (this.#linkedinContact) {
      vcard.set("x-socialprofile", this.#linkedinContact, {
        type: ["linkedin"],
      });
      const linkedinUrl = `https://www.linkedin.com/in/${
        this.#linkedinContact
      }`;
      vcard.add("url", linkedinUrl, {
        type: ["linkedin"],
        label: ["LinkedIn"],
      });
    }
    if (this.#birthday) {
      let year = "--";
      if (this.#birthday.getFullYear() > 1900) {
        year = this.#birthday.getFullYear().toString();
      }

      vcard.set(
        "bday",
        `${year}${this.#birthday.getMonth() + 1}${this.#birthday.getDate()}`
      ); // Format as YYYYMMDD
    }

    if (this.#notes) {
      vcard.set("note", this.#notes);
    }

    for (const other of this.#others) {
      vcard.add(other.key, other.value, other.params);
    }

    const url = new URL(`${this.id}.vcf`, this.#addressBook.url).toString();

    return {
      // addressData: vcard.toString(),
      url: url, // Assuming the URL format for the contact
      data: vcard.stringify(),
      // etag: (this.lastUpdated?.getTime() ?? new Date().getTime()).toString()
    } as DAVVCard;
  }

  /**
   * Converts a dav.VCard object to a Contact instance.
   * @param contact - The VCard object to convert.
   * @param cardId - The ID of the CardDAV connection.
   * @returns A Contact instance.
   */
  static async fromVcard(
    contact: DAVVCard,
    addressBook: AddressBook
  ): Promise<Contact> {
    const DEFINED_KEYS = [
      "UID",
      "FN",
      "N",
      "ORG",
      "TITLE",
      "ROLE",
      "REV",
      "ADR",
      "EMAIL",
      "TEL",
      "PHOTO",
      "X-SOCIALPROFILE",
      "x-fm-online-other",
      "URL",
      "BDAY",
      "NOTE",
    ]

    const cards = VCard.parse(contact.data);
    if (cards.length === 0) {
      throw new Error("No valid vCard data found");
    }
    if (cards.length > 1) {
      console.warn("Multiple vCards found, using the first one");
    }
    const card = cards[0];

    const addresses = card.has("adr") ? card.get("adr") : [];
    
    // Normalize emails from vCard
    const emails = card.has("email") ? card.get("email").map(email => {
      const normalizedValue = normalizeEmail(email.value);
      return new VCardProperty(email.key, email.params, normalizedValue);
    }) : [];
    
    // Normalize phone numbers from vCard
    const phones = card.has("tel") ? card.get("tel").map(phone => {
      const normalizedValue = normalizePhoneNumber(phone.value);
      return new VCardProperty(phone.key, phone.params, normalizedValue);
    }) : [];

    const photos = card.has("photo")
      ? await Promise.all(card.get("photo").map((photo) => getImageData(photo)))
      : [];

    const lastUpdated = (() => {
      const rev = card.has("REV") && card.get("REV").value;
      const date = rev ? parseVCardTimestamp(rev) : new Date();
      return date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    })();

    const linkedinIndentifier = (() => {
      if (card.has("x-socialprofile")) {
        const profiles = card.get("x-socialprofile");
        for (const profile of profiles) {
          if (profile.params.type?.includes("linkedin"))
            return profile.value.split("/").slice(-2, -1)[0]; // Extract the identifier from the URL
        }
      }

      const keys = ["x-fm-online-other", "url"];
      for (const key of keys) {
        if (card.has(key)) {
          const profiles = card.get(key);
          for (const profile of profiles) {
            if (profile.params.type?.includes("linkedin")) {
              return profile.value.split("/").slice(-2, -1)[0]; // Extract the identifier from the URL
            }
          }
        }
      }
    })();

    const birthday = (() => {
      if (card.has("BDAY")) {
        const bday = card.get("BDAY").value;
        if (/^(\d){8}$/.test(bday)) {
          const year = bday.slice(0, 4);
          const month = bday.slice(4, 6);
          const day = bday.slice(6, 8);
          return new Date(`${year}-${month}-${day}`);
        }
        if (/^(\d){4}-(\d){2}-(\d){2}$/.test(bday)) {
          const [year, month, day] = bday.split("-");
          return new Date(`${year}-${month}-${day}`);
        }
        if (/^(\d){4}$/.test(bday)) {
          const month = bday.slice(0, 2);
          const day = bday.slice(2, 4);
          return new Date(`1604-${month}-${day}`);
        }
      }
      return undefined;
    })();

    return new Contact({
      id: card.get("UID").value,
      name: card.get("FN").value,
      addresses,
      emails,
      phones,
      photos,
      lastUpdated,
      company: card.has("ORG") ? card.get("ORG").value : undefined,
      title: card.has("TITLE") ? card.get("TITLE").value : undefined,
      role: card.has("ROLE") ? card.get("ROLE").value : undefined,
      addressBook: addressBook,
      linkedinContact: linkedinIndentifier,
      linkedinContactId: undefined, // Not available in vCard
      birthday,
      notes: card.has("NOTE") ? card.get("NOTE").map((note) => note.value) : [],
      others: Array.from(card.records.entries().filter(([key]) => !DEFINED_KEYS.includes(key.toUpperCase())).flatMap(([,properties]) => properties))
    })
  }

  static fromDatabaseObject(
    data: Tables<"carddav_contacts"> & {
      linkedin_contacts: { internal_id: string; public_identifier: string | null; entity_urn: string | null } | null;
      instagram_contacts: { internal_id: string; username: string | null } | null;
      carddav_addressbooks: Tables<"carddav_addressbooks">;
    }
  ): Contact {
    const others: VCardProperty[] = []

    if (data.other && Array.isArray(data.other)) {
      for (const other of data.other) {
        if (!other) continue;
        others.push(VCardProperty.parse(other.toString()));
      }
    }

    return new Contact({
      name: data.name ?? "",
      addresses: data.addresses.map((adr) => VCardProperty.parse(adr)),
      emails: data.emails.map((email) => VCardProperty.parse(email)),
      phones: data.phones.map((phone) => VCardProperty.parse(phone)),
      photos: [],
      company: data.company ?? undefined,
      title: data.title ?? undefined,
      role: data.role ?? undefined,
      id: data.id_is_uppercase ? data.id.toUpperCase() : data.id,

      linkedinContact: data.linkedin_contacts?.public_identifier ?? undefined,
      linkedinContactId: data.linkedin_id ?? undefined,
      linkedinUrn: data.linkedin_contacts?.entity_urn ?? undefined,

      instagramUsername: data.instagram_contacts?.username ?? undefined,
      instagramContactId: data.instagram_id ?? undefined,
      instagramConnectionId: undefined, // Remove if not in schema

      photoBlurUrl: data.photo_blur_url ?? undefined,
      lastUpdated: new Date(data.last_updated),
      addressBook: AddressBook.fromDatabaseObject(data.carddav_addressbooks),
      birthday: data.birth_date ? new Date(data.birth_date) : undefined,
      notes: data.notes ? data.notes.filter((note) => note.trim() !== "") : [],
      others,
      hidden: data.hidden ?? false,
    });
  }

  toDatabaseObject(): Omit<
    Tables<"carddav_contacts">,
    "user_id" | "created_at"
  > {
    let photo_blur_url = this.#photoBlurUrl ?? null;

    if (
      this.#photos &&
      this.#photos.length > 0 &&
      this.#photos[0].blurDataUrl
    ) {
      photo_blur_url = this.#photos[0].blurDataUrl;
    }

    return {
      id: this.id,
      name: this.#name,
      addresses: this.#addresses.map((address) => address.stringify()),
      emails: this.#emails.map((email) => email.stringify()),
      phones: this.#phones.map((phone) => phone.stringify()),
      company: this.#company ?? null,
      title: this.#title ?? null,
      role: this.#role ?? null,
      linkedin_id: this.#linkedinContactId ?? null,
      instagram_id: this.#instagramContactId ?? null,
      last_updated:
        this.#lastUpdated?.toISOString() ?? new Date().toISOString(),
      photo_blur_url,
      address_book: this.#addressBook.id,
      id_is_uppercase: this.id === this.id.toUpperCase(),
      birth_date: this.#birthday
        ? this.#birthday.toISOString().split("T")[0] // Format as YYYY-MM-DD
        : null,
      notes: this.#notes.length > 0 ? this.#notes : null,
      other: this.#others.length > 0 ? this.#others.map((other) => other.stringify()) : null,
      hidden: this.#hidden,
    };
  }

  addPhone(types: string[], phoneNumber: string): void {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhoneNumber) {
      console.warn(`Invalid phone number: ${phoneNumber}`);
      return;
    }

    const idx = this.#phones.findIndex(
      (p) => normalizePhoneNumber(p.value) === normalizedPhoneNumber
    );

    if (idx < 0) {
      const newTypes = new Set(types.map((type) => type.toLowerCase()));
      this.#phones.push(
        new VCardProperty(
          "TEL",
          { TYPE: Array.from(newTypes) },
          normalizedPhoneNumber
        )
      );
    } else {
      this.#phones[idx].appendParam(
        "TYPE",
        types.map((type) => type.toLowerCase())
      );
    }

    console.log(
      `Added phone number: ${normalizedPhoneNumber} with type ${types} to contact ${
        this.#name
      }`
    );
  }

  addEmail(types: string[], emailAddress: string): void {
    const normalizedEmail = normalizeEmail(emailAddress);

    if (!normalizedEmail) {
      console.warn(`Invalid email address: ${emailAddress}`);
      return;
    }

    const idx = this.#emails.findIndex(
      (e) => normalizeEmail(e.value) === normalizedEmail
    );

    if (idx < 0) {
      this.#emails.push(
        new VCardProperty(
          "EMAIL",
          { TYPE: types.map((type) => type.toLowerCase()) },
          normalizedEmail
        )
      );
    } else {
      this.#emails[idx].appendParam(
        "TYPE",
        types.map((type) => type.toLowerCase())
      );
    }

    console.log(
      `Added email address: ${normalizedEmail} with type ${types} to contact ${
        this.#name
      }`
    );
  }
}

function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }

  let normalized = phoneNumber.trim();

  // Remove all whitespace
  normalized = normalized.replace(/\s+/g, '');

  // Handle Australian mobile numbers: +61 04xx -> +614xx
  if (normalized.startsWith('+61 04')) {
    normalized = normalized.replace('+61 04', '+614');
  }

  // Handle Australian mobile numbers: 04xx -> +614xx (if no country code)
  if (normalized.startsWith('04') && !normalized.startsWith('+')) {
    normalized = '+61' + normalized.substring(1);
  }

  // Handle Australian landline: 0x xxxx xxxx -> +61x xxxx xxxx
  if (normalized.startsWith('0') && normalized.length === 10 && !normalized.startsWith('+')) {
    normalized = '+61' + normalized.substring(1);
  }

  // Remove any non-digit characters except for +
  normalized = normalized.replace(/[^0-9+]/g, '');

  // Ensure it starts with + if it's an international number
  if (normalized.length > 10 && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  return normalized;
}

function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Trim whitespace and convert to lowercase
  return email.trim().toLowerCase();
}
