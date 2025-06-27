"use server";

import { Contact } from "@/models/contacts";
import { LinkedinContact } from "@/models/linkedinContact";
import {
  Element,
  LinkedInGraphQLResponse,
  LinkedInProfile,
  Root,
} from "@/types/linkedin.types";
import { createClient } from "@/utils/supabase/server";
import camelcaseKeys from "camelcase-keys";


async function uploadConnections(
  elements: Element[],
  profileData: LinkedInProfile[],
  connectionId: string
): Promise<void> {
  const supabase = await createClient();

  const upsertAction = await supabase
    .from("linkedin_contacts")
    .upsert(
      elements
        .map((el, i) => [el, profileData[i]] as const)
        .map(([element, profile]) =>
          LinkedinContact.fromLinkedinData(
            element,
            profile,
            connectionId
          ).toDatabaseObject()
        )
    );

  if (upsertAction.error) {
    console.error("Error uploading contacts:", upsertAction.error);
    throw new Error("Failed to upload contacts");
  }

  const updateAction = await supabase
    .from("linkedin_connections")
    .update({
      number_contacts: upsertAction.count ?? undefined,
      last_synced: new Date().toISOString(),
    })
    .eq("id", connectionId.replace("linkedin:", ""));

  if (updateAction.error) {
    console.error("Error updating connection:", updateAction.error);
    throw new Error("Failed to update connection");
  }
}

export async function linkedinSyncAction(connectionId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("linkedin_connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (error) {
      return {
        error: "No connection found",
      };
    }

    const connection = camelcaseKeys(data, { deep: true });

    const options = {
      method: "GET",
      headers: {
        cookie: connection.cookies,
        "csrf-token": connection.sessionId.replaceAll('"', ""),
      },
    };

    const count = 25;
    let isLastPage = false;
    let start = 0;

    const url = new URL(
      "https://www.linkedin.com/voyager/api/relationships/dash/connections"
    );
    url.searchParams.append("count", count.toString());
    url.searchParams.append("q", "search");
    url.searchParams.append(
      "decorationId",
      "com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16"
    );

    do {
      try {
        url.searchParams.set("start", start.toString());
        const response = await fetch(url, options);
        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          break;
        }

        const data = (await response.json()) as Root;
        const profileData: LinkedInProfile[] = [];

        for (const el of data.elements) {
          if (el.connectedMemberResolutionResult?.publicIdentifier) {
            profileData.push(
              await getProfileData(
                el.connectedMemberResolutionResult.publicIdentifier,
                options
              )
            );
          } else {
            profileData.push({
              publicIdentifier: "",
            } as LinkedInProfile);
          }
        }

        if (data.elements.length < count) {
          isLastPage = true;
        }

        start += count;

        await uploadConnections(data.elements, profileData, connectionId);
      } catch (error) {
        console.error(error);
      }
    } while (!isLastPage);

    await linkedinDetectDuplicates();
  } catch (error) {
    return {
      error: error,
    };
  }

  return {
    success: "Sync completed successfully",
  };
}

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

const getProfileData = async (
  publicIdentifier: string,
  options: RequestInit,
  maxRetries = 5,
  baseDelay = 1000
): Promise<LinkedInProfile> => {
  const queryId =
    "voyagerIdentityDashProfiles.c7452e58fa37646d09dae4920fc5b4b9";
  const variables = `(memberIdentity:${publicIdentifier})`;

  const queryURL = `https://www.linkedin.com/voyager/api/graphql?queryId=${queryId}&variables=${variables}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(queryURL, options);

      if (response.status === 429) {
        const delay = baseDelay * 2 ** attempt + Math.random() * 100;
        console.warn(`429 received. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        console.error("Error fetching profile data:", response.statusText);
        break;
      }

      const data = (await response.json()) as LinkedInGraphQLResponse;
      return data.data.identityDashProfilesByMemberIdentity.elements[0];
    } catch (error) {
      console.error("Error fetching profile data:", error);
      break;
    }
  }

  return {
    publicIdentifier: publicIdentifier,
  } as LinkedInProfile;
};

export async function mergeLinkedinContactsAction(
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
    throw new Error("Failed to fetch contacts");
  }

  const contact = await Contact.fromDatabaseObject(data);

  for (const phone of data.linkedin_contacts?.phone_numbers ?? []) {
    const [type, phoneNumber] = phone.split(":", 2);
    contact.addPhone([type.toLowerCase()], phoneNumber);    
  }

  for (const email of data.linkedin_contacts?.emails ?? []) {
    const [type, emailAddress] = email.split(":", 2);
    contact.addEmail([type.toLowerCase()], emailAddress);
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


