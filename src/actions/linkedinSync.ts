"use server";

import { getUser } from "./userUtil";
import { ConnectionSession } from "./types";
import { getAdminDB } from "@/lib/firebaseAdmin";

const db = getAdminDB();

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
  userId: string,
  elements: Element[],
  connectionId: string
): Promise<void> {
  const batch = db.batch();

  for (const element of elements) {
    const entityUrn = element.entityUrn.replaceAll("/", "_"); // Sanitize for Firestore doc ID
    const docRef = db.doc(
      `users/${userId}/connections/${connectionId}/contacts/${entityUrn}`
    );

    batch.set(docRef, { id: entityUrn, ...element });
  }

  await batch.commit();
}

export async function linkedinSyncAction(connectionId: string) {
  try {
    const user = await getUser();

    const snapshot = await db
      .doc(`users/${user.uid}/connections/${connectionId}`)
      .get();

    const connection = {
      id: snapshot.id,
      ...snapshot.data(),
    } as ConnectionSession;

    if (!connection) {
      return {
        error: "No connection found",
      };
    }
    const options = {
      method: "GET",
      headers: {
        cookie: connection.cookies,
        "csrf-token": connection.sessionId.replaceAll('"', ""),
      },
    };

    const count = 100;
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

        if (data.elements.length < count) {
          isLastPage = true;
        }

        start += count;

        console.log("Fetched data:", data.elements.length);
        await uploadConnections(user.uid, data.elements, connectionId);
      } catch (error) {
        console.error(error);
      }
    } while (!isLastPage);


    let matches = 0

    // Now use the data to find contacts in card dav that have the same name
    const cardDavSnapshot = await db
      .collection(`users/${user.uid}/carddav`)
      .get();
    for (const cardDavDoc of cardDavSnapshot.docs) {
      const cardDavId = cardDavDoc.id;

      const contactsSnapshot = await db
        .collection(`users/${user.uid}/connections/${connectionId}/contacts`)
        .get();

      for (const contactDoc of contactsSnapshot.docs) {
        const contact = contactDoc.data();
        const name = `${contact.connectedMemberResolutionResult?.firstName} ${contact.connectedMemberResolutionResult?.lastName}`;

        const cardDavContactsSnapshot = await db
          .collection(`users/${user.uid}/carddav/${cardDavId}/contacts`)
          .where("name", "==", name)
          .get();

        if (!cardDavContactsSnapshot.empty) {
          matches += cardDavContactsSnapshot.size
          for (const cardDavContactDoc of cardDavContactsSnapshot.docs) {
            const cardDavContact = cardDavContactDoc.data();
            console.log(
              `Found matching contact for ${name} in CardDAV connection ${cardDavId}:`,
              cardDavContact
            );
          }
        }
      }
    }

    console.log(`Found ${matches} matching contacts in CardDAV connections`);
  } catch (error) {
    return {
      error: error,
    };
  }

  return {
    success: "Sync completed successfully",
  };
}
