"use server"

import { getPlaiceholder } from "plaiceholder";

export async function makePlaceholder(file: File): Promise<string> {
  const { base64 } = await getPlaiceholder(Buffer.from(await file.arrayBuffer()));
  return base64;
}