import { Tables } from "@/types/database.types";

export interface AddressBookModel {
    id: string;
    name?: string;
    description?: string;
    createdAt?: Date; // Optional, defaults to current date
    updatedAt?: Date; // Optional, defaults to current date
    url: string; // Optional URL for the address book, if applicable
    connectionId: string; // Connection ID for tracking
}

export class AddressBook {
    readonly #id: string;
    #name?: string;
    #description?: string;
    readonly #createdAt: Date;
    #updatedAt: Date;
    readonly #url: string; // Optional URL for the address book, if applicable
    readonly #connectionId: string; // Connection ID for tracking

    constructor(data: AddressBookModel) {
        this.#id = data.id || crypto.randomUUID();
        this.#name = data.name;
        this.#description = data.description;
        this.#createdAt = data.createdAt || new Date();
        this.#updatedAt = data.updatedAt || new Date();
        this.#url = data.url
        this.#connectionId = data.connectionId;
    }

    static fromDatabaseObject(data: Tables<"carddav_addressbooks">): AddressBook {
        return new AddressBook({
            id: data.id,
            name: data.display_name ?? undefined,
            // description: data.description,
            createdAt: new Date(data.created_at),
            url: data.url,
            connectionId: data.connection_id
        });
    }

    static toDatabaseObject(addressBook: AddressBook): Omit<Tables<"carddav_addressbooks">, "user_id"> {
        return {
            id: addressBook.id,
            display_name: addressBook.name ?? null,
            created_at: addressBook.createdAt.toISOString(),
            // description: addressBook.description,
            url: addressBook.url,
            connection_id: addressBook.#connectionId,
        }
    }


    get url(): string {
        return this.#url;
    }

    get id(): string {
        return this.#id;
    }

    get name(): string | undefined {
        return this.#name;
    }

    set name(value: string | undefined) {
        this.#name = value;
        this.#updatedAt = new Date();
    }

    get description(): string | undefined {
        return this.#description;
    }

    set description(value: string | undefined) {
        this.#description = value;
        this.#updatedAt = new Date();
    }

    get createdAt(): Date {
        return this.#createdAt;
    }

    get updatedAt(): Date {
        return this.#updatedAt;
    }
}