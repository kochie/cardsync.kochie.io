import { SupabaseClient } from "@supabase/supabase-js";
import camelcaseKeys from "camelcase-keys";
import { createDAVClient } from "tsdav";

import { Contact } from "@/models/contacts.ts";
import { Group } from "@/models/groups.ts";
import { Database } from "@/types/database.types.ts";
import { CardDavStatus } from "@/models/carddav";


export async function updateConnection(cardId: string, contactCount: number, supabase: SupabaseClient<Database>) {
  const { error } = await supabase
    .from("carddav_connections")
    .update({
      contact_count: contactCount,
      last_synced: new Date().toISOString(),
      status: CardDavStatus.Connected
    })
    .eq("id", cardId);

  if (error) {
    console.error("Error updating CardDAV connection:", error);
    throw new Error("Failed to update CardDAV connection");
  }
  console.log(
    `Updated CardDAV connection ${cardId} with ${contactCount} contacts`
  );
}

export async function saveGroups(
  groups: Group[],
  supabase: SupabaseClient<Database>
): Promise<void> {
  const { error: upsertGroupError } = await supabase
    .from("carddav_groups")
    .upsert(
      groups
        .filter((group) => !group.readonly)
        .map((group) => group.toDatabaseObject()),
      { onConflict: "id" }
    );

  if (upsertGroupError) {
    console.error("Error saving groups to database:", upsertGroupError);
    throw new Error("Failed to save groups");
  }

  const { error: upsertMembersError } = await supabase
    .from("carddav_group_members")
    .upsert(
      groups.flatMap((group) =>
        group.memberIds.map((member) => ({
          member_id: member,
          group_id: group.id,
          address_book: group.addressBookId,
        }))
      ),
      { onConflict: "member_id,group_id,address_book" }
    );

  if (upsertMembersError) {
    console.error(
      "Error saving group members to database:",
      upsertMembersError
    );
    throw new Error("Failed to save group members");
  }
}

export async function saveContacts(
  contacts: Contact[],
  supabase: SupabaseClient
): Promise<void> {
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

    const result = await contact.savePhoto(supabase);
    process.stdout.write(result ? "." : "x");
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

export async function getCardDavSettings(
  cardId: string,
  supabase: SupabaseClient
) {
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
