import { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

async function generateHash(buffer: Buffer): Promise<string> {
  return createHash("sha256").update(buffer).digest("base64");
}

export async function uploadImageToSupabase(
  path: string,
  photoBuffer: Buffer,
  supabase: SupabaseClient
): Promise<void> {
  const doesExist = await supabase.storage.from("assets").exists(path);

  let alreadyUploaded = false;
  if (doesExist.data.valueOf() && !doesExist.error) {
    // Need to check the db metadata to find the hash of the photo
    const info = await supabase.storage.from("assets").info(path);
    if (info.error) {
      console.error(`Failed to get info for contact ${path}:`, info.error);
      return;
    }
    alreadyUploaded =
      info.data.metadata?.["hash"] === (await generateHash(photoBuffer));
  }

  if (!alreadyUploaded) {
    const { error } = await supabase.storage
      .from("assets")
      .upload(path, photoBuffer, {
        contentType: "image/jpeg",
        upsert: true,
        metadata: {
          hash: await generateHash(photoBuffer),
        },
      });
    if (error) {
      console.error(`Failed to upload photo for contact ${path}:`, error);
      throw new Error("Failed to upload photo");
    }
  }
}