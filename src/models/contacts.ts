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
  linkedinContact?: string; // Optional, used for tracking connections
  linkedinUrn?: string; // Optional, used for tracking connections
  photoBlurUrl?: string; // Optional, used for tracking connections
  addressBook: AddressBook; // Optional, used for tracking connections
  birthday?: Date;
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
  #linkedinUrn?: string; // Optional, used for tracking connections
  #birthday?: Date;
  #addressBook: AddressBook;
  #photoBlurUrl?: string; // Optional, used for tracking connections

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
    linkedinUrn,
    birthday,
    photoBlurUrl
  }: ContactModel) {
    this.id = id;
    this.#name = name;
    this.#addresses = addresses;
    this.#emails = emails;
    this.#phones = phones;
    this.#photos = photos;
    this.#lastUpdated = lastUpdated ? new Date(lastUpdated) : undefined;
    this.#company = company;
    this.#title = title;
    this.#role = role;
    this.#linkedinContact = linkedinContact; // Optional, used for tracking connections
    this.#linkedinUrn = linkedinUrn;
    this.#addressBook = addressBook;
    this.#birthday = birthday;
    this.#photoBlurUrl = photoBlurUrl;
  }

  get name(): string {
    return this.#name;
  }

  get linkedinContact(): string | undefined {
    return this.#linkedinContact;
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
      linkedinUrn: this.#linkedinUrn,
      photoBlurUrl: this.photoBlurUrl,
      birthday: this.#birthday,
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
    const cards = VCard.parse(contact.data);
    if (cards.length === 0) {
      throw new Error("No valid vCard data found");
    }
    if (cards.length > 1) {
      console.warn("Multiple vCards found, using the first one");
    }
    const card = cards[0];

    const addresses = card.has("adr") ? card.get("adr") : [];
    const emails = card.has("email") ? card.get("email") : [];
    const phones = card.has("tel") ? card.get("tel") : [];

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
      birthday,
    });
  }

  static fromDatabaseObject(
    data: Tables<"carddav_contacts"> & {
      linkedin_contacts: { public_identifier: string | null, entity_urn: string | null } | null;
      carddav_addressbooks: Tables<"carddav_addressbooks">;
    }
  ): Contact {
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
      // photo: contact. ?? undefined,
      // photoUrl: contact. ?? undefined,
      linkedinContact: data.linkedin_contacts?.public_identifier ?? undefined,
      linkedinUrn: data.linkedin_contacts?.entity_urn ?? undefined,
      photoBlurUrl: data.photo_blur_url ?? undefined,
      lastUpdated: new Date(data.last_updated),
      addressBook: AddressBook.fromDatabaseObject(data.carddav_addressbooks),
      birthday: data.birth_date ? new Date(data.birth_date) : undefined,
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
      linkedin_contact: this.#linkedinUrn ?? null,
      last_updated:
        this.#lastUpdated?.toISOString() ?? new Date().toISOString(),
      photo_blur_url,
      address_book: this.#addressBook.id,
      id_is_uppercase: this.id === this.id.toUpperCase(),
      birth_date: this.#birthday
        ? this.#birthday.toISOString().split("T")[0] // Format as YYYY-MM-DD
        : null,
    };
  }

  addPhone(types: string[], phoneNumber: string): void {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhoneNumber) {
      console.warn(`Invalid phone number: ${phoneNumber}`);
      return;
    }

    const idx = this.#phones.findIndex(
      (p) => p.value === normalizedPhoneNumber
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
    if (!emailAddress) {
      console.warn(`Invalid email address: ${emailAddress}`);
      return;
    }

    emailAddress = emailAddress.toLowerCase().trim();

    const idx = this.#emails.findIndex(
      (e) => e.value.toLowerCase() === emailAddress
    );

    if (idx < 0) {
      this.#emails.push(
        new VCardProperty(
          "EMAIL",
          { TYPE: types.map((type) => type.toLowerCase()) },
          emailAddress
        )
      );
    } else {
      this.#emails[idx].appendParam(
        "TYPE",
        types.map((type) => type.toLowerCase())
      );
    }

    console.log(
      `Added email address: ${emailAddress} with type ${types} to contact ${
        this.#name
      }`
    );
  }
}

function normalizePhoneNumber(phoneNumber: string): string {
  // Implement your phone number normalization logic here

  // If the number starts with +61 04, remove the 0
  if (phoneNumber.startsWith("+61 04")) {
    phoneNumber = phoneNumber.replace("+61 04", "+614");
  }

  // remove whitespace
  phoneNumber = phoneNumber.replace(/\s+/g, "");

  // remove any non-digit characters except for +
  phoneNumber = phoneNumber.replace(/[^0-9+]/g, "");

  return phoneNumber;
}
