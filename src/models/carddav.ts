
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
        public useSsl: boolean = true,
        public contactCount: number = 0,
        public lastSynced?: Date,
        public status: string = "connected",
        public syncFrequency: string = ""

    ) {
        this.id = id;
        this.name = name;
        this.server = server;
        this.username = username;
        this.password = password;
        this.addressBookPath = addressBookPath || "";
        this.useSsl = useSsl;
        this.contactCount = contactCount ?? 0;
        this.lastSynced = lastSynced ? new Date(lastSynced) : undefined;
        this.status = status || "connected";
        this.syncFrequency = syncFrequency || "";
    }
}
