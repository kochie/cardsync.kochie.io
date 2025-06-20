"use server";

import { Contact } from "@/models/contacts";
import { createClient } from "@/utils/supabase/server";
import { createHash } from "crypto";
import camelcaseKeys from "camelcase-keys";
import { Buffer } from "buffer";
import { createDAVClient } from "tsdav";

async function generateHash(buffer: Buffer): Promise<string> {
  return createHash("sha256").update(buffer).digest("base64");
}

async function uploadImageToSupabase(
  contactId: string,
  userId: string,
  photoBuffer: Buffer
): Promise<void> {
  const supabase = await createClient();

  const path = `users/${userId}/contacts/${contactId}`.toLowerCase();

  const doesExist = await supabase.storage.from("assets").exists(path);

  let alreadyUploaded = false;
  if (doesExist.data.valueOf() && !doesExist.error) {
    // Need to check the db metadata to find the hash of the photo
    const info = await supabase.storage.from("assets").info(path);
    if (info.error) {
      console.error(`Failed to get info for contact ${contactId}:`, info.error);
      return;
    }
    alreadyUploaded =
      info.data.metadata?.["hash"] === (await generateHash(photoBuffer));
  }

  if (!alreadyUploaded) {
    const { error } = await supabase.storage
      .from("assets")
      .upload(path, photoBuffer, {
        contentType: "image/jpeg",
        upsert: true,
        metadata: {
          hash: await generateHash(photoBuffer),
        },
      });
    if (error) {
      console.error(`Failed to upload photo for contact ${contactId}:`, error);
      throw new Error("Failed to upload photo");
    }
  }
}

async function saveContacts(contacts: Contact[]): Promise<void> {
  const supabase = await createClient();

  const userResponse = await supabase.auth.getUser();

  if (userResponse.error) {
    console.error("Error fetching user:", userResponse.error);
    throw new Error("Failed to fetch user");
  }

  if (!userResponse.data.user) {
    console.error("No user found");
    throw new Error("User not authenticated");
  }

  for (const contact of contacts) {
    // If the contact has a photo, upload it to Cloud Storage

    for await (const photo of contact.photos) {
      try {
        if (!photo || !photo.data) continue;
        const photoBuffer = Buffer.from(photo.data, "base64");
        if (photoBuffer.length === 0) {
          console.warn(`No valid photo data for contact ${contact.id}`);
          continue;
        }
        await uploadImageToSupabase(
          contact.id,
          userResponse.data.user.id,
          photoBuffer
        );
      } catch (e) {
        console.error(`Failed to upload photo for contact ${contact.id}:`, e);
      }
    }
    process.stdout.write(".");
  }

  console.log("\nUploading photos completed");

  const { error } = await supabase
    .from("carddav_contacts")
    .upsert(contacts.map((contact) => contact.toDatabaseObject()));
  if (error) {
    console.error("Error saving contacts to database:", error);
    throw new Error("Failed to save contacts");
  }
  console.log(`Saved ${contacts.length} contacts to the database`);
}

async function getCardDavSettings(cardId: string) {
  const supabase = await createClient();

  console.log(`Fetching CardDAV settings for cardId: ${cardId}`);
  const { data, error } = await supabase
    .from("carddav_connections")
    .select("*")
    .eq("id", cardId)
    .single();

  if (error) {
    console.error("Error fetching CardDAV settings:", error);
    throw new Error("CardDAV connection not found");
  }

  const settings = camelcaseKeys(data, { deep: true });

  console.log("CardDAV settings:", settings);

  const baseUrl = new URL(
    `${settings.useSsl ? "https" : "http"}://${settings.server}`
  );
  // const serverUrl = new URL(settings.addressBookPath, baseUrl).toString();

  const client = await createDAVClient({
    credentials: {
      username: settings.username,
      password: settings.password,
    },
    authMethod: "Basic",
    serverUrl: baseUrl.toString(),
    defaultAccountType: "carddav",
  });

  return { client };
}

async function updateConnection(cardId: string, contactCount: number) {
  const supabase = await createClient();

  const { error, data } = await supabase
    .from("carddav_connections")
    .update({
      contact_count: contactCount,
      last_synced: new Date().toISOString(),
    })
    .eq("id", cardId)
    .select();

  if (error) {
    console.error("Error updating CardDAV connection:", error);
    throw new Error("Failed to update CardDAV connection");
  }
  console.log(
    `Updated CardDAV connection ${cardId} with ${contactCount} contacts`
  );
  console.log("Updated connection data:", data);
}

export async function cardDavSyncPull(cardId: string) {
  // Discover address books
  const supabase = await createClient();

  try {
    const { client } = await getCardDavSettings(cardId);

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

    for await (const addressBook of addressBooks) {
      const cards = await client.fetchVCards({ addressBook });

      const addressBookInfo = addressBookData.find(
        (book) => book.url === addressBook.url && book.connection_id === cardId
      );
      if (!addressBookInfo) {
        console.warn(
          `Address book not found in database: ${addressBook.displayName}`
        );
        continue;
      }
      console.log(
        `Found ${cards.length} cards in address book: ${addressBook.displayName}`
      );

      const contacts = await Contact.fromDavObjects(cards, addressBookInfo.id);

      console.log(
        `Found ${contacts.length} contacts in address book: ${addressBook.displayName}`
      );

      // print contacts with duplicate ids
      const duplicateIds = contacts
        .map((c) => c.id.toLowerCase())
        .filter((id, index, self) => self.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn(
          `Found duplicate contact IDs in address book ${
            addressBook.displayName
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
          )} in address book: ${addressBook.displayName}`
        );
        await saveContacts(contactGroup);
      }

      // await saveContacts(contacts);
      await updateConnection(cardId, contacts.length);
    }
  } catch (error) {
    console.error("Error during CardDAV sync:", error);
    return {
      error,
    };
  }
}

export async function cardDavSyncPush(
  cardId: string,
  contactIds: string[] = []
) {
  const supabase = await createClient();

  try {
    const { client } = await getCardDavSettings(cardId);

    let query = supabase
      .from("carddav_contacts")
      .select(
        `
          *,
          linkedin_contacts( public_identifier ),
          carddav_addressbooks (
            id,
            connection_id,
            carddav_connections (
              id
            )
          )
        `
      )
      .eq("carddav_addressbooks.connection_id", cardId);

    if (contactIds.length > 0) {
      query = query.in("id", contactIds);
    }

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      console.error(
        "Error fetching address books from database:",
        contactsError
      );
      throw new Error("Failed to fetch address books");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching user:", userError);
      throw new Error("Failed to fetch user");
    }

    for await (const contact of contacts) {
      console.log(
        `Updating contact: ${contact.name} (${contact.id}) - ${contact.linkedin_contacts?.public_identifier}`
      );
      const vcard = await Contact.fromDatabaseObject(contact).then((contact) =>
        contact.toVCard()
      );

      const response = await client.updateVCard({
        vCard: vcard,
      });

      if (!response.ok) {
        console.error(
          `Failed to update contact ${contact.name} (${contact.id}):`,
          response.statusText
        );
        continue;
      }
    }
  } catch (error) {
    console.error("Error during CardDAV sync:", error);
    return {
      error,
    };
  }
}
