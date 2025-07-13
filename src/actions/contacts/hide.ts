"use server";

import { createClient } from "@/utils/supabase/server";

export async function hideContacts(contactIds: string[]) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  if (contactIds.length === 0) {
    return { error: "No contacts selected" };
  }

  const { error } = await supabase
    .from("carddav_contacts")
    .update({ hidden: true })
    .in("id", contactIds)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error hiding contacts:", error);
    return { error: "Failed to hide contacts" };
  }

  return { success: true, count: contactIds.length };
} 