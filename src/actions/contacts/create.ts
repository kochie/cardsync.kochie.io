"use server";

import { createClient } from "@/utils/supabase/server";
import { Contact } from "@/models/contacts";
import { revalidatePath } from "next/cache";

export async function createContact(userId: string, addressBookId: string) {
  const supabase = await createClient();

  try {
    // Create a new empty contact
    const { data, error } = await supabase
      .from("carddav_contacts")
      .insert({
        user_id: userId,
        address_book: addressBookId,
        name: "New Contact",
        emails: [],
        phones: [],
        addresses: [],
        notes: [],
        company: "",
        title: "",
        birth_date: null,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contact:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "No data returned from contact creation" };
    }

    // Revalidate the contacts page
    revalidatePath("/dashboard/contacts");
    
    return { success: true, contactId: data.id };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { success: false, error: "Failed to create contact" };
  }
} 