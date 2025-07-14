import { Element, LinkedInProfileContactInfo } from "@/types/linkedin.types";
import { createClient } from "../supabase/server";
import { LinkedinContact } from "@/models/linkedinContact";

export async function uploadConnections(
  profiles: [Element, LinkedInProfileContactInfo][],
  connectionId: string
): Promise<void> {
  const supabase = await createClient();

  const upsertAction = await supabase
    .from("linkedin_contacts")
    .upsert(
      profiles
        .map(([element, profile]) =>
          LinkedinContact.fromLinkedinData(
            element,
            profile,
            connectionId,
          ).toDatabaseObject()
        )
    )

  if (upsertAction.error) {
    console.error("Error uploading contacts:", upsertAction.error);
    throw new Error("Failed to upload contacts");
  }

  console.log(
    `Uploaded ${profiles.length} contacts for connection ${connectionId}`
  );
}