import { Database, Tables } from "@/types/database.types";
import { Contact } from "./contacts";
import { DAVVCard } from "tsdav";
import { parseVCardTimestamp, VCard } from "@/utils/vcard/vcard";
import { AddressBook } from "./addressBook";
import { SupabaseClient } from "@supabase/supabase-js";

export interface GroupModel {
  id: string;
  name?: string;
  description?: string;
  members: string[]; // Array of member IDs
  createdAt?: Date; // Optional, defaults to current date
  updatedAt?: Date; // Optional, defaults to current date
  readonly?: boolean; // Optional, defaults to false
  addressBook: AddressBook;
}

const readonlyGroups = ["vips"];

export class Group {
  readonly #id: string;
  #name?: string;
  #description?: string;
  readonly #createdAt: Date;
  #updatedAt: Date;
  readonly #addressBook: AddressBook;
  readonly #readonly: boolean = false; // Default to false, can be set later
  #members: string[]; // Array of member IDs, can be fetched dynamically

  constructor(data: GroupModel) {
    this.#id = data.id || crypto.randomUUID();
    this.#name = data.name;
    this.#description = data.description;
    this.#createdAt = data.createdAt || new Date();
    this.#updatedAt = data.updatedAt || new Date();
    this.#readonly = data.readonly ?? false; // Default to false, can be set later
    this.#members = data.members || [];

    this.#addressBook = data.addressBook;
  }

  get addressBookId(): string {
    return this.#addressBook.id;
  }

  get memberIds(): string[] {
    return this.#members;
  }

  get readonly(): boolean {
    return this.#readonly;
  }

  get id(): string {
    return this.#id;
  }

  get name(): string | undefined {
    return this.#name;
  }

  set name(name: string) {
    if (!this.#readonly) {
      this.#name = name;
      this.#updatedAt = new Date();
    }
  }

  get description(): string | undefined {
    return this.#description;
  }

  set description(description: string) {
    if (!this.#readonly) {
      this.#description = description;
      this.#updatedAt = new Date();
    }
  }

  static fromDavObjects(cards: DAVVCard[], addressBook: AddressBook): Group[] {
    return cards
      .filter((card) => Group.isGroup(card))
      .map((group) => Group.fromVcard(group, addressBook));
  }

  static isGroup(vcard: DAVVCard): boolean {
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
      return kind === "group";
    }
    if (potentialContacts[0].has("X-ADDRESSBOOKSERVER-KIND")) {
      const kind = potentialContacts[0].get("X-ADDRESSBOOKSERVER-KIND")[0]
        .value;
      return kind === "group";
    }

    return false;
  }

  async getMembers(supabase: SupabaseClient<Database>): Promise<Contact[]> {
    const { data, error } = await supabase
      .from("carddav_group_members")
      .select(
        `
        *,
        carddav_contacts (
            *,
            linkedin_contacts (*),
            carddav_addressbooks (*)
        )
        `
      )
      .eq("group_id", this.#id)
      .eq("address_book", this.#addressBook.id);

    if (error) {
      console.error("Error fetching group members:", error);
      throw new Error("Failed to fetch group members");
    }

    return await Promise.all(
      data.map((memberData) =>
        Contact.fromDatabaseObject(memberData.carddav_contacts)
      )
    );
  }

  async addMember(
    contact: Contact,
    supabase: SupabaseClient<Database>
  ): Promise<void> {
    if (this.#members.includes(contact.id)) return;

    const { error: upsertError } = await supabase
      .from("carddav_group_members")
      .upsert({
        member_id: contact.id,
        group_id: this.#id,
        address_book: this.#addressBook.id,
      });

    if (upsertError) {
      console.error("Error adding group member:", upsertError);
      throw new Error("Failed to add group member");
    }

    this.#members.push(contact.id);
    this.#updatedAt = new Date();
    const { error: updateError } = await supabase
      .from("carddav_groups")
      .update({
        updated_at: this.#updatedAt.toISOString(),
      })
      .eq("id", this.#id);

    if (updateError) {
      console.error("Error updating group members:", updateError);
      throw new Error("Failed to update group members");
    }
  }

  /*
   * Removes a member from the group. Will update the group in the database
   * and remove the member from the group members list.
   * @param {string} memberId - The ID of the member to remove.
   * @param {SupabaseClient} supabase - The Supabase client instance.
   * @throws Will throw an error if the member is not found or if the removal fails.
   */
  async removeMember(
    contact: Contact,
    supabase: SupabaseClient<Database>
  ): Promise<void> {
    if (!this.#members.includes(contact.id)) return;

    const { error: deleteError } = await supabase
      .from("carddav_group_members")
      .delete()
      .eq("member_id", contact.id)
      .eq("address_book", this.#addressBook.id)
      .eq("group_id", this.#id);

    if (deleteError) {
      console.error("Error removing group member:", deleteError);
      throw new Error("Failed to remove group member");
    }

    this.#members = this.#members.filter((id) => id !== contact.id);

    this.#updatedAt = new Date();
    const { error: updateError } = await supabase
      .from("carddav_groups")
      .update({
        updated_at: this.#updatedAt.toISOString(),
      })
      .eq("id", this.#id);

    if (updateError) {
      console.error("Error updating group members:", updateError);
      throw new Error("Failed to update group members");
    }
  }

  static fromVcard(group: DAVVCard, addressBook: AddressBook): Group {
    const cards = VCard.parse(group.data);
    if (cards.length === 0) {
      throw new Error("No valid vCard data found");
    }
    if (cards.length > 1) {
      console.warn("Multiple vCards found, using the first one");
    }
    const card = cards[0];

    const id = card.has("UID") ? card.get("UID").value : crypto.randomUUID();


    
    const members = card.has("X-ADDRESSBOOKSERVER-MEMBER")
      ? card
          .get("X-ADDRESSBOOKSERVER-MEMBER")
          .map((member) => member.value.replace("urn:uuid:", ""))
      : [];
    
    if (card.has("X-ADDRESSBOOKSERVER-MEMBER")) {
        console.log(card.get("X-ADDRESSBOOKSERVER-MEMBER"))
    }

    const lastUpdated = (() => {
      const rev = card.has("REV") && card.get("REV").value;
      const date = rev ? parseVCardTimestamp(rev) : new Date();
      return date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    })();

    return new Group({
      id: id,
      readonly: readonlyGroups.includes(id.toLowerCase()),
      name: card.has("N") ? card.get("N").value : undefined,
      addressBook: addressBook,
      members,
      updatedAt: lastUpdated,
      description: card.has("NOTE") ? card.get("NOTE")[0].value : undefined,
    });
  }

  toVcard(): DAVVCard {
    const vcard = new VCard();
    vcard.set("UID", this.#id);

    if (this.#name) {
      vcard.set("N", this.#name);
    }
    if (this.#description) {
      vcard.set("NOTE", this.#description);
    }

    for (const member of this.#members) {
      vcard.add("X-ADDRESSBOOKSERVER-MEMBER", `urn:uuid:${member}`);
    }

    return {
      // addressData: vcard.toString(),
      url: new URL(`${this.#id}.vcf`, this.#addressBook.url).toString(), // Assuming the URL format for the contact
      data: vcard.stringify(),
      // etag: (this.lastUpdated?.getTime() ?? new Date().getTime()).toString()
    } as DAVVCard;
  }

  static fromDatabaseObject(
    group: Tables<"carddav_groups">,
    address_book: Tables<"carddav_addressbooks">,
    members: string[]
  ): Group {
    return new Group({
      id: group.id_is_uppercase ? group.id.toUpperCase() : group.id,
      name: group.name ?? undefined,
      description: group.description ?? undefined,
      members,
      createdAt: group.created_at ? new Date(group.created_at) : undefined,
      updatedAt: group.updated_at ? new Date(group.updated_at) : undefined,
      addressBook: AddressBook.fromDatabaseObject(address_book),
      readonly: group.readonly ?? false,
    });
  }

  toDatabaseObject(): Omit<Tables<"carddav_groups">, "created_at" | "user_id"> {
    return {
      id: this.#id,
      name: this.#name ?? null,
      description: this.#description ?? null,
      updated_at: this.#updatedAt.toISOString(),
      address_book: this.#addressBook.id,
      id_is_uppercase: this.#id.toUpperCase() === this.#id, // Ensure ID is stored in uppercase
      readonly: this.#readonly,
    };
  }
}
