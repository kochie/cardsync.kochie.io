"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const schema = z.object({
  username: z.string(),
  password: z.string(),
  server: z.string(),
  name: z.string(),
  syncFrequency: z.string(),
  useSSL: z.boolean(),
  description: z.string().optional(),
  addressBookPath: z.string().optional(),
  syncAllContacts: z.boolean().optional(),
  syncGroups: z.boolean().optional(),
  syncPhotos: z.boolean().optional(),
});


export async function createCardDavAction(prevState: object, formData: FormData) {
  const validatedFields = schema.safeParse({
    server: formData.get("server"),
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    syncFrequency: formData.get("syncFrequency"),
    useSSL: formData.get("useSSL") === "true",
    description: formData.get("description"),
    addressBookPath: formData.get("addressBookPath") ?? "",
    syncAllContacts: formData.get("syncAllContacts") === "true",
    syncGroups: formData.get("syncGroups") === "true",
    syncPhotos: formData.get("syncPhotos") === "true",
  });

  if (!validatedFields.success) {
    console.error("Validation failed", validatedFields.error.flatten());
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient()

    const {error} = await supabase.from("carddav_connections").insert([{
      server: validatedFields.data.server,
      name: validatedFields.data.name,
      username: validatedFields.data.username,
      password: validatedFields.data.password,
      sync_frequency: validatedFields.data.syncFrequency,
      use_ssl: validatedFields.data.useSSL,
      description: validatedFields.data.description,
      address_book_path: validatedFields.data.addressBookPath,
      sync_all_contacts: validatedFields.data.syncAllContacts,
      sync_groups: validatedFields.data.syncGroups,
      sync_photos: validatedFields.data.syncPhotos,
      contact_count: 0, // Initial count, will be updated later
      status: "connected", // Initial status
    }])

    if (error) {
      console.error("Error inserting CardDAV connection:", error);
      return {
        errors: error.message
      };
    }
  } catch (error) {
    console.error("Error verifying cookies:", error);

    return {
        errors: error
    }
  }

  redirect("/dashboard");
}
