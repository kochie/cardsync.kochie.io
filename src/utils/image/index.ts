import { VCardProperty } from "../vcard/vcard";

export type Photo =
  | { data: string; type: string; blurDataUrl?: string; url?: string }
  | { url: string; type: string; blurDataUrl?: string; data?: undefined };

export async function getImageData(image: VCardProperty): Promise<Photo> {
  const isEmbedded = !image.value.startsWith("http");

  let data: string | undefined;
  if (isEmbedded) {
    data = image.value;
  } else {
    try {
      const response = await fetch(image.value);
      const buffer = await response.arrayBuffer();
      data = Buffer.from(buffer).toString("base64");
    } catch (error) {
      console.error("Failed to fetch image:", error);
    }
  }

  let blurDataUrl: string | undefined;
  if (typeof window === "undefined" && data) {
    const { getPlaiceholder } = await import("plaiceholder");
    const { base64 } = await getPlaiceholder(Buffer.from(data, "base64"));
    blurDataUrl = base64;
  }

  if (isEmbedded) {
    return {
      data: image.value,
      type: image.params.type?.[0] ?? "image/jpeg",
      blurDataUrl,
    };
  } else {
    return {
      url: image.value,
      type: image.params.type?.[0] ?? "image/jpeg",
      blurDataUrl,
    };
  }
}
