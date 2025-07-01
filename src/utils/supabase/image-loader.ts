import { ImageLoaderProps } from "next/image";

export default function supabaseLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  if (src.startsWith("http")) {
    return `${src}?width=${width}&quality=${quality || 75}`;
  }

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${src}?width=${width}&quality=${
    quality || 75
  }`;
}
