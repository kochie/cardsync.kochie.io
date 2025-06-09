import * as dav from "dav";
import vCard from "vcf";
// import util from "util";

export interface ContactModel {
  id: string; // UID;REV:12345;67890
  name: string; // FN: Simon Perreault
  address: string[]; // [ ADR;TYPE=work:;;123 Main St;City;State;12345;Country ]
  emails: string[]; // [ EMAIL;TYPE=work:simon.perreault@viagenie.ca ]
  phone: string[]; // [ TEL;TYPE=work,voice:1-514-123-4567 ]
  photoUrl?: string; // URL to the contact's photo saved in google cloud storage
  lastUpdated?: Date; // Last updated date in ISO format
  sources: string[]; // Source id of the contact, e.g., "carddav:12345" or "google:67890"
  photo?: string; // Base64 encoded photo data
  company?: string; // Company name
  title?: string; // Job title
  role?: string; // Job title
}

export class Contact implements ContactModel {
  photoUrl?: string | undefined;
  id: string; // UID;REV:12345;67890
  name: string; // FN: Simon Perreault
  address: string[]; // [ ADR;TYPE=work:;;123 Main St;City;State;12345;Country ]
  emails: string[]; // [ EMAIL;TYPE=work:
  phone: string[]; // [ TEL;TYPE=work,voice:1-514-123-4567 ]
  photo?: string; // Base64 encoded photo data
  lastUpdated?: Date; // Last updated date in ISO format
  sources: string[]; // Source id of the contact, e.g., "carddav:12345" or "google:67890"
  company?: string; // Company name
  title?: string; // Job title
  role?: string; // Job title

  constructor({
    id,
    name,
    address,
    emails,
    phone,
    photoUrl,
    photo,
    lastUpdated,
    sources,
    company,
    role,
    title,
  }: ContactModel) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.emails = emails;
    this.phone = phone;
    this.photo = photo;
    this.lastUpdated = lastUpdated ? new Date(lastUpdated) : undefined;
    this.sources = sources;
    this.photoUrl = photoUrl;
    this.company = company;
    this.title = title;
    this.role = role;
  }

  static fromAddressBook(
    addressBook: dav.AddressBook,
    cardId: string
  ): Contact[] {
    const contacts: Contact[] = [];
    for (const contact of addressBook.objects) {
      if (contact instanceof dav.VCard) {
        contacts.push(Contact.fromVcard(contact, cardId));
      } else {
        console.warn("Unsupported contact type:", contact);
      }
    }
    return contacts;
  }

  /**
   * Converts a dav.VCard object to a Contact instance.
   * @param contact - The VCard object to convert.
   * @param cardId - The ID of the CardDAV connection.
   * @returns A Contact instance.
   */
  static fromVcard(contact: dav.VCard, cardId: string): Contact {
    // console.log(
    //   util.inspect(contact.addressData, {
    //     showHidden: false,
    //     depth: null,
    //     colors: true,
    //   })
    // );
    const parsed = new vCard().parse(contact.addressData);
    const contactId = parsed.get("uid").valueOf();
    if (!contactId) {
      throw new Error("Contact ID not found");
    }

    const emails: string[] = [];
    if (parsed.get("email")) {
      const email = parsed.get("email");
      if (Array.isArray(email)) {
        email.forEach((e) => emails.push(e.toString()));
      } else {
        emails.push(email.toString());
      }
    }

    const phone: string[] = [];
    if (parsed.get("tel")) {
      const tel = parsed.get("tel");
      if (Array.isArray(tel)) {
        phone.forEach((p) => phone.push(p.toString()));
      } else {
        phone.push(tel.toString());
      }
    }

    const address: string[] = [];
    if (parsed.get("adr")) {
      const adr = parsed.get("adr");
      if (Array.isArray(adr)) {
        adr.forEach((a) => address.push(a.toString()));
      } else {
        address.push(adr.toString());
      }
    }

    return new Contact({
      id: contactId.toString(),
      name: parsed.get("fn").valueOf().toString(),
      address,
      emails,
      phone,
      photo: parsed.get("photo")?.toString(),
      lastUpdated: parsed.get("rev")?.valueOf()
        ? new Date(parsed.get("rev").valueOf().toString())
        : undefined,
      company: parsed.get("org")?.valueOf().toString(),
      title: parsed.get("title")?.valueOf().toString(),
      role: parsed.get("role")?.valueOf().toString(),
      sources: [`carddav:${cardId}`], // Assuming source is carddav with contact ID
    });
  }
}
