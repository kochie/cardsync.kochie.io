"use server";

import { createClient } from "@/utils/supabase/server";

export async function cardDavSyncPull(cardId: string) {
  // Discover address books
  const supabase = await createClient();

  const { error } = await supabase.functions.invoke("carddav-account-sync", {
    body: JSON.stringify({
      cardId,
    }),
  });

  if (error) {
    console.error("Error invoking CardDAV sync pull:", error);
    return {
      error: "Failed to pull CardDAV contacts",
      details: error.message,
    };
  }
}

export async function cardDavSyncPush(
  cardId: string,
  contactIds: string[] = []
) {
  const supabase = await createClient();

  await supabase.functions.invoke("carddav-account-sync", {
    body: JSON.stringify({
      cardId,
      contactIds,
    }),
  });
}
