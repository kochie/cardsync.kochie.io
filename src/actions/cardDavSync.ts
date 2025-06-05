"use server";

import * as dav from "dav";
import { getUser } from "./userUtil";
import vCard from "vcf";
import { getAdminDB } from "@/lib/firebaseAdmin";

const db = getAdminDB();

interface Email {
  type: string[];
  value: string;
}

interface Phone {
  type: string[];
  value: string;
}

interface Contact {
  id: string;
  name: string;
  emails?: Email[];
  phone?: Phone[];
  address: string;
}

async function saveContacts(
  userId: string,
  contacts: Contact[],
  connectionId: string
): Promise<void> {
  const batch = db.batch();

  for (const contact of contacts) {
    const contactId = contact.id;
    const docRef = db.doc(
      `users/${userId}/carddav/${connectionId}/contacts/${contactId}`
    );

    batch.set(docRef, contact);
  }

  await batch.commit();
}

function toContact(contact: dav.VCard): Contact {
  const parsed = new vCard().parse(contact.addressData);

  const contactId = parsed.get("uid") ?? parsed.get("rev");
  if (!contactId) {
    throw new Error("Contact ID not found");
  }

  const contactObject: Contact = {
    id: contactId.toString(),
    name: parsed.get("fn").valueOf().toString(),
    address: parsed.get("adr")?.toString() ?? "",
  };

  const emails: Email[] = [];
  if (parsed.get("email")) {
    const email = parsed.get("email");

    if (Array.isArray(email)) {
      email.forEach((email) => {
        const a = email.toJSON();
        emails.push({
          type: [a[1]["type"]].flat(),
          value: [a[3]].flat()[0],
        });
      });
    } else {
      const a = email.toJSON();
      emails.push({
        type: [a[1]["type"]].flat(),
        value: [a[3]].flat()[0],
      });
    }
    contactObject.emails = emails;
  }

  const phones: Phone[] = [];
  if (parsed.get("tel")) {
    const phone = parsed.get("tel");
    if (Array.isArray(phone)) {
      phone.forEach((phone) => {
        const a = phone.toJSON();
        phones.push({
          type: [a[1]["type"]].flat(),
          value: [a[3]].flat()[0],
        });
      });
    } else {
      const a = phone.toJSON();
      phones.push({
        type: [a[1]["type"]].flat(),
        value: [a[3]].flat()[0],
      });
    }
    contactObject.phone = phones;
  }
  return contactObject;
}

export async function cardDavSyncAction(prevState: object, cardId: string) {
  console.log("CardDavSyncAction called with state:", prevState);
  console.log("Card ID:", cardId);
  const user = await getUser();

  const snapshot = await db.doc(`users/${user.uid}/carddav/${cardId}`).get();

  const data = snapshot.data();
  console.log("Snapshot data:", data);

  const cardDavSettings = {
    serverUrl: data?.server,
    username: data?.username,
    password: data?.password,
    addressBookPath: data?.addressBookPath,
    useSSL: data?.useSSL,
  };

  const xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: cardDavSettings.username,
      password: cardDavSettings.password,
    })
  );

  const serverUrl = new URL(
    cardDavSettings.addressBookPath,
    `${cardDavSettings.useSSL ? "https" : "http"}://${
      cardDavSettings.serverUrl
    }`
  ).toString();

  console.log("Server URL:", serverUrl);

  // Discover address books
  try {
    const account = await dav.createAccount({
      accountType: "carddav",
      server: serverUrl,
      xhr,
      loadObjects: true,
      loadCollections: true,
    });

    const addressBook = account.addressBooks?.[0];
    if (!addressBook || !addressBook.objects) {
      console.error("No address book or contacts found.");
      return;
    }

    await saveContacts(user.uid, addressBook.objects.map(toContact), cardId);
  } catch (error) {
    console.error("Error during CardDAV sync:", error);
    return {
      error,
    };
  }
}
