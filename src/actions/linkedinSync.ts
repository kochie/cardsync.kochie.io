"use server";

import { Contact, parseVCardPhoto } from "@/models/contacts";
import { LinkedinContact } from "@/models/linkedinContact";
import {
  LinkedInGraphQLResponse,
  LinkedInProfile,
} from "@/types/linkedin.types";
import { createClient } from "@/utils/supabase/server";
import { VCardProperty } from "@/utils/vcard/vcard";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

export interface LinkedinSyncActionState {
  error?: string;
  success?: string;
}

export interface Root {
  elements: Element[];
  paging: Paging;
}

export interface Element {
  createdAt: number;
  $recipeType: string;
  connectedMember: string;
  entityUrn: string;
  connectedMemberResolutionResult?: ConnectedMemberResolutionResult;
}

export interface ConnectedMemberResolutionResult {
  memorialized: boolean;
  lastName: string;
  profilePicture: ProfilePicture;
  firstName: string;
  entityUrn: string;
  $recipeType: string;
  headline: string;
  publicIdentifier: string;
}

export interface ProfilePicture {
  $recipeType: string;
  a11yText: string;
  displayImageUrn: string;
  displayImageReference: DisplayImageReference;
}

export interface DisplayImageReference {
  vectorImage: VectorImage;
}

export interface VectorImage {
  $recipeType: string;
  rootUrl: string;
  artifacts: Artifact[];
}

export interface Artifact {
  width: number;
  $recipeType: string;
  fileIdentifyingUrlPathSegment: string;
  expiresAt: number;
  height: number;
}

export interface Paging {
  count: number;
  start: number;
  links: string[]; // Define specific type if structure is known
}

async function uploadConnections(
  elements: Element[],
  profileData: LinkedInProfile[],
  connectionId: string
): Promise<void> {
  const contacts: LinkedinContact[] = [];

  for (const [element, profile] of elements.map(
    (el, i) => [el, profileData[i]] as const
  )) {
    const contact: LinkedinContact = {
      connectionId: connectionId,
      publicIdentifier:
        element.connectedMemberResolutionResult?.publicIdentifier || "",
      entityUrn: element.entityUrn,
      firstName: element.connectedMemberResolutionResult?.firstName || "",
      lastName: element.connectedMemberResolutionResult?.lastName || "",
      headline: element.connectedMemberResolutionResult?.headline || "",
      fullName:
        `${element.connectedMemberResolutionResult?.firstName} ${element.connectedMemberResolutionResult?.lastName}`.toLowerCase(),
      birthDate: profile.birthDateOn
        ? `${profile.birthDateOn.month}-${profile.birthDateOn.day}`
        : undefined,
      phoneNumbers:
        profile.phoneNumbers?.map((phone) => ({
          type: phone.type || "UNKNOWN",
          number: phone.phoneNumber.number,
        })) ?? [],
      emailAddresses: profile.emailAddress
        ? [
            {
              emailAddress: profile.emailAddress.emailAddress,
              type: profile.emailAddress.type || "UNKNOWN",
            },
          ]
        : [],
      addresses: profile.address ? [profile.address] : [],
      websites:
        profile.websites?.map((website) => ({
          url: website.url,
          type: website.category || "UNKNOWN",
        })) || [],
    };

    const artifacts =
      element.connectedMemberResolutionResult?.profilePicture?.displayImageReference?.vectorImage?.artifacts?.sort(
        (a, b) => a.width - b.width
      );
    const rootUrl =
      element.connectedMemberResolutionResult?.profilePicture
        ?.displayImageReference?.vectorImage?.rootUrl;
    if (artifacts && artifacts.length > 0 && rootUrl) {
      const largestArtifact = artifacts[artifacts.length - 1];
      const url = rootUrl + largestArtifact?.fileIdentifyingUrlPathSegment;
      contact.profilePicture = url;
    } else {
      console.warn(
        `No profile picture found for contact: ${contact.firstName} ${contact.lastName}`
      );
      console.warn(
        `Artifacts: ${JSON.stringify(
          element.connectedMemberResolutionResult?.profilePicture
        )}`
      );
    }

    contacts.push(contact);
  }

  const supabase = await createClient();

  const upsertAction = await supabase.from("linkedin_contacts").upsert(
    contacts.map((contact) => {
      return snakecaseKeys({
        headline: contact.headline,
        entityUrn: contact.entityUrn,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: contact.fullName,
        profilePicture: contact.profilePicture,
        publicIdentifier: contact.publicIdentifier,
        connectionId: contact.connectionId.replace("linkedin:", ""),
        lastSynced: new Date().toISOString(),
        birthDate: contact.birthDate
          ? new Date(`1900-${contact.birthDate}`).toISOString()
          : null,
        phoneNumbers:
          contact.phoneNumbers?.map(
            (phone) => `${phone.type}:${phone.number}`
          ) ?? [],
        emails:
          contact.emailAddresses?.map(
            (email) => `${email.type}:${email.emailAddress}`
          ) ?? [],
        addresses: [contact.addresses?.join(";") ?? ""],
        websites:
          contact.websites?.map(
            (website) => `${website.type}:${website.url}`
          ) ?? [],
      });
    })
  );

  if (upsertAction.error) {
    console.error("Error uploading contacts:", upsertAction.error);
    throw new Error("Failed to upload contacts");
  }

  const updateAction = await supabase
    .from("linkedin_connections")
    .update({
      number_contacts: contacts.length,
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

        console.log("Fetched data:", data.elements.length);
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
  addressBookId: string,
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

  console.log(`Merging LinkedIn contacts for user ${user.id}, contactId: ${contactId}, addressBookId: ${addressBookId}`);

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

  const contact = new Contact({
    name: data.name ?? "",
    addresses: data.addresses.map((adr) => VCardProperty.parse(adr)),
    emails: data.emails.map((email) => VCardProperty.parse(email)),
    phones: data.phones.map((phone) => VCardProperty.parse(phone)),
    photos: await parseVCardPhoto(data.id),
    company: data.company ?? undefined,
    title: data.title ?? undefined,
    role: data.role ?? undefined,
    id: data.id_is_uppercase ? data.id.toUpperCase() : data.id,
    linkedinContact: data.linkedin_contacts?.public_identifier ?? undefined,
    photoBlurUrl: data.photo_blur_url ?? undefined,
    lastUpdated: new Date(data.last_updated),
    addressBook: data.carddav_addressbooks.id,
  });

  for (const phone of data.linkedin_contacts?.phone_numbers ?? []) {
    const [type, phoneNumber] = phone.split(":", 2);
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhoneNumber) {
      console.warn(`Invalid phone number: ${phoneNumber}`);
      continue;
    }

    if (!contact.phones.some((p) => p.value === normalizedPhoneNumber))
      contact.phones.push(
        new VCardProperty(
          "TEL",
          { TYPE: [type.toLowerCase()] },
          normalizedPhoneNumber
        )
      );
    console.log(
      `Added phone number: ${normalizedPhoneNumber} with type ${type} to contact ${contact.name}`
    );
  }

  for (const email of data.linkedin_contacts?.emails ?? []) {
    const [type, emailAddress] = email.split(":", 2);
    if (!emailAddress) {
      console.warn(`Invalid email address: ${email}`);
      continue;
    }

    if (
      !contact.emails.some((e) => e.value === emailAddress) &&
      emailAddress !== "null"
    ) {
      contact.emails.push(
        new VCardProperty("EMAIL", { TYPE: [type.toLowerCase()] }, emailAddress)
      );
      console.log(
        `Added email address: ${emailAddress} with type ${type} to contact ${contact.name}`
      );
    }
  }

  const { error: updateError } = await supabase
    .from("carddav_contacts")
    .update({
      emails: contact.emails.map((email) => email.stringify()),
      phones: contact.phones.map((phone) => phone.stringify()),
    })
    .eq("id", contactId)
    .eq("address_book", addressBookId);

  if (updateError) {
    console.error("Error updating contact:", updateError);
    throw new Error("Failed to update contact");
  }

  // Here you would implement the logic to merge the contacts
  // For now, we just log them
  console.log("Merging contacts:", contact);

  return {
    success: "Contacts merged successfully",
  };
}

function normalizePhoneNumber(phoneNumber: string): string {
  // Implement your phone number normalization logic here

  // If the number starts with +61 04, remove the 0
  if (phoneNumber.startsWith("+61 04")) {
    phoneNumber = phoneNumber.replace("+61 04", "+614");
  }

  // remove any non-digit characters except for +
  phoneNumber = phoneNumber.replace(/[^0-9+]/g, "");

  return phoneNumber;
}
