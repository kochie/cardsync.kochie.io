import { Tables } from "@/types/database.types";


export enum CardDavStatus {
    Connected = "connected",
    Disconnected = "disconnected",
    Syncing = "syncing",
    Error = "error",
}

export interface CardDavModel {
  id: string;
  name: string;
  server: string;
  username: string;
  password: string;
  addressBookPath: string;
  useSsl: boolean;
  contactCount: number;
  lastSynced?: Date;
  status: CardDavStatus;
  syncFrequency: string;  
}

export class CardDav {
    readonly id: string;
    name: string;
    server: string;
    username: string;
    password: string;
    addressBookPath: string;
    useSsl: boolean;
    contactCount: number;
    lastSynced?: Date;
    status: CardDavStatus;
    syncFrequency: string;

    constructor(data: CardDavModel) {
        this.id = data.id;
        this.name = data.name;
        this.server = data.server;
        this.username = data.username;
        this.password = data.password;
        this.addressBookPath = data.addressBookPath || "";
        this.useSsl = data.useSsl;
        this.contactCount = data.contactCount ?? 0;
        this.lastSynced = data.lastSynced ? new Date(data.lastSynced) : undefined;
        this.status = data.status || "connected";
        this.syncFrequency = data.syncFrequency || "";
    }

    static fromDatabaseObject(data: Tables<"carddav_connections">): CardDav {
        return new CardDav({
            id: data.id,
            name: data.name,
            server: data.server,
            username: data.username,
            password: data.password,
            addressBookPath: data.address_book_path,
            useSsl: data.use_ssl,
            contactCount: data.contact_count ?? 0,
            lastSynced: data.last_synced ? new Date(data.last_synced) : undefined,
            status: data.status as CardDavStatus || "connected",
            syncFrequency: data.sync_frequency || "",
        });
    }

    toDatabaseObject(): Omit<Tables<"carddav_connections">, "created_at" | "user_id"> {
        return {
            id: this.id,
            name: this.name,
            server: this.server,
            username: this.username,
            password: this.password,
            address_book_path: this.addressBookPath,
            use_ssl: this.useSsl,
            contact_count: this.contactCount,
            last_synced: this.lastSynced ? this.lastSynced.toISOString() : null,
            status: this.status,
            sync_frequency: this.syncFrequency,
            description: "", // Assuming description is not used in this model
            sync_groups: false, // Assuming sync_groups is not used in this model
            sync_all_contacts: true, // Assuming sync_all_contacts is not used in this model
            sync_photos: true
        };
    }
}
