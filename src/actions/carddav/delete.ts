"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteCardDavAction(cardId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("carddav_connections")
      .delete()
      .eq("id", cardId);

    if (error) {
      console.error("Error deleting CardDav account:", error);
      return { error: "Failed to delete CardDav account." };
    }
  } catch (error) {
    console.error("Error deleting CardDav account:", error);
  }
}
