"use server";

import * as dav from "dav";
import { getUser } from "./userUtil";
import { getAdminDB, uploadToCloudStorage } from "@/lib/firebaseAdmin";
import { Contact } from "@/models/contacts";
import { cardDavConverter } from "@/models/carddav";
import { contactConverter } from "@/models/contactConverter";

const db = getAdminDB();

function parseVCardPhoto(photoUrl: string): Buffer {
  // 2.1: PHOTO;JPEG:http://example.com/photo.jpg
  // 2.1: PHOTO;JPEG;ENCODING=BASE64:[base64-data]
  // 3.0: PHOTO;TYPE=JPEG;VALUE=URI:http://example.com/photo.jpg
  // 3.0: PHOTO;TYPE=JPEG;ENCODING=b:[base64-data]
  // 4.0: PHOTO;MEDIATYPE=image/jpeg:http://example.com/photo.jpg
  // 4.0: PHOTO;ENCODING=BASE64;TYPE=JPEG:[base64-data]

  if (!photoUrl) {
    return Buffer.from([]);
  }

  const parts = photoUrl.split(";");
  // Check if the photo is a URL
  // const mediaType = parts
  //   .find((part) => part.startsWith("TYPE=") || part.startsWith("MEDIATYPE="))
  //   ?.split(":")?.[0]
  //   .split("=")[1];
  // if (!mediaType) {
  //   console.error("Invalid photo URL format:", photoUrl);
  // }

  if (parts.some((part) => part.startsWith("ENCODING="))) {
    return Buffer.from(photoUrl.split(":")[1], "base64");
  }

  throw new Error(
    "Unsupported photo format or missing encoding in vCard: " + photoUrl
  );

  // Check if the photo is a base64 encoded string
}

async function saveContacts(
  userId: string,
  contacts: Contact[]
): Promise<void> {
  let batch = db.batch();
  let opCount = 0;

  for (const contact of contacts) {
    const contactId = contact.id;

    // If the contact has a photo, upload it to Cloud Storage
    if (contact.photo) {
      try {
        // Decode from vcard base64 format

        const photoBuffer = parseVCardPhoto(contact.photo);

        contact.photoUrl = await uploadToCloudStorage(
          photoBuffer,
          contact.id,
          userId
        );
      } catch (error) {
        console.error(
          `Failed to upload photo for contact ${contactId}:`,
          error
        );
      }
    }

    const docRef = db
      .doc(`users/${userId}/contacts/${contactId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withConverter(contactConverter as any);
    batch.set(docRef, contact);
    opCount++;
    if (opCount === 400) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
}

async function getCardDavSettings(userId: string, cardId: string) {
  const snapshot = await db
    .doc(`users/${userId}/carddav/${cardId}`)
    .withConverter(cardDavConverter)
    .get();

  const settings = snapshot.data();
  if (!settings) {
    console.error("CardDAV connection not found");
    throw new Error("CardDAV connection not found");
  }

  const xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: settings.username,
      password: settings.password,
    })
  );

  const serverUrl = new URL(
    settings.addressBookPath,
    `${settings.useSSL ? "https" : "http"}://${settings.server}`
  ).toString();

  const account = await dav.createAccount({
    accountType: "carddav",
    server: serverUrl,
    xhr,
    loadObjects: true,
    loadCollections: true,
  });

  return account;
}

export async function cardDavSyncPull(cardId: string) {
  // console.log("Server URL:", serverUrl);

  // Discover address books
  try {
    const user = await getUser();
    const account = await getCardDavSettings(user.uid, cardId);

    console.log(`Syncing CardDAV for user: ${user.uid}, cardId: ${cardId}`);
    console.log(`Number of address books: ${account.addressBooks.length}`);

    for await (const addressBook of account.addressBooks) {
      if (addressBook.displayName === "#addressbooks") {
        const contacts = Contact.fromAddressBook(addressBook, cardId);

        console.log(
          `Found ${contacts.length} contacts in address book: ${addressBook.displayName}`
        );
        // Print first 10 contacts for debugging

        await saveContacts(user.uid, contacts);
      }
    }
  } catch (error) {
    console.error("Error during CardDAV sync:", error);
    return {
      error,
    };
  }
}

export async function cardDavSyncPush(cardId: string) {
  try {
    const user = await getUser();
    const account = await getCardDavSettings(user.uid, cardId);

    const addressBook = account.addressBooks?.[0];
    if (!addressBook || !addressBook.objects) {
      console.error("No address book or contacts found.");
      return;
    }

    // Push contacts to CardDAV server
    // for (const contact of addressBook.objects) {
    //   // await contact.save();
    // }
  } catch (error) {
    console.error("Error during CardDAV sync:", error);
    return {
      error,
    };
  }
}
