"use server";

import { Contact } from "@/models/contacts";
import { LinkedinContact } from "@/models/linkedinContact";
import { createClient } from "@/utils/supabase/server";
import { getPlaiceholder } from "plaiceholder";

export async function linkedinDetectDuplicates() {
  const supabase = await createClient();
  console.log("Detecting duplicates in CardDAV connections...");

  const { data, error } = await supabase.rpc("match_linkedin_by_name");

  if (error) {
    console.error("Error detecting duplicates:", error);
    throw new Error("Failed to detect duplicates");
  }

  console.log(
    `Found ${data.valueOf()} matching contacts in CardDAV connections`
  );
}

export async function copyLinkedinDetails(
  contactId: string,
  addressBookId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    throw new Error("Failed to fetch user");
  }

  console.log(
    `Merging LinkedIn contacts for user ${user.id}, contactId: ${contactId}, addressBookId: ${addressBookId}`
  );

  const { data, error } = await supabase
    .from("carddav_contacts")
    .select(
      `
      *,
      linkedin_contacts (*),
      carddav_addressbooks (*)
    `
    )
    .eq("id", contactId)
    .eq("address_book", addressBookId)
    .single();

  if (error) {
    console.error("Error fetching contacts:", error);
    throw new Error("Failed to fetch contacts", error);
  }

  if (!data || !data.linkedin_contacts) {
    console.warn("No LinkedIn contacts found for this contact");
    return {
      success: "No LinkedIn contacts to merge",
    };
  }
  const linkedinProfile = LinkedinContact.fromDatabaseObject(
    data.linkedin_contacts
  );
  const contact = await Contact.fromDatabaseObject(data);

  for (const phone of linkedinProfile.phoneNumbers) {
    contact.addPhone([phone.type], phone.number);
  }

  for (const email of linkedinProfile.emailAddresses) {
    const emailType = email.type || "work"; // Default to 'work' if type is not specified
    contact.addEmail([emailType], email.emailAddress);
  }

  if (linkedinProfile.profilePicture) {
    console.log("Loading profile picture for contact:", contactId);
    await contact.loadPhoto(supabase);
    const response = await fetch(linkedinProfile.profilePicture);
    if (!response.ok) {
      console.error("Failed to fetch profile picture:", response.statusText);
      throw new Error("Failed to fetch profile picture");
    }
    const data = await response.arrayBuffer();
    if (!data) {
      console.error("No data received for profile picture");
      throw new Error("No data received for profile picture");
    }
    // convert to base64
    const photoData = Buffer.from(data);
    const { base64 } = await getPlaiceholder(photoData);

    contact.addPhoto({
      type: "image/jpeg",
      data: photoData.toString("base64"),
      blurDataUrl: base64,
    });
    await contact.savePhoto(supabase);

    console.log("Profile picture loaded and saved for contact:", contactId);
  }

  const { error: updateError } = await supabase
    .from("carddav_contacts")
    .update(contact.toDatabaseObject())
    .eq("id", contactId)
    .eq("address_book", addressBookId);

  if (updateError) {
    console.error("Error updating contact:", updateError);
    throw new Error("Failed to update contact");
  }

  // Here you would implement the logic to merge the contacts
  // For now, we just log them

  return {
    success: "Contacts merged successfully",
  };
}
