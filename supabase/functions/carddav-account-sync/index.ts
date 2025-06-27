// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "@/types/database.types.ts";

import { getCardDavSettings, saveContacts, saveGroups, updateConnection } from "../_lib/carddav.ts";
import { AddressBook } from "@/models/addressBook.ts";
import { Group } from "@/models/groups.ts";
import { Contact } from "@/models/contacts.ts";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const { cardId } = await req.json();

  const supabase = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  await supabase
    .from("carddav_connections")
    .update({
      status: "syncing",
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

      // await saveContacts(contacts);
      await updateConnection(cardId, contacts.length, supabase);
    }
  } catch (error) {
    await supabase
      .from("carddav_connections")
      .update({
        status: "sync error",
      })
      .eq("id", cardId);
    console.error("Error during CardDAV sync:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to sync CardDAV contacts",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({
    message: "CardDAV sync completed successfully",
    cardId,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/carddav-account-sync' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
