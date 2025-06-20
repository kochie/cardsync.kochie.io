import { ImageLoaderProps } from "next/image";

const projectId = "jrxdpeflijzlytesvdwd"; // your supabase project id

export default function supabaseLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  if (src.startsWith("http")) {
    return `${src}?width=${width}&quality=${quality || 75}`;
  }

  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${
    quality || 75
  }`;
}
