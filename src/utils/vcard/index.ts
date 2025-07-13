export function parseVCardTimestamp(vcardTimestamp: string) {
  // Format: YYYYMMDDTHHMMSSZ
  const isoString = vcardTimestamp.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
  return new Date(isoString);
}

export function toVCardTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}


export class VCardProperty {
  key: string;
  params: Record<string, string[]>;
  value: string;
  group?: string

  constructor(
    key: string,
    params: Record<string, string[]> = {},
    value: string,
    group?: string
  ) {
    this.key = key.toUpperCase();
    this.params = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k.toUpperCase(), Array.from(new Set(v))])
    );
    this.value = value;
    this.group = group
  }

  getParam(key: string): string | string[] | undefined {
    key = key.toUpperCase();
    return this.params[key];
  }

  appendParam(
    key: string,
    value: string | string[]
  ): void {
    key = key.toUpperCase();
    const values = Array.isArray(value) ? value : [value];
    if (this.params[key]) {
      this.params[key] = Array.from(new Set([
        ...this.params[key],
        ...values.map((v) => v.toLowerCase()),
      ]));
    } else {
      this.params[key] = values.map((v) => v.toLowerCase());
    }
  }

  removeParam(key: string, value: string|string[]): void {
    key = key.toUpperCase();
    if (this.params[key]) {
      const values = Array.isArray(value) ? value : [value];
      this.params[key] = this.params[key].filter(
        (v) => !values.includes(v.toLowerCase())
      );
      if (this.params[key].length === 0) {
        delete this.params[key];
      }
    }
  }

  deleteParam(key: string): void {
    key = key.toUpperCase();
    if (this.params[key]) {
      delete this.params[key];
    }
  }

  static parse(rawTextString: string) {
    const [keyWithParams, ...value] = rawTextString.split(":");
    const [keyAndGroup, ...rest] = keyWithParams.split(";");
    const keyParts = keyAndGroup.split(".");
    const key = keyParts.length > 1 ? keyParts[1] : keyParts[0];
    const group = keyParts.length > 1 ? keyParts[0] : undefined;

    const params: Record<string, string[]> = {};
    for (const param of rest) {
      const [paramKey, paramValue] = param.split("=");
      if (paramValue) {
        const values = paramValue.toLowerCase().split(","); // Handle multiple param values
        params[paramKey.toLowerCase()] = [
          ...(params[paramKey.toLowerCase()] ?? []),
          ...values,
        ];
      }
    }

    return new VCardProperty(key.toUpperCase(), params, value.join(":"), group);
  }

  stringify(): string {
    const paramsString = Object.entries(this.params)
      .map(([k, v]) => `${k.toUpperCase()}=${v.join(",")}`)
      .join(";");
    return `${this.key}${paramsString ? `;${paramsString}` : ""}:${this.value}`;
  }
}

export type VCardRecord = {
  [key: string]: VCardProperty[];
};

const singleValueFields = [
  "UID",
  "FN",
  "N",
  "ORG",
  "TITLE",
  "ROLE",
  "REV",
  "KIND",
  "BDAY"
] as const;

type SingleValueFields = (typeof singleValueFields)[number];
type MultiValueFields = Exclude<string, SingleValueFields>;

export class VCard {
  public records: Map<string, VCardProperty[]>;

  constructor(records: VCardRecord = {}) {
    this.records = new Map<string, VCardProperty[]>();
    for (const [key, properties] of Object.entries(records)) {
      this.records.set(
        key.toUpperCase(),
        properties.map((p) => new VCardProperty(p.key, p.params, p.value))
      );
    }
  }

  get(field: SingleValueFields): VCardProperty;
  get(field: MultiValueFields): VCardProperty[];
  get(field: string): VCardProperty | VCardProperty[] {
    field = field.toUpperCase();
    const value = this.records.get(field);
    if (!value) throw new Error(`Missing field: ${field}`);
    if (
      (singleValueFields as readonly string[]).includes(field.toUpperCase())
    ) {
      return value[0];
    }
    return value;
  }

  has(field: SingleValueFields): this is this & {
    records: { [P in typeof field]: [VCardProperty, ...VCardProperty[]] };
  };
  has(
    field: MultiValueFields
  ): this is this & { records: { [P in typeof field]: VCardProperty[] } };
  has(field: string): boolean {
    field = field.toUpperCase();
    return this.records.has(field);
  }

  set(
    field: string,
    value: string | string[],
    params: Record<string, string[]> = {}
  ): void {
    field = field.toUpperCase();
    const values = Array.isArray(value) ? value : [value];
    this.records.set(
      field,
      values.map((v) => new VCardProperty(field, params, v))
    );
  }

  add(
    field: string,
    value: string | string[],
    params: Record<string, string[]> = {}
  ) {
    field = field.toUpperCase();
    const values = Array.isArray(value) ? value : [value];
    if (this.records.has(field)) {
      const existing = this.records.get(field) || [];
      this.records.set(field, [
        ...existing,
        ...values.map((v) => new VCardProperty(field, params, v)),
      ]);
    } else {
      this.records.set(
        field,
        values.map((v) => new VCardProperty(field, params, v))
      );
    }
  }

  static parse(vcardText: string): VCard[] {
    const cards: VCardRecord[] = [];
    const rawLines = vcardText.split(/\r\n/);
    const lines: string[] = [];
    for (const rawLine of rawLines) {
      if (/^\s/.test(rawLine) && lines.length > 0) {
        lines[lines.length - 1] += rawLine.slice(1); // Continuation line
      } else {
        lines.push(rawLine.trim());
      }
    }

    let currentCard: VCardRecord | null = null;
    let currentGroups: Record<string, VCardProperty[]> = {}

    for (const line of lines) {
      if (line.toUpperCase() === "BEGIN:VCARD") {
        currentCard = {};
        currentGroups = {}
      } else if (line.toUpperCase() === "END:VCARD") {
        if (currentCard) {
          const normalizedGroups = VCard.normalizeGroups(currentGroups);
          for (const property of normalizedGroups) {
            if (!currentCard[property.key]) {
              currentCard[property.key] = [];
            }
            currentCard[property.key].push(property);
          }

          cards.push(currentCard);
          currentCard = null;
        }
      } else if (currentCard) {
        // Split key/params from value

        const property: VCardProperty = VCardProperty.parse(line);
        if (property.group) {
          if (!currentGroups[property.group]) {
            currentGroups[property.group] = [];
          }
          currentGroups[property.group].push(property);
          continue;
        }

        if (!Object.hasOwn(currentCard, property.key))
          currentCard[property.key] = [];
        currentCard[property.key].push(property);
      }
    }

    return cards.map((c) => new VCard(c));
  }

  stringify(): string {
    let result = "BEGIN:VCARD\r\n";
    result += "VERSION:4.0\r\n"; 
    const maxLineLength = 75;

    for (const [, properties] of this.records.entries()) {
      for (const property of properties) {
        const fullLine = property.stringify();
        if (fullLine.length <= maxLineLength) {
          result += fullLine + "\r\n";
        } else {
          // First line: up to 75 chars
          result += fullLine.slice(0, maxLineLength) + "\r\n";
          // Continuation lines: 74 chars + leading space
          let i = maxLineLength;
          while (i < fullLine.length) {
            const chunk = fullLine.slice(i, i + maxLineLength - 1);
            result += " " + chunk + "\r\n";
            i += maxLineLength - 1;
          }
        }
      }
    }

    result += "END:VCARD\r\n";
    return result;
  }

  static normalizeGroups(
    groups: Record<string, VCardProperty[]>
  ): VCardProperty[] {
    // These are values of vCard properties that are not in the vcard standard but are used by Apple Contacts
    // We will apply these as attributes to the normalized properties
    const attributes = [
      "X-ABLabel"
    ].map(attr => attr.toUpperCase());
    const normalized: VCardProperty[] = [];

    Object.entries(groups).forEach(([, properties]) => {
      // The properties will contain either real values 
      const normalizedProperties = properties.filter(p => !attributes.includes(p.key.toUpperCase()))
      const groupAttributes = properties.filter(p => attributes.includes(p.key.toUpperCase()));

      for (const property of normalizedProperties) {
        for (const attr of groupAttributes) {
          property.appendParam(attr.key, attr.value);
        }
      }

      normalized.push(...normalizedProperties)
    })

    return normalized;
  }
}
