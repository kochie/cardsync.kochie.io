import {
  DocumentData,
  FirestoreDataConverter,
  SnapshotOptions,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { Contact } from "./contacts";

// This FirestoreDataConverter supports both Admin SDK and Client SDK usage.
export const contactConverter: FirestoreDataConverter<Contact> = {
  toFirestore(contact: Contact): DocumentData {
    const data: Record<string, string | string[] | Date | undefined> = {
      id: contact.id,
      name: contact.name,
      address: contact.address,
      emails: contact.emails,
      phone: contact.phone,
      photoUrl: contact.photoUrl,
      lastUpdated: new Date(),
      sources: contact.sources,
      role: contact.role,
      title: contact.title,
      company: contact.company,
    };
    // Remove undefined fields
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });
    return data;
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): Contact {
    const data = snapshot.data(options);
    return new Contact({
      id: data.id,
      name: data.name,
      address: data.address ?? [],
      emails: data.emails ?? [],
      phone: data.phone ?? [],
      photoUrl: data.photoUrl,
      lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : undefined,
      sources: data.sources || [],
      role: data.role,
      title: data.title,
      company: data.company,
    });
  },
};
