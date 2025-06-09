import { FirestoreDataConverter } from "firebase-admin/firestore";

interface CardDavModel {
  id: string;
  name: string;
  server: string;
  username: string;
  password: string;
  addressBookPath: string;
  useSSL: boolean;
  contactCount: number;
  lastSynced: Date;
  status: string;
  syncFrequency: string;  
}

export class CardDav implements CardDavModel {
    constructor(
        public id: string,
        public name: string,
        public server: string,
        public username: string,
        public password: string,
        public addressBookPath: string = "",
        public useSSL: boolean = true,
        public contactCount: number = 0,
        public lastSynced: Date,
        public status: string = "connected",
        public syncFrequency: string = ""

    ) {
        this.id = id;
        this.name = name;
        this.server = server;
        this.username = username;
        this.password = password;
        this.addressBookPath = addressBookPath || "";
        this.useSSL = useSSL;
        this.contactCount = contactCount ?? 0;
        this.lastSynced = lastSynced ? new Date(lastSynced) : new Date();
        this.status = status || "connected";
        this.syncFrequency = syncFrequency || "";
    }
}

export const cardDavConverter: FirestoreDataConverter<CardDav> = {
    toFirestore(cardDav: CardDav): FirebaseFirestore.DocumentData {
        return {
            id: cardDav.id,
            name: cardDav.name,
            server: cardDav.server,
            username: cardDav.username,
            password: cardDav.password,
            addressBookPath: cardDav.addressBookPath || "",
            useSSL: cardDav.useSSL,
            contactCount: cardDav.contactCount || 0,
            lastSynced: cardDav.lastSynced ? cardDav.lastSynced.toISOString() : undefined,
            status: cardDav.status || "connected",
            syncFrequency: cardDav.syncFrequency || ""
        };
    },
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): CardDav {
        const data = snapshot.data();
        return new CardDav(
            data.id,
            data.name,
            data.server,
            data.username,
            data.password,
            data.addressBookPath || "",
            data.useSSL || true,
            data.contactCount || 0,
            data.lastSynced ? new Date(data.lastSynced) : new Date(),
            data.status || "connected",
            data.syncFrequency || ""
        );
    }
};