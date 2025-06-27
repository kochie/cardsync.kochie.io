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

  constructor(
    key: string,
    params: Record<string, string[]> = {},
    value: string
  ) {
    this.key = key.toUpperCase();
    this.params = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k.toUpperCase(), v])
    );
    this.value = value;
  }

  static parse(rawTextString: string) {
    const [keyWithParams, ...value] = rawTextString.split(":");
    const [key, ...rest] = keyWithParams.split(";");

    const params: Record<string, string[]> = {};
    for (const param of rest) {
      const [paramKey, paramValue] = param.split("=");
      if (paramValue) {
        const values = paramValue.split(","); // Handle multiple param values
        params[paramKey.toLowerCase()] = [
          ...(params[paramKey.toLowerCase()] ?? []),
          ...values,
        ];
      }
    }

    return new VCardProperty(key.toUpperCase(), params, value.join(":"));
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

    for (const line of lines) {
      if (line.toUpperCase() === "BEGIN:VCARD") {
        currentCard = {};
      } else if (line.toUpperCase() === "END:VCARD") {
        if (currentCard) {
          cards.push(currentCard);
          currentCard = null;
        }
      } else if (currentCard) {
        // Split key/params from value

        const property: VCardProperty = VCardProperty.parse(line);
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
}
