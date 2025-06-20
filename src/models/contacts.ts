import { getPlaiceholder } from "plaiceholder";
import { DAVVCard } from "tsdav";
import { createClient } from "@/utils/supabase/server";
import { VCard, VCardProperty } from "@/utils/vcard/vcard";
import { randomUUID } from "crypto";
import { Tables } from "@/types/database.types";

type Photo =
  | { data: string; type: string; blurDataUrl?: string; url?: string }
  | { url: string; type: string; blurDataUrl?: string; data?: undefined };

function parseVCardTimestamp(vcardTimestamp: string) {
  // Format: YYYYMMDDTHHMMSSZ
  const isoString = vcardTimestamp.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
  return new Date(isoString);
}

function toVCardTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function parseVCardPhoto(contactId: string): Promise<Photo[]> {
  // 2.1: PHOTO;JPEG:http://example.com/photo.jpg
  // 2.1: PHOTO;JPEG;ENCODING=BASE64:[base64-data]
  // 3.0: PHOTO;TYPE=JPEG;VALUE=URI:http://example.com/photo.jpg
  // 3.0: PHOTO;TYPE=JPEG;ENCODING=b:[base64-data]
  // 4.0: PHOTO;MEDIATYPE=image/jpeg:http://example.com/photo.jpg
  // 4.0: PHOTO;ENCODING=BASE64;TYPE=JPEG:[base64-data]

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Failed to get user data:", userError);
    throw new Error("Failed to get user data");
  }
  const userId = userData.user.id;

  const imagePath = `users/${userId}/contacts/${contactId}`.toLowerCase();

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
        `Failed to download photo for contact ${contactId}:`,
        error
      );
      throw new Error("Failed to download photo");
    }

    // Create a data URL from the downloaded file
    // const dataUrl = URL.createObjectURL(data);

    const buffer = Buffer.from(await data.arrayBuffer());
    const { base64 } = await getPlaiceholder(buffer);

    return [
      {
        data: await createDataUrl(data),
        type: data.type,
        blurDataUrl: base64,
      },
    ];
  }
  return []; // No photo found for the contact

  // Check if the photo is a base64 encoded string
}

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
  photos: Photo[]; // Base64 encoded photo data
  company?: string; // Company name
  title?: string; // Job title
  role?: string; // Job title
  linkedinContact?: string; // Optional, used for tracking connections
  photoBlurUrl?: string; // Optional, used for tracking connections
  addressBook: string; // Optional, used for tracking connections
  birthday?: Date;
}

export interface ContactWithSources extends ContactModel {
  linkedinPublicIdentifier?: string; // LinkedIn public identifier for the contact
  connectionId: string; // Connection ID for the contact
  connectionName?: string; // Connection name for the contact
}

export class Contact implements ContactModel {
  id: string; // UID;REV:12345;67890
  name: string; // FN: Simon Perreault
  addresses: VCardProperty[]; // [ ADR;TYPE=work:;;123 Main St;City;State;12345;Country ]
  emails: VCardProperty[]; // [ EMAIL;TYPE=work:
  phones: VCardProperty[]; // [ TEL;TYPE=work,voice:1-514-123-4567 ]
  photos: Photo[]; // Base64 encoded photo data
  lastUpdated?: Date; // Last updated date in ISO format
  company?: string; // Company name
  title?: string; // Job title
  role?: string; // Job title
  linkedinContact?: string;
  addressBook: string; // Optional, used for tracking connections
  birthday?: Date;

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
    birthday,
  }: ContactModel) {
    this.id = id;
    this.name = name;
    this.addresses = addresses;
    this.emails = emails;
    this.phones = phones;
    this.photos = photos;
    this.lastUpdated = lastUpdated ? new Date(lastUpdated) : undefined;
    this.company = company;
    this.title = title;
    this.role = role;
    this.linkedinContact = linkedinContact; // Optional, used for tracking connections
    this.addressBook = addressBook;
    this.birthday = birthday;
  }

  static async fromDavObjects(
    objects: DAVVCard[],
    addressBook: string
  ): Promise<Contact[]> {
    const contacts: Contact[] = [];

    console.log("Filtering objects to find contacts... Found:", objects.length);
    objects = objects.filter(Contact.isContact);
    console.log("Filtered objects to find contacts... Found:", objects.length);

    for (const object of objects) {
      const contact = await this.fromVcard(object, addressBook);
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
    vcard.set("fn", this.name);
    vcard.set("n", formatName(this.name));
    this.addresses.forEach((address) => {
      vcard.add(address.key, address.value, address.params);
    });
    this.emails.forEach((email) => {
      vcard.add("email", email.value, email.params);
    });
    this.phones.forEach((phone) => {
      vcard.add("tel", phone.value, phone.params);
    });

    this.photos.forEach((photo) => {
      const params: Record<string, string[]> = {
        type: [photo.type],
      };

      if (photo.data) params["encoding"] = ["b"];
      vcard.add("photo", photo.data ?? photo.url, params);
    });
    if (this.lastUpdated) {
      vcard.set("rev", toVCardTimestamp(this.lastUpdated));
    }
    if (this.company) {
      vcard.set("org", this.company);
    }
    if (this.title) {
      vcard.set("title", this.title);
    }
    if (this.role) {
      vcard.set("role", this.role);
    }
    if (this.linkedinContact) {
      vcard.set("x-socialprofile", this.linkedinContact, {
        type: ["linkedin"],
      });
      const linkedinUrl = `https://www.linkedin.com/in/${this.linkedinContact}`;
      vcard.add("url", linkedinUrl, {
        type: ["linkedin"],
        label: ["LinkedIn"],
      });
      // vcard.add("X-FM-ONLINE-OTHER", linkedinUrl, {
      //   type: ["linkedin"],
      //   label: ["LinkedIn"],
      // });
    }
    if (this.birthday) {
      let year = "--";
      if (this.birthday.getFullYear() > 1900) {
        year = this.birthday.getFullYear().toString();
      }

      vcard.set(
        "bday",
        `${year}${this.birthday.getMonth() + 1}${this.birthday.getDate()}`
      ); // Format as YYYYMMDD
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("carddav_contacts")
      .select(
        `id,carddav_addressbooks (
            id,
            connection_id,
            url,
            carddav_connections (
              id
            )
          )`
      )
      .eq("address_book", this.addressBook)
      .eq("id", this.id)
      .single();
    if (error) {
      console.error("Error fetching contact data:", error);
      throw new Error("Failed to fetch contact data from database");
    }

    return {
      // addressData: vcard.toString(),
      url: `${data.carddav_addressbooks.url}${this.id}.vcf`, // Assuming the URL format for the contact
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
    addressBook: string
  ): Promise<Contact> {
    // console.log("Converting VCard to Contact:", contact);
    // console.log(contact.data);

    const cards = VCard.parse(contact.data);
    if (cards.length === 0) {
      throw new Error("No valid vCard data found");
    }
    if (cards.length > 1) {
      console.warn("Multiple vCards found, using the first one");
    }
    const card = cards[0];
    // console.log(inspect(card, { depth: null, colors: true }));

    // console.log("Parsed VCard:", cards);

    const addresses = card.has("adr") ? card.get("adr") : [];
    const emails = card.has("email") ? card.get("email") : [];
    const phones = card.has("tel") ? card.get("tel") : [];

    const photos = card.has("photo")
      ? await Promise.all(
          card.get("photo").map(async (p) => {
            const isEmbedded = !p.value.startsWith("http");
            if (isEmbedded) {
              const { base64 } = await getPlaiceholder(
                Buffer.from(p.value, "base64")
              );

              return {
                data: p.value, // If the photo is a URL, keep it as undefined
                type: p.params.type?.[0] ?? "image/jpeg", // Default to jpeg if no type is specified
                blurDataUrl: base64,
              };
            } else {
              const data = await fetch(p.value); // Ensure the URL is valid, this will throw if the URL is not reachable
              const { base64 } = await getPlaiceholder(
                Buffer.from(await data.arrayBuffer())
              );

              return {
                url: p.value, // If the photo is a URL, keep it as undefined
                type: p.params.type?.[0] ?? "image/jpeg", // Default to jpeg if no type is specified
                blurDataUrl: base64,
              };
            }
          })
        )
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
        // Format: YYYYMMDD or MMDD
        const year = bday.length === 8 ? bday.slice(0, 4) : "1900"; // Default to 1900 if year is not provided
        const month = bday.length === 8 ? bday.slice(4, 6) : bday.slice(0, 2);
        const day = bday.length === 8 ? bday.slice(6, 8) : bday.slice(2, 4);
        return new Date(`${year}-${month}-${day}`);
      }
      return undefined;
    })();

    return new Contact({
      id: card.has("UID") ? card.get("UID").value : randomUUID(),
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

  static async fromDatabaseObject(
    data: Tables<"carddav_contacts"> & {
      linkedin_contacts: { public_identifier: string | null } | null;
      carddav_addressbooks: { id: string };
    }
  ): Promise<Contact> {
    return new Contact({
      name: data.name ?? "",
      addresses: data.addresses.map((adr) => VCardProperty.parse(adr)),
      emails: data.emails.map((email) => VCardProperty.parse(email)),
      phones: data.phones.map((phone) => VCardProperty.parse(phone)),
      photos: await parseVCardPhoto(data.id),
      company: data.company ?? undefined,
      title: data.title ?? undefined,
      role: data.role ?? undefined,
      id: data.id_is_uppercase ? data.id.toUpperCase() : data.id,
      // photo: contact. ?? undefined,
      // photoUrl: contact. ?? undefined,
      linkedinContact: data.linkedin_contacts?.public_identifier ?? undefined,
      photoBlurUrl: data.photo_blur_url ?? undefined,
      lastUpdated: new Date(data.last_updated),
      addressBook: data.carddav_addressbooks.id,
      birthday: data.birth_date ? new Date(data.birth_date) : undefined,
    });
  }

  toDatabaseObject(): Omit<
    Tables<"carddav_contacts">,
    "user_id" | "created_at"
  > {
    return {
      id: this.id,
      name: this.name,
      addresses: this.addresses.map((address) => address.stringify()),
      emails: this.emails.map((email) => email.stringify()),
      phones: this.phones.map((phone) => phone.stringify()),
      company: this.company ?? null,
      title: this.title ?? null,
      role: this.role ?? null,
      linkedin_contact: null,
      last_updated: this.lastUpdated?.toISOString() ?? new Date().toISOString(),
      photo_blur_url:
        this.photos.length > 0 ? this.photos[0].blurDataUrl ?? null : null,
      address_book: this.addressBook,
      id_is_uppercase: this.id === this.id.toUpperCase(),
      birth_date: this.birthday
        ? this.birthday.toISOString().split("T")[0] // Format as YYYY-MM-DD
        : null,
    };
  }
}
