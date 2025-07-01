import { Database } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  getCardDavSettings,
  saveContacts,
  saveGroups,
  updateConnection,
} from "@/utils/account/connection";
import { AddressBook } from "@/models/addressBook";
import { Contact } from "@/models/contacts";
import { Group } from "@/models/groups";
import { CardDavStatus } from "@/models/carddav";

export async function syncAccount(
  cardId: string,
  supabase: SupabaseClient<Database>
) {
  // Update the connection status to syncing
  await supabase
    .from("carddav_connections")
    .update({
      status: CardDavStatus.Syncing,
    })
    .eq("id", cardId);

  try {
    const { client } = await getCardDavSettings(cardId, supabase);

    console.log(`Syncing CardDAV for cardId: ${cardId}`);

    const addressBooks = await client.fetchAddressBooks();

    console.log(`Number of address books: ${addressBooks.length}`);

    const { data: addressBookData, error } = await supabase
      .from("carddav_addressbooks")
      .upsert(
        addressBooks.map((book) => ({
          display_name: `${book.displayName}`,
          url: book.url,
          connection_id: cardId,
        })),
        { onConflict: "url,connection_id" }
      )
      .select();

    if (error) {
      console.error("Error saving address books to database:", error);
      throw new Error("Failed to save address books");
    }

    let contactLength = 0;
    for await (const davAddressBook of addressBooks) {
      const cards = await client.fetchVCards({ addressBook: davAddressBook });

      const addressBookInfo = addressBookData.find(
        (book) =>
          book.url === davAddressBook.url && book.connection_id === cardId
      );
      if (!addressBookInfo) {
        console.warn(
          `Address book not found in database: ${davAddressBook.displayName}`
        );
        continue;
      }
      console.log(
        `Found ${cards.length} cards in address book: ${davAddressBook.displayName}`
      );

      const addressBook = AddressBook.fromDatabaseObject(addressBookInfo);
      const contacts = await Contact.fromDavObjects(cards, addressBook);
      const groups = Group.fromDavObjects(cards, addressBook);

      console.log(
        `Found ${contacts.length} contacts in address book: ${addressBook.name}`
      );
      contactLength += contacts.length;

      // print contacts with duplicate ids
      const duplicateIds = contacts
        .map((c) => c.id.toLowerCase())
        .filter((id, index, self) => self.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn(
          `Found duplicate contact IDs in address book ${
            addressBook.name
          }: ${duplicateIds.join(", ")}`
        );
      }

      // Print first 10 contacts for debugging
      // Save in groups of 50
      for (let i = 0; i < contacts.length; i += 50) {
        const contactGroup = contacts.slice(i, i + 50);
        console.log(
          `Saving contacts ${i + 1} to ${Math.min(
            i + 50,
            contacts.length
          )} in address book: ${addressBook.name}`
        );
        await saveContacts(contactGroup, supabase);
      }
      await saveGroups(groups, supabase);
    }
    await updateConnection(cardId, contactLength, supabase);
  } catch (error) {
    await supabase
      .from("carddav_connections")
      .update({
        status: CardDavStatus.Error
      })
      .eq("id", cardId);
    console.error("Error during CardDAV sync:", error);
  }
}
